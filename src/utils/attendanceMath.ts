import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculates safe bunks for a subject or overall attendance.
 * Formula: floor((Attended - Target * Total) / Target)
 * If attendance < target, returns 0.
 * If Target is 0 or invalid, handles safely without throwing NaN.
 */
export function calculateSafeBunks(attended: number, total: number, targetPercentage: number): number {
  if (total <= 0) return 0;
  const target = Math.min(Math.max(targetPercentage, 1), 100) / 100;
  const currentPct = (attended / total) * 100;

  if (currentPct < targetPercentage) return 0;

  if (target >= 1) return 0;

  const bunks = Math.floor((attended - target * total) / target);
  return Math.max(0, bunks);
}

/**
 * Calculates consecutive classes needed to reach a required target percentage.
 * Formula: ceil((Target * Total - Attended) / (1 - Target))
 * If current attendance is already >= target, returns 0.
 * Handles Target >= 100% or invalid targets safely.
 */
export function calculateClassesNeeded(attended: number, total: number, targetPercentage: number): number {
  if (total <= 0) return 0;
  const target = Math.min(Math.max(targetPercentage, 1), 100) / 100;
  const currentPct = (attended / total) * 100;

  if (currentPct >= targetPercentage) return 0;

  if (target >= 0.9999) {
    return Infinity;
  }

  const needed = Math.ceil((target * total - attended) / (1 - target));
  return Math.max(1, needed);
}

/**
 * Projects attendance percentage after future actions (bunking or attending).
 */
export function projectAttendance(
  currentAttended: number,
  currentTotal: number,
  futureAttend: number,
  futureBunk: number
): { projectedAttended: number; projectedTotal: number; projectedPercentage: number } {
  const projectedAttended = Math.max(0, currentAttended + Math.max(0, futureAttend));
  const projectedTotal = Math.max(0, currentTotal + Math.max(0, futureAttend) + Math.max(0, futureBunk));
  const projectedPercentage = projectedTotal > 0 ? (projectedAttended / projectedTotal) * 100 : 100;

  return {
    projectedAttended,
    projectedTotal,
    projectedPercentage: Number(projectedPercentage.toFixed(2)),
  };
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
export const WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
