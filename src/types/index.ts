export type SubjectType = 'Theory' | 'Lab';

export interface Subject {
  id: string;
  name: string;
  code?: string;
  type: SubjectType;
  baseAttended?: number;
  baseTotal?: number;
  targetPercentage?: number; // Custom target override or defaults to global
  floorPercentage?: number;  // Custom floor override or defaults to global
  color?: string;
}

export type SlotStatus = 'present' | 'absent' | 'cancelled' | 'swapped';
export type SwappedAttendanceStatus = 'present' | 'absent';

export interface AttendanceEntry {
  id: string;
  slotId: string;
  timeLabel: string;
  scheduledSubjectId: string | null; // null if extra unscheduled class
  actualSubjectId: string;           // actual subject conducted
  status: SlotStatus;
  swappedActualStatus?: SwappedAttendanceStatus;
  isExtra?: boolean;
  notes?: string;
}

export interface TimetableVersion {
  versionId: number;
  effectiveDate: string; // 'YYYY-MM-DD'
  slots: string[];       // e.g. ['09:00 - 10:00', '10:00 - 11:00', ...]
  grid: {
    [day: string]: (string | null)[]; // Monday: [subId1, null, subId2, ...]
  };
}

export interface Settings {
  studentName: string;
  collegeName: string;
  semester: string;
  academicYear: string;
  defaultTargetPercent: number; // e.g. 75
  defaultFloorPercent: number;  // e.g. 60
}

export interface AppState {
  version: number;
  isConfigured: boolean;
  settings: Settings;
  subjects: Subject[];
  timetables: TimetableVersion[];
  // date string 'YYYY-MM-DD' -> AttendanceEntry[]
  logs: Record<string, AttendanceEntry[]>;
}

export interface SubjectStats {
  id: string;
  name: string;
  code: string;
  type: SubjectType;
  attended: number;
  total: number;
  percentage: number;
  targetPercent: number;
  floorPercent: number;
  status: 'safe' | 'warning' | 'critical';
  safeBunks: number;
  classesNeededTarget: number;
  classesNeededFloor: number;
  bunkExplanation: string;
}

export interface OverallStats {
  totalAttended: number;
  totalConducted: number;
  totalMissed: number;
  percentage: number;
  targetPercent: number;
  floorPercent: number;
  safeBunks: number;
  classesNeeded: number;
  status: 'safe' | 'warning' | 'critical';
  atRiskSubjectsCount: number;
  warningSubjectsCount: number;
  isDetentionWarning: boolean;
  detentionReasons: string[];
}
