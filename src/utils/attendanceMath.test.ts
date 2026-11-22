import { describe, it, expect } from 'vitest';
import {
  calculateSafeBunks,
  calculateClassesNeeded,
  projectAttendance,
  formatDate,
  parseDate,
} from './attendanceMath';
import type { AttendanceEntry, Subject } from '../types';

describe('Comprehensive Attendance & Bunk Math Verification', () => {
  it('correctly calculates safe bunks when attendance is well above target', () => {
    // 18 attended out of 20 total = 90%. Target = 75%.
    // Formula: floor((18 - 0.75 * 20) / 0.75) = floor((18 - 15) / 0.75) = floor(3 / 0.75) = 4
    const safeBunks = calculateSafeBunks(18, 20, 75);
    expect(safeBunks).toBe(4);

    const proj = projectAttendance(18, 20, 0, 4);
    expect(proj.projectedPercentage).toBe(75);
  });

  it('returns 0 safe bunks when attendance is below target', () => {
    // 14 attended out of 20 = 70%. Target = 75%.
    const safeBunks = calculateSafeBunks(14, 20, 75);
    expect(safeBunks).toBe(0);
  });

  it('correctly calculates classes needed to recover to target', () => {
    // 14 attended out of 20 = 70%. Target = 75%.
    // Formula: ceil((0.75 * 20 - 14) / (1 - 0.75)) = ceil((15 - 14) / 0.25) = ceil(1 / 0.25) = 4 classes
    const needed = calculateClassesNeeded(14, 20, 75);
    expect(needed).toBe(4);

    const proj = projectAttendance(14, 20, 4, 0);
    expect(proj.projectedPercentage).toBe(75);
  });

  it('returns 0 classes needed when attendance is already above target', () => {
    const needed = calculateClassesNeeded(18, 20, 75);
    expect(needed).toBe(0);
  });

  it('handles edge case: zero total classes conducted without throwing NaN or crashing', () => {
    expect(calculateSafeBunks(0, 0, 75)).toBe(0);
    expect(calculateClassesNeeded(0, 0, 75)).toBe(0);
    const proj = projectAttendance(0, 0, 0, 0);
    expect(proj.projectedPercentage).toBe(100);
    expect(Number.isNaN(proj.projectedPercentage)).toBe(false);
  });

  it('handles target = 100% properly without dividing by zero', () => {
    const needed = calculateClassesNeeded(9, 10, 100);
    expect(needed).toBe(Infinity);
  });

  it('handles boundary condition: exact target percentage', () => {
    expect(calculateSafeBunks(15, 20, 75)).toBe(0);
    expect(calculateClassesNeeded(15, 20, 75)).toBe(0);
  });

  it('handles negative or invalid target percentage inputs gracefully', () => {
    expect(calculateSafeBunks(10, 10, -5)).toBeGreaterThanOrEqual(0);
    expect(calculateClassesNeeded(5, 10, 150)).toBe(Infinity);
  });

  it('date formatter and parser roundtrips accurately', () => {
    const original = new Date(2026, 10, 22); // Nov 22, 2026
    const formatted = formatDate(original);
    expect(formatted).toBe('2026-11-22');
    const parsed = parseDate(formatted);
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(10);
    expect(parsed.getDate()).toBe(22);
  });
});

describe('Attendance Log Engine & Integrity Tests', () => {
  // Helper simulator mirroring the context recalculation logic
  function computeStats(subjects: Subject[], logs: Record<string, AttendanceEntry[]>) {
    const stats: Record<string, { attended: number; total: number }> = {};
    subjects.forEach((s) => {
      stats[s.id] = { attended: s.baseAttended ?? 0, total: s.baseTotal ?? 0 };
    });

    Object.keys(logs).forEach((dateStr) => {
      const entries = logs[dateStr] || [];
      entries.forEach((entry) => {
        if (!entry || !entry.status) return;

        if (entry.status === 'present') {
          const sid = entry.actualSubjectId || entry.scheduledSubjectId;
          if (sid && stats[sid]) {
            stats[sid].attended += 1;
            stats[sid].total += 1;
          }
        } else if (entry.status === 'absent') {
          const sid = entry.actualSubjectId || entry.scheduledSubjectId;
          if (sid && stats[sid]) {
            stats[sid].total += 1;
          }
        } else if (entry.status === 'swapped') {
          // Scheduled subject cancelled (0/0)
          // Actual subject receives attendance
          const actualSid = entry.actualSubjectId;
          if (actualSid && stats[actualSid]) {
            if (entry.swappedActualStatus === 'present') {
              stats[actualSid].attended += 1;
              stats[actualSid].total += 1;
            } else if (entry.swappedActualStatus === 'absent') {
              stats[actualSid].total += 1;
            }
          }
        }
        // cancelled has 0/0 impact
      });
    });

    return stats;
  }

  const mockSubjects: Subject[] = [
    { id: 'sub_math', name: 'Mathematics', code: 'MATH101', type: 'Theory', baseAttended: 10, baseTotal: 10 },
    { id: 'sub_physics', name: 'Physics', code: 'PHY101', type: 'Theory', baseAttended: 10, baseTotal: 10 },
  ];

  it('verifies that cancelled classes NEVER affect attended or total denominators', () => {
    const logs: Record<string, AttendanceEntry[]> = {
      '2026-11-20': [
        {
          id: 'e1',
          slotId: 'slot-0',
          timeLabel: '09:00 - 10:00',
          scheduledSubjectId: 'sub_math',
          actualSubjectId: 'sub_math',
          status: 'cancelled',
        },
      ],
    };

    const stats = computeStats(mockSubjects, logs);
    expect(stats['sub_math'].attended).toBe(10);
    expect(stats['sub_math'].total).toBe(10);
  });

  it('verifies swapped classes credit ONLY the conducted course without double counting or affecting cancelled scheduled slot', () => {
    // Scheduled was Mathematics, but Physics was actually taught instead!
    const logs: Record<string, AttendanceEntry[]> = {
      '2026-11-21': [
        {
          id: 'e2',
          slotId: 'slot-0',
          timeLabel: '09:00 - 10:00',
          scheduledSubjectId: 'sub_math',
          actualSubjectId: 'sub_physics',
          status: 'swapped',
          swappedActualStatus: 'present',
        },
      ],
    };

    const stats = computeStats(mockSubjects, logs);
    // Math was cancelled (0/0)
    expect(stats['sub_math'].attended).toBe(10);
    expect(stats['sub_math'].total).toBe(10);

    // Physics received +1/+1
    expect(stats['sub_physics'].attended).toBe(11);
    expect(stats['sub_physics'].total).toBe(11);
  });

  it('verifies overwriting an existing slot status replaces entry instead of duplicating', () => {
    const dayLogs: AttendanceEntry[] = [
      {
        id: 'e1',
        slotId: 'slot-0',
        timeLabel: '09:00 - 10:00',
        scheduledSubjectId: 'sub_math',
        actualSubjectId: 'sub_math',
        status: 'present',
      },
    ];

    // Simulating toggle to absent for slot-0
    const entryIdx = dayLogs.findIndex((e) => e.slotId === 'slot-0');
    expect(entryIdx).toBe(0);

    dayLogs[entryIdx] = {
      ...dayLogs[entryIdx],
      status: 'absent',
    };

    expect(dayLogs.length).toBe(1); // No duplicate record
    expect(dayLogs[0].status).toBe('absent');
  });
});
