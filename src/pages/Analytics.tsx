import React from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  BookOpen,
  FlaskConical,
  Award,
  Calendar,
} from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Analytics: React.FC = () => {
  const { overallStats, subjectStatsList } = useAttendance();

  const pieData = [
    { name: 'Attended Classes', value: overallStats.totalAttended, color: '#10b981' },
    { name: 'Missed Classes', value: overallStats.totalMissed, color: '#ef4444' },
  ];

  const theorySubjects = subjectStatsList.filter((s) => s.type === 'Theory');
  const labSubjects = subjectStatsList.filter((s) => s.type === 'Lab');

  const theoryChartData = theorySubjects.map((s) => ({
    name: s.name.length > 10 ? s.name.substring(0, 10) + '…' : s.name,
    percentage: s.percentage,
    target: s.targetPercent,
  }));

  const labChartData = labSubjects.map((s) => ({
    name: s.name.length > 10 ? s.name.substring(0, 10) + '…' : s.name,
    percentage: s.percentage,
    target: s.targetPercent,
  }));

  const theoryAttended = theorySubjects.reduce((acc, s) => acc + s.attended, 0);
  const theoryTotal = theorySubjects.reduce((acc, s) => acc + s.total, 0);
  const theoryPct = theoryTotal > 0 ? Number(((theoryAttended / theoryTotal) * 100).toFixed(1)) : 0;

  const labAttended = labSubjects.reduce((acc, s) => acc + s.attended, 0);
  const labTotal = labSubjects.reduce((acc, s) => acc + s.total, 0);
  const labPct = labTotal > 0 ? Number(((labAttended / labTotal) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-indigo-600" />
          <span>Attendance Analytics & Insights</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Comprehensive charts, breakdown distributions, and eligibility compliance.
        </p>
      </div>

      {subjectStatsList.length === 0 && (
        <div className="surface py-14 px-6 text-center">
          <span className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-7 h-7" />
          </span>
          <h2 className="text-base font-extrabold">Nothing to analyse yet</h2>
          <p className="text-xs text-slate-500 mt-1">
            Add subjects and start logging classes — your charts will appear here automatically.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Conducted
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {overallStats.totalConducted}
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">Classes Across Courses</div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Theory Attendance
            </span>
            <div className="text-2xl font-black text-blue-600 mt-1">{theoryPct}%</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              {theoryAttended}/{theoryTotal} Lectures
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Lab Practical Attendance
            </span>
            <div className="text-2xl font-black text-purple-600 mt-1">{labPct}%</div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              {labAttended}/{labTotal} Practicals
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {theorySubjects.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col min-w-0 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Theory Subjects</span>
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Attendance
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  Target ({overallStats.targetPercent}%)
                </span>
              </div>
            </div>

            <div className="w-full h-64 min-h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={theoryChartData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
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
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="percentage"
                    name="Attendance"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {labSubjects.length > 0 && (
          <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col min-w-0 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                <span>Laboratory Subjects</span>
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  Attendance
                </span>
                <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  Target ({overallStats.targetPercent}%)
                </span>
              </div>
            </div>

            <div className="w-full h-64 min-h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={labChartData}
                  margin={{ top: 15, right: 15, left: -15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-20}
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
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="percentage"
                    name="Attendance"
                    fill="#a855f7"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between min-w-0 overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-indigo-600" />
              <span>Conducted Ratio</span>
            </h3>
          </div>

          <div className="w-full h-64 min-h-[250px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around text-xs font-bold pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Attended ({overallStats.totalAttended})</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Missed ({overallStats.totalMissed})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
