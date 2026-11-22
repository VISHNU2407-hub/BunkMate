import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Layers,
  Repeat,
  Smartphone,
  CircleCheck,
  TrendingUp,
  CalendarCheck2,
  LockKeyhole,
} from 'lucide-react';
import { BunkMateMascot } from '../components/BunkMateMascot';

type DemoTab = 'dashboard' | 'logging' | 'timetable' | 'analytics';

const DEMO_TABS: Array<{ id: DemoTab; label: string }> = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'logging', label: 'Daily Logging' },
  { id: 'timetable', label: 'Timetable' },
  { id: 'analytics', label: 'Analytics' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DemoTab>('dashboard');

  const handleDownloadApk = () => {
    const a = document.createElement('a');
    a.href = '/BunkMate.apk';
    a.download = 'BunkMate.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen text-slate-900 selection:bg-indigo-600 selection:text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 text-left group"
          >
            <BunkMateMascot size="sm" variant="float" />
            <span className="min-w-0">
              <span className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-[#171642]">BunkMate</span>
                <span className="hidden sm:inline text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#E9E3FF] text-[#7047FF] border border-[#7047FF]/20">
                  College Edition
                </span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-semibold -mt-0.5">
                Your Attendance. Your Control.
              </span>
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadApk}
              className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-[#E9E3FF]/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-[#7047FF]" />
              <span className="hidden sm:inline">Download</span> APK
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="h-9 px-4 rounded-xl bg-[#7047FF] hover:bg-[#5f38e6] text-white text-xs font-bold shadow-md shadow-[#7047FF]/25 transition flex items-center gap-1.5"
            >
              <span>Open App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto rounded-[1.75rem] sm:rounded-[2.25rem] hero-gradient relative overflow-hidden shadow-2xl shadow-indigo-900/20">
          <div className="absolute inset-0 grid-fade opacity-40 pointer-events-none" />
          <div className="relative px-5 py-9 sm:px-10 sm:py-14 lg:px-14 lg:py-16 grid lg:grid-cols-[1.15fr_0.85fr] gap-9 lg:gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[#E9E3FF] text-[11px] font-bold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#E9E3FF]" />
                BunkMate &bull; The Smart Student Companion
              </span>

              <h1 className="mt-4 text-[1.85rem] leading-[1.12] sm:text-4xl lg:text-5xl font-black tracking-tight text-white text-balance">
                Know exactly how many classes you can safely miss.
              </h1>

              <p className="mt-4 text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-xl">
                Track lectures in one tap, handle cancelled and swapped classes cleanly, and stay
                above your 75% target and 60% floor — with every record stored on your own device.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="h-12 px-5 rounded-xl bg-white text-[#171642] text-xs font-extrabold shadow-lg shadow-indigo-950/20 hover:bg-[#E9E3FF] transition flex items-center justify-center gap-2"
                >
                  <BunkMateMascot size="xs" variant="float" />
                  <span>Launch Live Dashboard</span>
                </button>
                <button
                  onClick={handleDownloadApk}
                  className="h-12 px-5 rounded-xl bg-white/10 border border-white/25 text-white text-xs font-bold hover:bg-white/15 transition flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Get Android APK (4.7 MB)</span>
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-semibold text-indigo-100/80">
                <span className="flex items-center gap-1.5">
                  <CircleCheck className="w-3.5 h-3.5 text-emerald-300" /> No account needed
                </span>
                <span className="flex items-center gap-1.5">
                  <CircleCheck className="w-3.5 h-3.5 text-emerald-300" /> Works fully offline
                </span>
                <span className="flex items-center gap-1.5">
                  <CircleCheck className="w-3.5 h-3.5 text-emerald-300" /> Private by default
                </span>
              </div>
            </div>

            {/* Live snapshot card */}
            <div className="bg-white/95 backdrop-blur rounded-3xl p-5 sm:p-6 shadow-2xl shadow-indigo-950/25 border border-white/60">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Overall attendance
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight tabular">78.4%</span>
                    <span className="text-[11px] font-semibold text-slate-400 tabular">98/125</span>
                  </div>
                </div>
                <div
                  className="w-14 h-14 rounded-full relative shrink-0"
                  style={{ background: 'conic-gradient(#4f46e5 282deg, #e2e8f0 0deg)' }}
                >
                  <div className="absolute inset-[5px] rounded-full bg-white flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px] font-extrabold text-emerald-800">
                      Safe bunk margin
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-700 tabular">5 classes</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheck2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-[11px] font-extrabold text-slate-700">Today</span>
                  </div>
                  <span className="text-xs font-black text-slate-700 tabular">3 of 5 logged</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LockKeyhole className="w-4 h-4 text-slate-500" />
                    <span className="text-[11px] font-extrabold text-slate-700">Data storage</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">On this device</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {[
            { icon: Repeat, label: 'Swapped lectures', value: 'Handled cleanly' },
            { icon: ShieldCheck, label: 'Dual-rule alerts', value: '75% + 60%' },
            { icon: Layers, label: 'Theory & labs', value: 'Isolated tracks' },
            { icon: Download, label: 'Backup & restore', value: 'Portable JSON' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="surface-flat p-3.5 sm:p-4 flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
                    {item.label}
                  </span>
                  <span className="block text-xs font-extrabold text-slate-800 truncate">
                    {item.value}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive demo */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                See every module in action
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                A working preview of the real dashboard — switch tabs to explore.
              </p>
            </div>

            <div className="flex gap-1 p-1 rounded-xl bg-slate-200/70 overflow-x-auto no-scrollbar self-start sm:self-auto max-w-full">
              {DEMO_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold whitespace-nowrap transition ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="surface overflow-hidden">
            {activeTab === 'dashboard' && (
              <div className="p-4 sm:p-7 space-y-5 animate-fade">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      label: 'Overall attendance',
                      value: '78.4%',
                      sub: '98 of 125 classes',
                      tone: 'text-slate-900',
                    },
                    {
                      label: 'Classes conducted',
                      value: '125',
                      sub: '27 missed · 6 subjects',
                      tone: 'text-slate-900',
                    },
                    {
                      label: 'Safe bunks left',
                      value: '5',
                      sub: 'Before 75% breach',
                      tone: 'text-emerald-600',
                    },
                    {
                      label: 'Below 60% floor',
                      value: '0',
                      sub: 'All courses clear',
                      tone: 'text-emerald-600',
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {stat.label}
                      </div>
                      <div className={`mt-1.5 text-2xl font-black tracking-tight tabular ${stat.tone}`}>
                        {stat.value}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 mt-0.5">{stat.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                      Subject status
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600">Dual-rule engine</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-xs text-left">
                      <thead className="bg-white text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                        <tr>
                          <th className="p-3">Course</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Attended</th>
                          <th className="p-3">Percent</th>
                          <th className="p-3">Bunk margin</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                        <tr>
                          <td className="p-3 font-bold text-slate-900">Data Structures</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px]">
                              Theory
                            </span>
                          </td>
                          <td className="p-3 tabular">22 / 26</td>
                          <td className="p-3 font-bold text-emerald-600 tabular">84.6%</td>
                          <td className="p-3 text-emerald-600">3 safe</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-900">DSA Laboratory</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[9px]">
                              Lab
                            </span>
                          </td>
                          <td className="p-3 tabular">10 / 12</td>
                          <td className="p-3 font-bold text-emerald-600 tabular">83.3%</td>
                          <td className="p-3 text-emerald-600">1 safe</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-bold text-slate-900">Computer Networks</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px]">
                              Theory
                            </span>
                          </td>
                          <td className="p-3 tabular">17 / 24</td>
                          <td className="p-3 font-bold text-amber-600 tabular">70.8%</td>
                          <td className="p-3 text-amber-600">Attend 2</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'logging' && (
              <div className="p-4 sm:p-7 space-y-4 animate-fade">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold">Today&apos;s logging matrix</h3>
                    <p className="text-[11px] text-slate-500">
                      Four independent states per period — never duplicate a row.
                    </p>
                  </div>
                  <span className="self-start text-[10px] font-bold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                    Today · active
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {[
                    {
                      time: '09:00 - 10:00',
                      name: 'Data Structures',
                      active: 'present',
                      note: '+1 attended, +1 conducted',
                    },
                    {
                      time: '10:00 - 11:00',
                      name: 'Computer Networks',
                      active: 'absent',
                      note: '+0 attended, +1 conducted',
                    },
                    {
                      time: '11:15 - 12:15',
                      name: 'Operating Systems',
                      active: 'swapped',
                      note: 'Replacement subject logged, original cancelled 0/0',
                    },
                    {
                      time: '01:00 - 03:00',
                      name: 'DSA Laboratory',
                      active: 'cancelled',
                      note: 'Excluded from the denominator entirely',
                    },
                  ].map((item) => (
                    <div key={item.time} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                      <div className="flex items-start justify-between gap-2 text-xs">
                        <span className="font-bold text-slate-800">{item.name}</span>
                        <span className="text-slate-400 font-mono text-[10px] whitespace-nowrap">
                          {item.time}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
                        {[
                          { key: 'present', label: 'Present', on: 'bg-emerald-600 text-white' },
                          { key: 'absent', label: 'Absent', on: 'bg-red-500 text-white' },
                          { key: 'cancelled', label: 'Cancel', on: 'bg-slate-700 text-white' },
                          { key: 'swapped', label: 'Swap', on: 'bg-amber-500 text-white' },
                        ].map((state) => (
                          <div
                            key={state.key}
                            className={`py-1.5 rounded-lg text-center ${
                              item.active === state.key ? state.on : 'bg-white border border-slate-200 text-slate-500'
                            }`}
                          >
                            {state.label}
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Calculation: <span className="text-slate-700 font-semibold">{item.note}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'timetable' && (
              <div className="p-4 sm:p-7 space-y-4 animate-fade">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold">Customizable weekly matrix</h3>
                    <p className="text-[11px] text-slate-500">
                      Configure periods, theory lectures and practicals from Monday to Saturday.
                    </p>
                  </div>
                  <span className="self-start text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Effective from 2026-11-01
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[720px] text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] tracking-wider">
                      <tr>
                        <th className="p-3">Time</th>
                        <th className="p-3">Monday</th>
                        <th className="p-3">Tuesday</th>
                        <th className="p-3">Wednesday</th>
                        <th className="p-3">Thursday</th>
                        <th className="p-3">Friday</th>
                        <th className="p-3">Saturday</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {[
                        ['09:00 - 10:00', 'Data Structures', 'Networks Lab', 'Computer Networks', 'Operating Systems', 'Databases'],
                        ['10:00 - 11:00', 'Computer Networks', 'Networks Lab', 'Operating Systems', 'Data Structures', 'Databases'],
                        ['11:15 - 12:15', 'Operating Systems', 'Free', 'Databases', 'Computer Networks', 'Data Structures'],
                      ].map((row) => (
                        <tr key={row[0]}>
                          <td className="p-3 text-slate-400 font-mono text-[10px] whitespace-nowrap">{row[0]}</td>
                          {row.slice(1).map((cell, i) => (
                            <td
                              key={`${row[0]}-${i}`}
                              className={
                                cell === 'Free'
                                  ? 'p-3 text-slate-300 italic'
                                  : cell.includes('Lab')
                                  ? 'p-3 text-purple-700 bg-purple-50/50'
                                  : 'p-3 text-blue-700 bg-blue-50/50'
                              }
                            >
                              {cell}
                            </td>
                          ))}
                          <td className="p-3 text-slate-300 italic">Free</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="p-4 sm:p-7 space-y-4 animate-fade">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-extrabold">Side-by-side target comparison</h3>
                    <p className="text-[11px] text-slate-500">
                      Compare each subject against the 75% target baseline.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-slate-300" /> Target
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-blue-600" /> Theory
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-purple-600" /> Lab
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { name: 'Data Structures', pct: 84.6, tag: 'Theory', color: 'bg-blue-600' },
                    { name: 'DSA Laboratory', pct: 83.3, tag: 'Lab', color: 'bg-purple-600' },
                    { name: 'Computer Networks', pct: 70.8, tag: 'Theory', color: 'bg-blue-600' },
                    { name: 'Databases', pct: 88, tag: 'Theory', color: 'bg-blue-600' },
                  ].map((item) => (
                    <div key={item.name} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                      <div className="flex items-start justify-between gap-2 text-[11px] font-bold text-slate-800">
                        <span className="leading-tight">{item.name}</span>
                        <span className="text-[9px] text-slate-500 font-semibold whitespace-nowrap">
                          {item.tag}
                        </span>
                      </div>

                      <div className="flex items-end justify-center gap-2 h-24 pb-1 border-b border-slate-200">
                        <div className="w-7 bg-slate-300 rounded-t-sm" style={{ height: '75%' }} title="Target 75%" />
                        <div
                          className={`w-7 ${item.color} rounded-t-sm`}
                          style={{ height: `${item.pct}%` }}
                          title={`Attended: ${item.pct}%`}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] font-bold text-slate-600">
                        <span>Target 75%</span>
                        <span className={item.pct >= 75 ? 'text-emerald-600' : 'text-amber-600'}>
                          {item.pct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Built for real college conditions
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Engineered for the edge cases generic habit apps fail at.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
            {[
              {
                icon: Repeat,
                title: 'Lecture swap tracking',
                body: 'When another professor takes your lecture, the original course is marked cancelled (0/0) and attendance is credited to the subject actually taught.',
                tone: 'bg-indigo-50 text-indigo-600',
              },
              {
                icon: ShieldCheck,
                title: 'Dual-rule defense',
                body: 'Stay compliant with both semester eligibility (75%) and per-course floor minimums (60%), with early warnings before detention lists are published.',
                tone: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: Layers,
                title: 'Theory & lab isolation',
                body: 'Laboratory sessions carry different requirements and internal marks. Track practicals and lectures in completely separate tracks.',
                tone: 'bg-purple-50 text-purple-600',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="surface p-5 sm:p-6">
                  <span className={`w-10 h-10 rounded-xl ${feature.tone} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900">{feature.title}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed mt-1.5">
                    {feature.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl hero-gradient flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-sm tracking-tight block">
                BunkMate
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Your Attendance. Your Control.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
            >
              Open Web App
            </button>
            <button
              onClick={handleDownloadApk}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition"
            >
              Download APK
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
