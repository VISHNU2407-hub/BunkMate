import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Check,
  X,
  Ban,
  Repeat,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAttendance } from '../contexts/AttendanceContext';
import { formatDate, parseDate, DAYS_OF_WEEK } from '../utils/attendanceMath';
import { BunkMateMascot } from '../components/BunkMateMascot';
import type { SlotStatus, SwappedAttendanceStatus } from '../types';

export const Attendance: React.FC = () => {
  const {
    state,
    getTimetableForDate,
    setSlotAttendance,
    addExtraClass,
    removeAttendanceEntry,
    markDayBulk,
  } = useAttendance();

  const location = useLocation();
  const initialDate =
    (location.state as { date?: string } | null)?.date || formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');

  const [isExtraModalOpen, setIsExtraModalOpen] = useState(false);
  const [extraSubjectId, setExtraSubjectId] = useState<string>(state.subjects[0]?.id || '');
  const [extraTimeLabel, setExtraTimeLabel] = useState<string>('04:00 - 05:00 (Compensatory)');
  const [extraStatus, setExtraStatus] = useState<'present' | 'absent'>('present');

  const dt = parseDate(selectedDate);
  const dayName = DAYS_OF_WEEK[dt.getDay()];
  const isToday = selectedDate === formatDate(new Date());

  const tt = getTimetableForDate(selectedDate);
  const scheduledSlots = tt?.grid?.[dayName] || [];
  const dayLogs = state.logs[selectedDate] || [];
  const presentCount = dayLogs.filter(
    (l) =>
      l.status === 'present' ||
      (l.status === 'swapped' && l.swappedActualStatus === 'present')
  ).length;
  const absentCount = dayLogs.filter(
    (l) => l.status === 'absent' || (l.status === 'swapped' && l.swappedActualStatus === 'absent')
  ).length;

  const shiftDate = (deltaDays: number) => {
    const cur = parseDate(selectedDate);
    cur.setDate(cur.getDate() + deltaDays);
    setSelectedDate(formatDate(cur));
  };

  const displayItems: Array<{
    slotId: string;
    timeLabel: string;
    scheduledSubjectId: string | null;
    actualSubjectId: string;
    status: SlotStatus | 'unmarked';
    swappedActualStatus?: SwappedAttendanceStatus;
    isExtra: boolean;
  }> = [];

  scheduledSlots.forEach((subId, idx) => {
    if (!subId) return;
    const slotKey = `slot-${idx}`;
    const logged = dayLogs.find((l) => l.slotId === slotKey);
    const timeLabel = tt.slots[idx] || `Period ${idx + 1}`;

    displayItems.push({
      slotId: slotKey,
      timeLabel,
      scheduledSubjectId: subId,
      actualSubjectId: logged?.actualSubjectId || subId,
      status: logged?.status || 'unmarked',
      swappedActualStatus: logged?.swappedActualStatus || 'present',
      isExtra: false,
    });
  });

  dayLogs.forEach((entry) => {
    if (entry.isExtra) {
      displayItems.push({
        slotId: entry.slotId,
        timeLabel: entry.timeLabel,
        scheduledSubjectId: null,
        actualSubjectId: entry.actualSubjectId,
        status: entry.status,
        swappedActualStatus: entry.swappedActualStatus,
        isExtra: true,
      });
    }
  });

  const filteredItems = displayItems.filter((item) => {
    if (filterSubjectId === 'all') return true;
    return item.actualSubjectId === filterSubjectId || item.scheduledSubjectId === filterSubjectId;
  });

  const handleExtraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subjectId = extraSubjectId || state.subjects[0]?.id;
    if (!subjectId) return;
    addExtraClass(selectedDate, subjectId, extraTimeLabel, extraStatus);
    setIsExtraModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200/70 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Attendance Logging
              </h1>
              <span
                className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold border ${
                  isToday
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {isToday ? 'Today' : 'Selected day'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {dayName}, {dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              {' · '}
              <span className="font-bold text-emerald-600">{presentCount} present</span>
              {' · '}
              <span className="font-bold text-red-500">{absentCount} absent</span>
            </p>
          </div>

          <button
            onClick={() => {
              if (!state.subjects.some((s) => s.id === extraSubjectId)) {
                setExtraSubjectId(state.subjects[0]?.id || '');
              }
              setIsExtraModalOpen(true);
            }}
            disabled={state.subjects.length === 0}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-sm shadow-indigo-500/20 transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Extra Class</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <button
              onClick={() => shiftDate(-1)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
              aria-label="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
              aria-label="Selected date"
              className="text-xs font-bold bg-transparent px-1 py-1.5 text-slate-800 focus:outline-none tabular"
            />

            <button
              onClick={() => shiftDate(1)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
              aria-label="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(formatDate(new Date()))}
            className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
          >
            Jump to Today
          </button>
        </div>
      </div>

      <div className="surface-flat p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <label className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Filter</span>
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="min-w-0 flex-1 lg:flex-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="all">All subjects</option>
            {state.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.type[0]})
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => markDayBulk(selectedDate, 'present')}
            className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-bold transition"
          >
            All present
          </button>
          <button
            onClick={() => markDayBulk(selectedDate, 'cancelled')}
            className="px-3 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold transition"
          >
            Holiday / cancelled
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {dayName === 'Sunday' && filteredItems.length === 0 ? (
          <div className="text-center py-14 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 w-full">
            <div className="flex justify-center mb-3">
              <BunkMateMascot size="md" variant="still" />
            </div>
            <h3 className="text-base font-extrabold text-[#171642] dark:text-slate-200">
              Sunday — Enjoy Your Rest! ☀️
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No regular lectures scheduled. You can still tap "+ Extra Class" above if a special session was held.
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-14 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 w-full">
            <div className="flex justify-center mb-3">
              <BunkMateMascot size="md" variant="still" />
            </div>
            <h3 className="text-base font-extrabold text-[#171642] dark:text-slate-200">
              No Classes Scheduled for {dayName}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Free day on your schedule. Tap "+ Extra Class" to record compensatory sessions anytime.
            </p>
          </div>
        ) : (
          filteredItems.map((slot) => {
            const scheduledSub = state.subjects.find((s) => s.id === slot.scheduledSubjectId);
            const actualSub = state.subjects.find((s) => s.id === slot.actualSubjectId);
            const isSwapped = slot.status === 'swapped';

            return (
              <div
                key={slot.slotId}
                className="p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition hover:shadow"
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-mono font-semibold whitespace-nowrap mt-0.5 tabular">
                      {slot.timeLabel}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {slot.isExtra && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mr-1">
                              [Extra Lecture]
                            </span>
                          )}
                          {actualSub?.name || scheduledSub?.name || 'Class'}
                        </h4>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            (actualSub?.type || scheduledSub?.type) === 'Lab'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {actualSub?.type || scheduledSub?.type || 'Theory'}
                        </span>
                      </div>

                      {isSwapped ? (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold flex items-center gap-1">
                          <Repeat className="w-3.5 h-3.5" />
                          Swapped: Scheduled <em>{scheduledSub?.name}</em> cancelled (0/0), conducted{' '}
                          <em>{actualSub?.name}</em>.
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          {slot.isExtra ? 'Unscheduled lecture' : 'Timetable Regular Period'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-1.5 w-full xl:w-auto shrink-0">
                    <button
                      onClick={() => setSlotAttendance(selectedDate, slot.slotId, 'present')}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all tap-bounce flex items-center justify-center gap-1 ${
                        slot.status === 'present'
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30 scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Present (+1/+1)</span>
                    </button>

                    <button
                      onClick={() => setSlotAttendance(selectedDate, slot.slotId, 'absent')}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all tap-bounce flex items-center justify-center gap-1 ${
                        slot.status === 'absent'
                          ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-500/30 scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-300'
                      }`}
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Absent (+0/+1)</span>
                    </button>

                    <button
                      onClick={() => setSlotAttendance(selectedDate, slot.slotId, 'cancelled')}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all tap-bounce flex items-center justify-center gap-1 ${
                        slot.status === 'cancelled'
                          ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-sm scale-[1.02]'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancelled (0/0)</span>
                    </button>

                    {!slot.isExtra ? (
                      <button
                        onClick={() => {
                          if (slot.status === 'swapped') {
                            setSlotAttendance(selectedDate, slot.slotId, 'cancelled');
                          } else {
                            const candidate =
                              state.subjects.find((s) => s.id !== slot.scheduledSubjectId) ||
                              state.subjects[0];
                            setSlotAttendance(
                              selectedDate,
                              slot.slotId,
                              'swapped',
                              candidate?.id,
                              'present'
                            );
                          }
                        }}
                        className={`px-2.5 py-2 rounded-xl text-[11px] font-bold transition-all tap-bounce flex items-center justify-center gap-1 ${
                          slot.status === 'swapped'
                            ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30 scale-[1.02]'
                            : 'bg-slate-50 dark:bg-slate-800 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                        }`}
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Shifted / Swapped</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => removeAttendanceEntry(selectedDate, slot.slotId)}
                        className="px-2.5 py-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 border border-slate-200 transition-all tap-press flex items-center justify-center gap-1 text-[11px] font-bold"
                        title="Remove extra class"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>

                {isSwapped && (
                  <div className="mt-3.5 pt-3.5 border-t border-slate-100">
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          Which subject was actually taught?
                        </span>
                        <select
                          value={slot.actualSubjectId}
                          onChange={(e) =>
                            setSlotAttendance(
                              selectedDate,
                              slot.slotId,
                              'swapped',
                              e.target.value,
                              slot.swappedActualStatus
                            )
                          }
                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none"
                        >
                          {state.subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Your Attendance:
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSlotAttendance(
                              selectedDate,
                              slot.slotId,
                              'swapped',
                              slot.actualSubjectId,
                              'present'
                            )
                          }
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            slot.swappedActualStatus === 'present'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Present (+1/+1)
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSlotAttendance(
                              selectedDate,
                              slot.slotId,
                              'swapped',
                              slot.actualSubjectId,
                              'absent'
                            )
                          }
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            slot.swappedActualStatus === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Absent (+0/+1)
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {isExtraModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              <span>Log Extra / Compensatory Class</span>
            </h3>

            <form onSubmit={handleExtraSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject
                </label>
                <select
                  value={extraSubjectId}
                  onChange={(e) => setExtraSubjectId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                >
                  {state.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Time Label
                </label>
                <input
                  type="text"
                  value={extraTimeLabel}
                  onChange={(e) => setExtraTimeLabel(e.target.value)}
                  placeholder="e.g. 04:00 - 05:00"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setExtraStatus('present')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      extraStatus === 'present'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Present (+1/+1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtraStatus('absent')}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      extraStatus === 'absent'
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Absent (+0/+1)
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExtraModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Add Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
