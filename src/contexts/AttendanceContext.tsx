import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type {
  AppState,
  Subject,
  TimetableVersion,
  AttendanceEntry,
  Settings,
  SubjectStats,
  OverallStats,
  SlotStatus,
  SwappedAttendanceStatus,
} from '../types';
import {
  INITIAL_STATE,
  CURRENT_STATE_VERSION,
} from '../data/defaultData';
import {
  calculateSafeBunks,
  calculateClassesNeeded,
  formatDate,
  parseDate,
} from '../utils/attendanceMath';

const STORAGE_KEY = 'bunkmate_app_state_v2';
const LEGACY_STORAGE_KEY = 'attendly_app_state_v2';

interface AttendanceContextType {
  state: AppState;
  overallStats: OverallStats;
  subjectStatsMap: Record<string, SubjectStats>;
  subjectStatsList: SubjectStats[];
  activeTimetable: TimetableVersion;
  getTimetableForDate: (dateStr: string) => TimetableVersion;
  
  // Subject actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  
  // Timetable actions
  updateTimetableSlot: (day: string, slotIndex: number, subjectId: string | null) => void;
  addTimeSlot: (slotLabel: string) => void;
  removeTimeSlot: (slotIndex: number) => void;
  setTimetableEffectiveDate: (dateStr: string) => void;
  
  // Attendance actions
  setSlotAttendance: (
    dateStr: string,
    slotId: string,
    status: SlotStatus,
    actualSubjectId?: string,
    swappedActualStatus?: SwappedAttendanceStatus
  ) => void;
  addExtraClass: (
    dateStr: string,
    subjectId: string,
    timeLabel: string,
    status: 'present' | 'absent'
  ) => void;
  removeAttendanceEntry: (dateStr: string, slotId: string) => void;
  markDayBulk: (dateStr: string, status: 'present' | 'cancelled') => void;
  
  // Pending review days
  unloggedPastDays: Array<{ dateStr: string; dayName: string; scheduledCount: number }>;
  
