import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  CalendarDays,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  AlertTriangle,
  MoreHorizontal,
  X,
  Sparkles,
} from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';
import { cn } from '../utils/attendanceMath';
import { App as CapApp } from '@capacitor/app';
import { BunkMateMascot } from '../components/BunkMateMascot';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Subjects', path: '/subjects', icon: BookOpen },
  { name: 'Attendance', path: '/attendance', icon: CheckSquare },
  { name: 'Timetable', path: '/timetable', icon: CalendarDays },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const PRIMARY_MOBILE_PATHS = ['/dashboard', '/attendance', '/timetable'];

const MOBILE_BOTTOM_ITEMS = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Log', path: '/attendance', icon: CheckSquare },
  { name: 'Timetable', path: '/timetable', icon: CalendarDays },
];

const MORE_MENU_ITEMS = [
  { name: 'Subjects', path: '/subjects', icon: BookOpen, hint: 'Courses & thresholds' },
  { name: 'Calendar', path: '/calendar', icon: Calendar, hint: 'Monthly attendance map' },
  { name: 'Analytics', path: '/analytics', icon: BarChart3, hint: 'Charts & insights' },
  { name: 'Settings', path: '/settings', icon: Settings, hint: 'Profile, rules & backup' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { overallStats, unloggedPastDays } = useAttendance();
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLanding = location.pathname === '/';
  const currentPage = useMemo(
    () => NAV_ITEMS.find((item) => item.path === location.pathname)?.name ?? 'Dashboard',
    [location.pathname]
  );
  const isMoreActive = !PRIMARY_MOBILE_PATHS.includes(location.pathname);

  // Hardware Back Button integration for Android
  useEffect(() => {
    let backListener: { remove: () => Promise<void> } | null = null;
    try {
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (moreOpen) {
          setMoreOpen(false);
        } else if (location.pathname === '/dashboard') {
          CapApp.exitApp();
        } else if (canGoBack) {
          window.history.back();
        } else {
          navigate('/dashboard');
        }
      })
        .then((handle) => {
          backListener = handle;
        })
        .catch(() => {
          // Running in a browser where the plugin is unavailable
        });
    } catch {
      // Running in browser
    }

    return () => {
      backListener?.remove().catch(() => undefined);
    };
  }, [location.pathname, navigate, moreOpen]);

  const percentage = overallStats.totalConducted > 0 ? overallStats.percentage : 0;
  const statusTone =
    overallStats.totalConducted === 0 || overallStats.status === 'safe'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
      : overallStats.status === 'warning'
      ? 'text-amber-600 bg-amber-50 border-amber-100'
      : 'text-red-600 bg-red-50 border-red-100';

  if (isLanding) {
    return <div className="min-h-screen app-bg text-slate-900">{children}</div>;
  }

  return (
    <div className="min-h-screen app-bg text-slate-900">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'hidden md:flex flex-col sticky top-0 h-screen shrink-0 z-30 select-none border-r border-slate-200/70 bg-white/85 backdrop-blur-xl transition-[width] duration-300',
            collapsed ? 'w-[4.5rem]' : 'w-64'
          )}
        >
          <div
            className={cn(
              'h-16 flex items-center border-b border-slate-200/70',
              collapsed ? 'justify-center px-2' : 'justify-between px-4'
            )}
          >
            {!collapsed ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-3 text-left min-w-0 group"
                >
                  <BunkMateMascot size="sm" variant="float" />
                  <span className="min-w-0">
                    <span className="font-extrabold text-base tracking-tight text-[#171642] block">
                      BunkMate
                    </span>
                    <span className="block text-[10px] text-slate-400 font-semibold truncate -mt-0.5">
                      Your Attendance. Your Control.
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setCollapsed(true)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setCollapsed(false)}
                className="w-11 h-11 rounded-2xl flex items-center justify-center hover:bg-[#E9E3FF]/50 transition group"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <BunkMateMascot size="sm" variant="bounce" />
              </button>
            )}
          </div>

          <nav className={cn('flex-1 overflow-y-auto no-scrollbar py-3 space-y-1', collapsed ? 'px-2' : 'px-3')}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const hasBadge = item.path === '/calendar' && unloggedPastDays.length > 0;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'relative flex items-center rounded-xl text-[13px] font-semibold transition-colors',
                    collapsed ? 'w-11 h-11 mx-auto justify-center' : 'gap-3 px-3.5 py-2.5',
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                  {hasBadge && (
                    <span
                      className={cn(
                        'flex items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold',
                        collapsed ? 'absolute top-1.5 right-1.5 w-2 h-2' : 'ml-auto min-w-5 h-5 px-1.5'
                      )}
                      title={`${unloggedPastDays.length} unlogged days`}
                    >
                      {!collapsed && unloggedPastDays.length}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className={cn('p-3 border-t border-slate-200/70', collapsed && 'px-2')}>
            {overallStats.isDetentionWarning && !collapsed ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full p-3 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-left hover:bg-red-100/70 transition"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  <span className="block text-[11px] font-extrabold text-red-700">
                    Attendance alert
                  </span>
                  <span className="block text-[10px] text-red-600/90 font-medium leading-snug">
                    A threshold has been breached.
                  </span>
                </span>
              </button>
            ) : (
              <div
                className={cn(
                  'flex items-center rounded-2xl bg-slate-50 border border-slate-200/80',
                  collapsed ? 'justify-center p-2' : 'gap-3 p-3'
                )}
              >
                <div
                  className="relative w-9 h-9 rounded-full shrink-0"
                  style={{
                    background: `conic-gradient(#4f46e5 ${percentage * 3.6}deg, #e2e8f0 0deg)`,
                  }}
                >
                  <div className="absolute inset-[3px] rounded-full bg-white flex items-center justify-center text-[9px] font-extrabold text-slate-700 tabular">
                    {Math.round(percentage)}
                  </div>
                </div>
                {!collapsed && (
                  <div className="min-w-0">
                    <div className="text-[11px] font-extrabold text-slate-800">
                      Live attendance
                    </div>
                    <div className="text-[10px] font-semibold text-slate-400 truncate">
                      {overallStats.totalAttended}/{overallStats.totalConducted} classes
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>

        {/* Content column */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/70 pt-safe">
            <div className="h-14 px-4 flex items-center justify-between gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2.5 min-w-0"
              >
                <BunkMateMascot size="xs" variant="float" />
                <span className="min-w-0 text-left">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7047FF] leading-none">
                    BunkMate
                  </span>
                  <span className="block text-sm font-extrabold text-[#171642] truncate leading-tight">
                    {currentPage}
                  </span>
                </span>
              </button>

              <button
                onClick={() => navigate('/analytics')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-extrabold tabular',
                  statusTone
                )}
                aria-label="View attendance analytics"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {overallStats.totalConducted > 0 ? `${percentage}%` : 'New'}
              </button>
            </div>
          </header>

          <main className="flex-1 flex flex-col min-w-0">
            <div
              key={location.pathname}
              className="w-full max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-28 md:pb-8 flex-1 page-enter"
            >
              {children}
            </div>

            <footer className="hidden md:block py-4 px-6 text-center text-[11px] text-slate-400 font-medium">
              BunkMate &bull; Your Attendance. Your Control. &bull; All data stays on this device.
            </footer>
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 pb-safe shadow-[0_-8px_30px_-18px_rgba(23,22,66,0.25)]">
        <div className="px-2 pt-1.5 pb-1 flex items-stretch justify-around">
          {MOBILE_BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[10px] font-bold transition-all tap-bounce',
                  isActive ? 'text-[#7047FF]' : 'text-slate-500'
                )}
              >
                <span
                  className={cn(
                    'px-3.5 py-1 rounded-xl transition-all',
                    isActive
                      ? 'bg-[#E9E3FF] text-[#7047FF] shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <Icon className="w-[19px] h-[19px]" strokeWidth={isActive ? 2.3 : 1.9} />
                </span>
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          <button
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-1 rounded-xl text-[10px] font-bold transition-all tap-bounce',
              isMoreActive || moreOpen ? 'text-[#7047FF]' : 'text-slate-500'
            )}
          >
            <span
              className={cn(
                'px-3.5 py-1 rounded-xl transition-all',
                isMoreActive || moreOpen ? 'bg-[#E9E3FF] text-[#7047FF] shadow-xs' : 'text-slate-400'
              )}
            >
              <MoreHorizontal className="w-[19px] h-[19px]" strokeWidth={isMoreActive || moreOpen ? 2.3 : 1.9} />
            </span>
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" sheet */}
      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            aria-label="Close menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade"
          />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl pb-safe animate-rise">
            <div className="px-5 pt-3 pb-2 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Navigate
                </div>
                <div className="text-base font-extrabold text-slate-900">All modules</div>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 pb-5 grid grid-cols-2 gap-2.5">
              {MORE_MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'p-3.5 rounded-2xl border transition-colors',
                      isActive
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                    )}
                  >
                    <span
                      className={cn(
                        'w-9 h-9 rounded-xl flex items-center justify-center mb-2',
                        isActive ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-slate-200'
                      )}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                    </span>
                    <span className="block text-xs font-extrabold text-slate-900">
                      {item.name}
                    </span>
                    <span className="block text-[10px] font-medium text-slate-500 mt-0.5">
                      {item.hint}
                    </span>
                    {item.path === '/calendar' && unloggedPastDays.length > 0 && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold text-amber-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {unloggedPastDays.length} to review
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            <div className="mx-4 mb-5 p-3 rounded-2xl bg-slate-900 text-white flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-300 shrink-0" />
              <div className="text-[11px] font-semibold text-slate-200">
                {overallStats.totalConducted > 0
                  ? `${overallStats.totalAttended} present of ${overallStats.totalConducted} conducted · ${percentage}%`
                  : 'Add your subjects and timetable to get started.'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
