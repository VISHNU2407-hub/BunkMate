import type { AppState } from '../types';
import { formatDate } from '../utils/attendanceMath';

export const CURRENT_STATE_VERSION = 2;

export const INITIAL_STATE: AppState = {
  version: CURRENT_STATE_VERSION,
  isConfigured: false,
  settings: {
    studentName: '',
    collegeName: '',
    semester: '',
    academicYear: '2026-2027',
    defaultTargetPercent: 75,
    defaultFloorPercent: 60,
  },
  subjects: [],
  timetables: [
    {
      versionId: 1,
      effectiveDate: formatDate(new Date()),
      slots: [
        '09:00 - 10:00',
        '10:00 - 11:00',
        '11:15 - 12:15',
        '01:00 - 02:00',
        '02:00 - 03:00',
      ],
      grid: {
        Monday: [null, null, null, null, null],
        Tuesday: [null, null, null, null, null],
        Wednesday: [null, null, null, null, null],
        Thursday: [null, null, null, null, null],
        Friday: [null, null, null, null, null],
        Saturday: [null, null, null, null, null],
      },
    },
  ],
  logs: {},
};