  // Settings & Storage
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  completeOnboarding: (subjects: Subject[], timetable: TimetableVersion, settings: Partial<Settings>) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === CURRENT_STATE_VERSION) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse stored BunkMate data:', e);
    }
    return INITIAL_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  const getTimetableForDate = useMemo(() => {
    return (targetDateStr: string): TimetableVersion => {
      if (!state.timetables || state.timetables.length === 0) {
        return INITIAL_STATE.timetables[0];
      }
      const sorted = [...state.timetables].sort((a, b) =>
        (a.effectiveDate || '').localeCompare(b.effectiveDate || '')
      );
      let chosen = sorted[0];
      for (const tt of sorted) {
        if (tt.effectiveDate <= targetDateStr) {
          chosen = tt;
        } else {
          break;
        }
      }
      return chosen;
    };
  }, [state.timetables]);

  const activeTimetable = useMemo(() => {
    return state.timetables[state.timetables.length - 1] || INITIAL_STATE.timetables[0];
  }, [state.timetables]);

  const { subjectStatsMap, subjectStatsList, overallStats } = useMemo(() => {
    const statsMap: Record<string, SubjectStats> = {};

    state.subjects.forEach((sub) => {
      statsMap[sub.id] = {
        id: sub.id,
        name: sub.name,
        code: sub.code || '',
        type: sub.type,
        attended: Number(sub.baseAttended) || 0,
        total: Number(sub.baseTotal) || 0,
        percentage: 0,
        targetPercent: sub.targetPercentage || state.settings.defaultTargetPercent || 75,
        floorPercent: sub.floorPercentage || state.settings.defaultFloorPercent || 60,
        status: 'safe',
        safeBunks: 0,
        classesNeededTarget: 0,
        classesNeededFloor: 0,
        bunkExplanation: '',
      };
    });

    Object.keys(state.logs).forEach((dateStr) => {
      const entries = state.logs[dateStr];
      if (!Array.isArray(entries)) return;

      entries.forEach((entry) => {
        if (!entry || !entry.status) return;

        if (entry.status === 'present') {
          const sid = entry.actualSubjectId || entry.scheduledSubjectId;
          if (sid && statsMap[sid]) {
            statsMap[sid].attended += 1;
            statsMap[sid].total += 1;
          }
        } else if (entry.status === 'absent') {
          const sid = entry.actualSubjectId || entry.scheduledSubjectId;
          if (sid && statsMap[sid]) {
            statsMap[sid].total += 1;
          }
        } else if (entry.status === 'swapped') {
          const actualSid = entry.actualSubjectId;
          if (actualSid && statsMap[actualSid]) {
            if (entry.swappedActualStatus === 'present') {
              statsMap[actualSid].attended += 1;
              statsMap[actualSid].total += 1;
            } else if (entry.swappedActualStatus === 'absent') {
              statsMap[actualSid].total += 1;
            }
          }
        }
      });
    });

    let totalAttended = 0;
    let totalConducted = 0;
    let atRiskSubjectsCount = 0;
    let warningSubjectsCount = 0;
    const detentionReasons: string[] = [];

    const statsList: SubjectStats[] = Object.values(statsMap).map((sub) => {
      totalAttended += sub.attended;
      totalConducted += sub.total;

      const pct = sub.total > 0 ? (sub.attended / sub.total) * 100 : 100;
      sub.percentage = Number(pct.toFixed(2));

      sub.safeBunks = calculateSafeBunks(sub.attended, sub.total, sub.targetPercent);
      sub.classesNeededTarget = calculateClassesNeeded(sub.attended, sub.total, sub.targetPercent);
      sub.classesNeededFloor = calculateClassesNeeded(sub.attended, sub.total, sub.floorPercent);

      if (sub.total === 0) {
        sub.status = 'safe';
        sub.bunkExplanation = 'Mid-semester baseline start (0 conducted classes)';
      } else if (pct < sub.floorPercent) {
        sub.status = 'critical';
        atRiskSubjectsCount++;
        detentionReasons.push(
          `${sub.name} is at ${sub.percentage}%, below mandatory floor of ${sub.floorPercent}%.`
        );
        sub.bunkExplanation = `Need ${sub.classesNeededTarget} consecutive classes to reach ${sub.targetPercent}%.`;
      } else if (pct < sub.targetPercent) {
        sub.status = 'warning';
        warningSubjectsCount++;
        sub.bunkExplanation = `Need ${sub.classesNeededTarget} consecutive classes to reach ${sub.targetPercent}%.`;
      } else {
        sub.status = 'safe';
        sub.bunkExplanation =
          sub.safeBunks === 0
            ? 'On edge: Cannot miss next class without falling below target.'
            : `Can safely bunk ${sub.safeBunks} class${sub.safeBunks > 1 ? 'es' : ''}.`;
      }

      return sub;
    });

    const totalMissed = Math.max(0, totalConducted - totalAttended);
    const overallPct =
      totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;

    const overallSafeBunks = calculateSafeBunks(
      totalAttended,
      totalConducted,
      state.settings.defaultTargetPercent
    );
    const overallClassesNeeded = calculateClassesNeeded(
      totalAttended,
      totalConducted,
      state.settings.defaultTargetPercent
    );

    let overallStatus: 'safe' | 'warning' | 'critical' = 'safe';
    let isDetentionWarning = false;

    if (totalConducted > 0 && overallPct < state.settings.defaultFloorPercent) {
      overallStatus = 'critical';
      isDetentionWarning = true;
      detentionReasons.unshift(
        `Overall aggregate is ${overallPct.toFixed(1)}%, below minimum ${state.settings.defaultFloorPercent}% floor.`
      );
    } else if (totalConducted > 0 && overallPct < state.settings.defaultTargetPercent) {
      overallStatus = 'warning';
      isDetentionWarning = true;
      detentionReasons.unshift(
        `Overall aggregate is ${overallPct.toFixed(1)}%, below required ${state.settings.defaultTargetPercent}% target.`
      );
    }

    if (atRiskSubjectsCount > 0) {
      isDetentionWarning = true;
    }

    const overall: OverallStats = {
      totalAttended,
      totalConducted,
      totalMissed,
      percentage: Number(overallPct.toFixed(2)),
      targetPercent: state.settings.defaultTargetPercent,
      floorPercent: state.settings.defaultFloorPercent,
      safeBunks: overallSafeBunks,
      classesNeeded: overallClassesNeeded,
      status: overallStatus,
      atRiskSubjectsCount,
      warningSubjectsCount,
      isDetentionWarning,
      detentionReasons,
    };

    return {
      subjectStatsMap: statsMap,
      subjectStatsList: statsList,
      overallStats: overall,
    };
  }, [state]);

  const unloggedPastDays = useMemo(() => {
    if (!state.timetables || state.timetables.length === 0) return [];
    const sorted = [...state.timetables].sort((a, b) =>
      (a.effectiveDate || '').localeCompare(b.effectiveDate || '')
    );
    const startStr = sorted[0]?.effectiveDate;
    if (!startStr) return [];

    const startDate = parseDate(startStr);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    if (startDate > yesterday) return [];

    const list: Array<{ dateStr: string; dayName: string; scheduledCount: number }> = [];
    const cur = new Date(startDate);

    while (cur <= yesterday) {
      const dateStr = formatDate(cur);
      const dayName = cur.toLocaleDateString('en-US', { weekday: 'long' });

      if (dayName !== 'Sunday') {
        const tt = getTimetableForDate(dateStr);
        if (tt?.grid?.[dayName]) {
          const scheduledCount = tt.grid[dayName].filter((id) => Boolean(id)).length;
          if (scheduledCount > 0) {
            const logs = state.logs[dateStr];
            if (!logs || logs.length === 0) {
              list.push({ dateStr, dayName, scheduledCount });
            }
          }
        }
      }
      cur.setDate(cur.getDate() + 1);
    }

    return list;
  }, [state.timetables, state.logs, getTimetableForDate]);

  const addSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
    };
    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      timetables: prev.timetables.map((tt) => {
        const newGrid: Record<string, (string | null)[]> = {};
        Object.keys(tt.grid).forEach((day) => {
          newGrid[day] = tt.grid[day].map((sid) => (sid === id ? null : sid));
        });
        return { ...tt, grid: newGrid };
      }),
    }));
  };

  const updateTimetableSlot = (day: string, slotIndex: number, subjectId: string | null) => {
    setState((prev) => {
      const currentTT = prev.timetables[prev.timetables.length - 1];
      const newGrid = { ...currentTT.grid };
      if (!newGrid[day]) {
        newGrid[day] = [];
      }
      const updatedDaySlots = [...newGrid[day]];
      updatedDaySlots[slotIndex] = subjectId;
      newGrid[day] = updatedDaySlots;

      const updatedTTs = [...prev.timetables];
      updatedTTs[updatedTTs.length - 1] = {
        ...currentTT,
        grid: newGrid,
      };

      return {
        ...prev,
        timetables: updatedTTs,
      };
    });
  };

  const addTimeSlot = (slotLabel: string) => {
    setState((prev) => {
      const currentTT = prev.timetables[prev.timetables.length - 1];
      const newSlots = [...currentTT.slots, slotLabel];
      const newGrid: Record<string, (string | null)[]> = {};

      Object.keys(currentTT.grid).forEach((day) => {
        newGrid[day] = [...currentTT.grid[day], null];
      });

      const updatedTTs = [...prev.timetables];
      updatedTTs[updatedTTs.length - 1] = {
        ...currentTT,
        slots: newSlots,
        grid: newGrid,
      };

      return {
        ...prev,
        timetables: updatedTTs,
      };
    });
  };

  const removeTimeSlot = (slotIndex: number) => {
    setState((prev) => {
      const currentTT = prev.timetables[prev.timetables.length - 1];
      if (currentTT.slots.length <= 1) return prev;

      const newSlots = currentTT.slots.filter((_, i) => i !== slotIndex);
      const newGrid: Record<string, (string | null)[]> = {};

      Object.keys(currentTT.grid).forEach((day) => {
        newGrid[day] = currentTT.grid[day].filter((_, i) => i !== slotIndex);
      });

      const updatedTTs = [...prev.timetables];
      updatedTTs[updatedTTs.length - 1] = {
        ...currentTT,
        slots: newSlots,
        grid: newGrid,
      };

      return {
        ...prev,
        timetables: updatedTTs,
      };
    });
  };

  const setTimetableEffectiveDate = (dateStr: string) => {
    setState((prev) => {
      const currentTT = prev.timetables[prev.timetables.length - 1];
      const updatedTTs = [...prev.timetables];
      updatedTTs[updatedTTs.length - 1] = {
        ...currentTT,
        effectiveDate: dateStr,
      };
      return { ...prev, timetables: updatedTTs };
    });
  };

  const setSlotAttendance = (
    dateStr: string,
    slotId: string,
    status: SlotStatus,
    actualSubjectId?: string,
    swappedActualStatus?: SwappedAttendanceStatus
  ) => {
    setState((prev) => {
      const dayLogs = prev.logs[dateStr] ? [...prev.logs[dateStr]] : [];
      const entryIdx = dayLogs.findIndex((e) => e.slotId === slotId);

      // Extra / compensatory classes have synthetic slot ids. Update the
      // existing row in place so its subject and time label are never lost.
      if (slotId.startsWith('extra_') && entryIdx >= 0) {
        dayLogs[entryIdx] = {
          ...dayLogs[entryIdx],
          status,
          isExtra: true,
        };
        return { ...prev, logs: { ...prev.logs, [dateStr]: dayLogs } };
      }

      const dt = parseDate(dateStr);
      const dayName = dt.toLocaleDateString('en-US', { weekday: 'long' });
      const tt = getTimetableForDate(dateStr);
      const slotIndex = parseInt(slotId.replace('slot-', ''), 10);
      const scheduledSub = !Number.isNaN(slotIndex) && tt?.grid?.[dayName]
        ? tt.grid[dayName][slotIndex]
        : null;

      const timeLabel = !Number.isNaN(slotIndex) && tt?.slots?.[slotIndex]
        ? tt.slots[slotIndex]
        : 'Slot';

      const finalActualSubId =
        status === 'swapped'
          ? actualSubjectId || scheduledSub || prev.subjects[0]?.id || ''
          : scheduledSub || actualSubjectId || '';

      const updatedEntry: AttendanceEntry = {
        id: entryIdx >= 0 ? dayLogs[entryIdx].id : 'entry_' + Math.random().toString(36).substring(2, 9),
        slotId,
        timeLabel: entryIdx >= 0 ? dayLogs[entryIdx].timeLabel : timeLabel,
        scheduledSubjectId: scheduledSub,
        actualSubjectId: finalActualSubId,
        status,
        swappedActualStatus: status === 'swapped' ? swappedActualStatus || 'present' : undefined,
        isExtra: false,
      };

      if (entryIdx >= 0) {
        dayLogs[entryIdx] = updatedEntry;
      } else {
        dayLogs.push(updatedEntry);
      }

      return {
        ...prev,
        logs: {
          ...prev.logs,
          [dateStr]: dayLogs,
        },
      };
    });
  };

  const addExtraClass = (
    dateStr: string,
    subjectId: string,
    timeLabel: string,
    status: 'present' | 'absent'
  ) => {
    setState((prev) => {
      const dayLogs = prev.logs[dateStr] ? [...prev.logs[dateStr]] : [];
      const newEntry: AttendanceEntry = {
        id: 'entry_' + Math.random().toString(36).substring(2, 9),
        slotId: 'extra_' + Math.random().toString(36).substring(2, 9),
        timeLabel: timeLabel || 'Extra Class',
        scheduledSubjectId: null,
        actualSubjectId: subjectId,
        status,
        isExtra: true,
      };

      return {
        ...prev,
        logs: {
          ...prev.logs,
          [dateStr]: [...dayLogs, newEntry],
        },
      };
    });
  };

  const removeAttendanceEntry = (dateStr: string, slotId: string) => {
    setState((prev) => {
      if (!prev.logs[dateStr]) return prev;
      return {
        ...prev,
        logs: {
          ...prev.logs,
          [dateStr]: prev.logs[dateStr].filter((e) => e.slotId !== slotId),
        },
      };
    });
  };

  const markDayBulk = (dateStr: string, status: 'present' | 'cancelled') => {
    setState((prev) => {
      const dt = parseDate(dateStr);
      const dayName = dt.toLocaleDateString('en-US', { weekday: 'long' });
      const tt = getTimetableForDate(dateStr);
      if (!tt?.grid?.[dayName]) return prev;

      // Keep any extra / compensatory classes already logged for the day —
      // a bulk action should only rewrite the scheduled periods.
      const extraLogs = (prev.logs[dateStr] || []).filter((entry) => entry.isExtra);
      const newLogs: AttendanceEntry[] = [];
      tt.grid[dayName].forEach((subId, idx) => {
        if (subId) {
          newLogs.push({
            id: 'entry_' + Math.random().toString(36).substring(2, 9),
            slotId: `slot-${idx}`,
            timeLabel: tt.slots[idx] || `Period ${idx + 1}`,
            scheduledSubjectId: subId,
            actualSubjectId: subId,
            status,
            isExtra: false,
          });
        }
      });

      return {
        ...prev,
        logs: {
          ...prev.logs,
          [dateStr]: [...newLogs, ...extraLogs],
        },
      };
    });
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  };

  const exportDataJSON = () => {
    return JSON.stringify(state, null, 2);
  };

  const importDataJSON = (jsonStr: string): boolean => {
    try {
      if (!jsonStr || typeof jsonStr !== 'string' || jsonStr.trim() === '') {
        return false;
      }
      const parsed = JSON.parse(jsonStr);
      if (
        parsed &&
        typeof parsed === 'object' &&
        Array.isArray(parsed.subjects) &&
        parsed.settings &&
        typeof parsed.settings === 'object' &&
        typeof parsed.settings.studentName === 'string' &&
        typeof parsed.settings.defaultTargetPercent === 'number'
      ) {
        setState({
          version: CURRENT_STATE_VERSION,
          isConfigured: true,
          settings: {
            ...INITIAL_STATE.settings,
            ...parsed.settings,
          },
          subjects: parsed.subjects.map((s: any) => ({
            id: s.id || 'sub_' + Math.random().toString(36).substring(2, 9),
            name: String(s.name || 'Untitled Course'),
            code: String(s.code || ''),
            type: s.type === 'Lab' ? 'Lab' : 'Theory',
            baseAttended: Number(s.baseAttended) || 0,
            baseTotal: Number(s.baseTotal) || 0,
            targetPercentage: s.targetPercentage ? Number(s.targetPercentage) : undefined,
            floorPercentage: s.floorPercentage ? Number(s.floorPercentage) : undefined,
            weeklyFrequency: s.weeklyFrequency ? Number(s.weeklyFrequency) : 4,
          })),
          timetables: Array.isArray(parsed.timetables) && parsed.timetables.length > 0
            ? parsed.timetables
            : INITIAL_STATE.timetables,
          logs: parsed.logs && typeof parsed.logs === 'object' ? parsed.logs : {},
        });
        return true;
      }
    } catch (e) {
      console.error('Import validation failed:', e);
    }
    return false;
  };

  const completeOnboarding = (
    subjects: Subject[],
    timetable: TimetableVersion,
    settingsUpdates: Partial<Settings>
  ) => {
    setState((prev) => ({
      ...prev,
      isConfigured: true,
      subjects,
      timetables: [timetable],
      settings: { ...prev.settings, ...settingsUpdates },
    }));
  };

  return (
    <AttendanceContext.Provider
      value={{
        state,
        overallStats,
        subjectStatsMap,
        subjectStatsList,
        activeTimetable,
        getTimetableForDate,
        addSubject,
        updateSubject,
        deleteSubject,
        updateTimetableSlot,
        addTimeSlot,
        removeTimeSlot,
        setTimetableEffectiveDate,
        setSlotAttendance,
        addExtraClass,
        removeAttendanceEntry,
        markDayBulk,
        unloggedPastDays,
        updateSettings,
        resetAllData,
        exportDataJSON,
        importDataJSON,
        completeOnboarding,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
