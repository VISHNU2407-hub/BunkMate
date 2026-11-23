import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  PlusCircle,
  FlaskConical,
  Sparkles,
} from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';
import { formatDate, DAYS_OF_WEEK } from '../utils/attendanceMath';
import { BunkMateMascot } from '../components/BunkMateMascot';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    state,
    overallStats,
    subjectStatsList,
    unloggedPastDays,
    getTimetableForDate,
  } = useAttendance();
  const navigate = useNavigate();
  const [chartTab, setChartTab] = React.useState<'theory' | 'lab'>('theory');

  const todayStr = formatDate(new Date());
  const todayDayName = DAYS_OF_WEEK[new Date().getDay()];
  const currentTT = getTimetableForDate(todayStr);

  const todaySlots = currentTT?.grid?.[todayDayName] || [];
  const todayLogs = state.logs[todayStr] || [];

  if (state.subjects.length === 0) {
    return (
      <div className="w-full py-14 px-6 text-center surface border border-slate-200/80 rounded-3xl">
        <div className="flex justify-center mb-5">
          <BunkMateMascot size="xl" variant="bounce" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#171642] tracking-tight">
          Welcome to BunkMate! 👋
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
          Your attendance companion is ready to help you stay ahead. Add your subjects and weekly timetable to start tracking safe bunks and avoid detention.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/subjects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7047FF] hover:bg-[#5f38e6] text-white font-bold text-xs shadow-md shadow-[#7047FF]/25 transition tap-bounce"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Subjects &amp; Courses</span>
          </Link>
          <Link
            to="/timetable"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 font-bold text-xs hover:bg-[#E9E3FF]/30 text-[#171642] transition tap-bounce"
          >
            <span>Set Up Timetable</span>
          </Link>
        </div>
      </div>
    );
  }

  const theoryChartData = subjectStatsList
    .filter((s) => s.type === 'Theory')
    .map((s) => ({
      name: s.name.length > 10 ? s.name.substring(0, 10) + '…' : s.name,
      percentage: s.percentage,
      target: s.targetPercent,
      floor: s.floorPercent,
    }));

  const labChartData = subjectStatsList
    .filter((s) => s.type === 'Lab')
    .map((s) => ({
      name: s.name.length > 10 ? s.name.substring(0, 10) + '…' : s.name,
      percentage: s.percentage,
      target: s.targetPercent,
      floor: s.floorPercent,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/60 gap-4">
        <div className="flex items-center gap-3.5">
          <BunkMateMascot size="md" variant="float" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171642] tracking-tight">
                Welcome back! 👋
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E9E3FF] text-[#7047FF] text-[10px] font-bold">
                <Sparkles className="w-3 h-3" />
                Active Tracker
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Your attendance journey continues
              {state.settings.studentName ? (
                <>
                  {', '}
                  <span className="font-semibold text-slate-700">
                    {state.settings.studentName}
                  </span>
                </>
              ) : null}
              {state.settings.semester ? ` • ${state.settings.semester}` : ''}
              {state.settings.collegeName ? ` (${state.settings.collegeName})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/attendance')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#7047FF] hover:bg-[#5f38e6] text-white text-xs font-bold shadow-sm shadow-[#7047FF]/25 transition w-full sm:w-auto"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Log Today's Classes</span>
          </button>
        </div>
      </div>

      {overallStats.isDetentionWarning && (
        <div className="p-5 rounded-3xl border border-red-300 bg-red-50/80 text-red-900 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-red-200 text-red-700 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-black text-red-800 tracking-tight uppercase">
                Dual-Rule Detention Alert Triggered
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-red-600 text-white">
                Exam Eligibility At Risk
              </span>
            </div>
            <ul className="text-xs space-y-1 list-disc list-inside text-red-700 font-medium">
              {overallStats.detentionReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {unloggedPastDays.length > 0 && (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-900">
                {unloggedPastDays.length} past days need review
              </span>
              <p className="text-[11px] text-amber-700 font-medium">
                Resolve them quickly to keep your attendance analytics accurate.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/calendar')}
            className="px-3 py-1.5 rounded-xl bg-amber-200/70 text-amber-800 text-xs font-bold hover:bg-amber-200 transition whitespace-nowrap"
          >
            Review Calendar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Attendance
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Target {overallStats.targetPercent}%
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight tabular">
                {overallStats.totalConducted > 0 ? `${overallStats.percentage}%` : '—'}
              </span>
              <span className="text-xs font-semibold text-slate-400 tabular">
                ({overallStats.totalAttended}/{overallStats.totalConducted})
              </span>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallStats.totalConducted === 0
                    ? 'bg-slate-300'
                    : overallStats.percentage < overallStats.floorPercent
                    ? 'bg-red-500'
                    : overallStats.percentage < overallStats.targetPercent
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{
                  width: `${
                    overallStats.totalConducted === 0
                      ? 0
                      : Math.min(100, Math.max(0, overallStats.percentage))
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Classes Breakdown
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-xl font-black text-slate-900">
                {overallStats.totalConducted} Total
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">
                {overallStats.totalAttended} Present &bull; {overallStats.totalMissed} Missed
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-600">
                {state.subjects.length} Subjects
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Bunk Margin
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                overallStats.percentage >= overallStats.targetPercent
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {overallStats.percentage >= overallStats.targetPercent ? (
                <ShieldCheck className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
            </div>
          </div>            <div className="mt-3">
            <div className="text-lg font-black text-slate-900 tracking-tight leading-snug">
              {overallStats.totalConducted === 0
                ? 'No classes logged yet'
                : overallStats.percentage >= overallStats.targetPercent
                ? `${overallStats.safeBunks} Safe Bunks Left`
                : `Need ${overallStats.classesNeeded} Classes to Recover`}
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">
              Based on global {overallStats.targetPercent}% target
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Safety Floor Check
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                overallStats.atRiskSubjectsCount > 0
                  ? 'bg-red-50 text-red-600'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {overallStats.atRiskSubjectsCount > 0 ? (
                <AlertOctagon className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-black tracking-tight ${
                overallStats.atRiskSubjectsCount > 0
                  ? 'text-red-600'
                  : 'text-emerald-600'
              }`}
            >
              {overallStats.atRiskSubjectsCount} Subjects
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">
              Below {overallStats.floorPercent}% minimum threshold
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Today's Classes ({todayDayName})
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {todaySlots.filter(Boolean).length} Scheduled
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {todayDayName === 'Sunday' ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  Sunday - College Closed
                </div>
              ) : todaySlots.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 font-medium">
                  No classes scheduled for today.
                </div>
              ) : (
                todaySlots.map((subId, idx) => {
                  if (!subId) return null;
                  const sub = state.subjects.find((s) => s.id === subId);
                  const slotKey = `slot-${idx}`;
                  const loggedEntry = todayLogs.find((l) => l.slotId === slotKey);
                  const timeLabel = currentTT.slots[idx] || `Period ${idx + 1}`;

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">
                          {sub?.name || 'Class'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {timeLabel} &bull; {sub?.type}
                        </div>
                      </div>

                      <div>
                        {loggedEntry?.status === 'present' ? (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                            Present
                          </span>
                        ) : loggedEntry?.status === 'absent' ? (
                          <span className="px-2 py-0.5 rounded-lg bg-red-100 text-red-700 font-bold text-[10px]">
                            Absent
                          </span>
                        ) : loggedEntry?.status === 'cancelled' ? (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-600 font-bold text-[10px]">
                            Cancelled
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-[10px]">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              to="/attendance"
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-indigo-600 hover:underline"
            >
              <span>Manage & Log Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Subject Attendance Comparison
              </h3>
            </div>

            <div className="flex items-center gap-3">
              {/* Tab Selector */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setChartTab('theory')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartTab === 'theory'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700:text-slate-300'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Theory ({theoryChartData.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setChartTab('lab')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    chartTab === 'lab'
                      ? 'bg-white text-purple-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700:text-slate-300'
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Labs ({labChartData.length})</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-3 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      chartTab === 'theory' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}
                  />
                  Current %
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  Target ({overallStats.targetPercent}%)
                </span>
              </div>
            </div>
          </div>

          <div className="w-full mt-4">
            {chartTab === 'theory' ? (
              theoryChartData.length > 0 ? (
                <div className="w-full h-56 min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={theoryChartData}
                      margin={{ top: 10, right: 15, left: -10, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val: any, name: any) => [
                          `${val}%`,
                          name === 'target' ? 'Target' : 'Attendance',
                        ]}
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          borderRadius: '12px',
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px',
                        }}
                      />
                      <Bar
                        dataKey="target"
                        name="Target"
                        fill="#cbd5e1"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                      <Bar
                        dataKey="percentage"
                        name="Attendance"
                        fill="#3b82f6"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                  No theory subjects added yet.
                </div>
              )
            ) : labChartData.length > 0 ? (
              <div className="w-full h-56 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={labChartData}
                    margin={{ top: 10, right: 15, left: -10, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        `${val}%`,
                        name === 'target' ? 'Target' : 'Attendance',
                      ]}
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        borderRadius: '12px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Bar
                      dataKey="target"
                      name="Target"
                      fill="#cbd5e1"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                    <Bar
                      dataKey="percentage"
                      name="Attendance"
                      fill="#a855f7"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={36}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                No lab practicals added yet.
              </div>
            )}
          </div>

          <div className="text-right mt-2">
            <Link
              to="/analytics"
              className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
            >
              <span>View Full Analytics & Reports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Subject Attendance Cards
            </h2>
            <p className="text-xs text-slate-500">
              Real-time bunk margin and recovery requirements per course.
            </p>
          </div>
          <Link
            to="/subjects"
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Manage Subjects
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectStatsList.map((sub) => {
            const isCritical = sub.status === 'critical';
            const isWarning = sub.status === 'warning';

            return (
              <div
                key={sub.id}
                className={`p-5 rounded-3xl bg-white border ${
                  isCritical
                    ? 'border-red-300 shadow-sm'
                    : 'border-slate-200/80'
                } shadow-sm flex flex-col justify-between transition hover:shadow-md`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          sub.type === 'Lab'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {sub.type} {sub.code ? `• ${sub.code}` : ''}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                        {sub.name}
                      </h3>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        sub.total === 0
                          ? 'bg-slate-100 text-slate-600'
                          : isCritical
                          ? 'bg-red-100 text-red-800'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {sub.total === 0
                        ? 'Not started'
                        : isCritical
                        ? 'Floor Breached'
                        : isWarning
                        ? 'Below Target'
                        : 'Safe'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-slate-900 tracking-tight tabular">
                      {sub.total > 0 ? `${sub.percentage}%` : '—'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {sub.attended} / {sub.total} Conducted
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical
                          ? 'bg-red-500'
                          : isWarning
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${
                          sub.total > 0 ? Math.min(100, Math.max(0, sub.percentage)) : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className={`p-1.5 rounded-xl flex-shrink-0 ${
                        sub.status === 'safe'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {sub.status === 'safe' ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingUp className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">
                        {sub.status === 'safe' ? 'Safe Bunk Margin:' : 'Recovery Needed:'}
                      </span>
                      <p className="text-slate-500 font-medium mt-0.5">
                        {sub.bunkExplanation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
