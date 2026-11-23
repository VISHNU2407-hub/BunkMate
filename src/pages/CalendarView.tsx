import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';
import { formatDate, parseDate, DAYS_OF_WEEK } from '../utils/attendanceMath';
import { useNavigate } from 'react-router-dom';

export const CalendarView: React.FC = () => {
  const { state, getTimetableForDate, markDayBulk, unloggedPastDays } = useAttendance();
  const navigate = useNavigate();

  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState<string | null>(null);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: Array<{
    dayNumber: number;
    dateStr: string;
    isCurrentMonth: boolean;
    dayName: string;
    hasLogs: boolean;
    presentCount: number;
    absentCount: number;
    cancelledCount: number;
    extraCount: number;
    scheduledCount: number;
    isUnloggedPast: boolean;
    isSunday: boolean;
  }> = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const cur = new Date(year, month, day);
    const dateStr = formatDate(cur);
    const dayName = DAYS_OF_WEEK[cur.getDay()];
    const isSunday = dayName === 'Sunday';

    const tt = getTimetableForDate(dateStr);
    const scheduledCount = !isSunday && tt?.grid?.[dayName]
      ? tt.grid[dayName].filter(Boolean).length
      : 0;

    const logs = state.logs[dateStr] || [];
    let presentCount = 0;
    let absentCount = 0;
    let cancelledCount = 0;
    let extraCount = 0;

    logs.forEach((l) => {
      if (l.isExtra) extraCount++;
      if (l.status === 'present') presentCount++;
      else if (l.status === 'absent') absentCount++;
      else if (l.status === 'cancelled') cancelledCount++;
      else if (l.status === 'swapped') {
        if (l.swappedActualStatus === 'present') presentCount++;
        else if (l.swappedActualStatus === 'absent') absentCount++;
      }
    });

    const isUnloggedPast =
      unloggedPastDays.some((d) => d.dateStr === dateStr) && logs.length === 0;

    calendarDays.push({
      dayNumber: day,
      dateStr,
      isCurrentMonth: true,
      dayName,
      hasLogs: logs.length > 0,
      presentCount,
      absentCount,
      cancelledCount,
      extraCount,
      scheduledCount,
      isUnloggedPast,
      isSunday,
    });
  }

  const selectedDateLogs = selectedDayDetail ? state.logs[selectedDayDetail] || [] : [];
  const selectedDayName = selectedDayDetail ? DAYS_OF_WEEK[parseDate(selectedDayDetail).getDay()] : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/60 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Academic Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Monthly attendance map with unlogged day resolution and daily details.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-extrabold text-sm px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm min-w-[8.5rem] text-center tabular">
            {monthName} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {unloggedPastDays.length > 0 && (
        <div className="p-4 rounded-3xl border border-amber-200 bg-amber-50/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">
                {unloggedPastDays.length} Unlogged Past Days
              </div>
              <p className="text-[11px] text-amber-700 font-medium">
                Click any highlighted date to mark or review periods individually.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-sm">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-24 rounded-xl sm:rounded-2xl bg-slate-100/40" />
          ))}

          {calendarDays.map((d) => {
            const isToday = d.dateStr === formatDate(new Date());
            const isSelected = selectedDayDetail === d.dateStr;

            return (
              <div
                key={d.dateStr}
                onClick={() => setSelectedDayDetail(d.dateStr)}
                className={`h-16 sm:h-24 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60'
                    : d.isUnloggedPast
                    ? 'border-amber-300 bg-amber-50/40'
                    : isToday
                    ? 'border-indigo-400 bg-indigo-50/30'
                    : 'border-slate-100 hover:bg-slate-50:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold'
                        : d.isSunday
                        ? 'text-slate-400'
                        : 'text-slate-700'
                    }`}
                  >
                    {d.dayNumber}
                  </span>

                  {d.extraCount > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" title="Extra class" />
                  )}
                </div>

                <div className="space-y-0.5">
                  {d.isUnloggedPast ? (
                    <span className="text-[9px] font-bold text-amber-600 block truncate">
                      Unlogged ({d.scheduledCount})
                    </span>
                  ) : d.hasLogs ? (
                    <div className="flex items-center gap-1 text-[10px] font-bold flex-wrap">
                      {d.presentCount > 0 && (
                        <span className="text-emerald-600">
                          +{d.presentCount}
                        </span>
                      )}
                      {d.absentCount > 0 && (
                        <span className="text-red-500">-{d.absentCount}</span>
                      )}
                      {d.cancelledCount > 0 && (
                        <span className="text-slate-400">0/0</span>
                      )}
                    </div>
                  ) : d.isSunday ? (
                    <span className="text-[9px] font-medium text-slate-400 block">Off</span>
                  ) : (
                    <span className="text-[9px] text-slate-300 font-medium block">
                      {d.scheduledCount > 0 ? `${d.scheduledCount} slots` : 'Free'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDayDetail && (
        <div className="p-6 rounded-3xl border border-slate-200/80 bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {selectedDayDetail} <span className="text-slate-400 font-semibold">({selectedDayName})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect recorded periods or mark the entire date with 1-tap.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => markDayBulk(selectedDayDetail, 'present')}
                className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold transition"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markDayBulk(selectedDayDetail, 'cancelled')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold transition"
              >
                Mark Holiday
              </button>
              <button
                onClick={() => navigate('/attendance', { state: { date: selectedDayDetail } })}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <span>Open in Logger</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDateLogs.length === 0 ? (
              <div className="col-span-full py-6 text-center text-xs text-slate-400">
                No recorded attendance logs for this date.
              </div>
            ) : (
              selectedDateLogs.map((log) => {
                const sub = state.subjects.find(
                  (s) => s.id === (log.actualSubjectId || log.scheduledSubjectId)
                );
                return (
                  <div
                    key={log.slotId}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {sub?.name || 'Class'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {log.timeLabel} &bull; {sub?.type}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        log.status === 'present'
                          ? 'bg-emerald-100 text-emerald-700'
                          : log.status === 'absent'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
