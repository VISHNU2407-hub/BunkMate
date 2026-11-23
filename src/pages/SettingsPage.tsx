import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RotateCcw,
  User,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useAttendance } from '../contexts/AttendanceContext';
import { BunkMateMascot } from '../components/BunkMateMascot';

export const SettingsPage: React.FC = () => {
  const {
    state,
    updateSettings,
    exportDataJSON,
    importDataJSON,
    resetAllData,
  } = useAttendance();

  const [studentName, setStudentName] = useState(state.settings.studentName);
  const [collegeName, setCollegeName] = useState(state.settings.collegeName);
  const [semester, setSemester] = useState(state.settings.semester);
  const [academicYear, setAcademicYear] = useState(state.settings.academicYear);
  const [defaultTargetPercent, setDefaultTargetPercent] = useState(
    state.settings.defaultTargetPercent
  );
  const [defaultFloorPercent, setDefaultFloorPercent] = useState(
    state.settings.defaultFloorPercent
  );

  const isNative = Capacitor.isNativePlatform();
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (
      !Number.isFinite(defaultTargetPercent) ||
      defaultTargetPercent < 1 ||
      defaultTargetPercent > 100 ||
      !Number.isFinite(defaultFloorPercent) ||
      defaultFloorPercent < 1 ||
      defaultFloorPercent > 100
    ) {
      setProfileError('Target and floor percentages must be between 1 and 100.');
      return;
    }

    if (defaultFloorPercent > defaultTargetPercent) {
      setProfileError('Floor minimum cannot be greater than the default target percentage.');
      return;
    }

    updateSettings({
      studentName: studentName.trim(),
      collegeName: collegeName.trim(),
      semester: semester.trim(),
      academicYear: academicYear.trim(),
      defaultTargetPercent: Number(defaultTargetPercent),
      defaultFloorPercent: Number(defaultFloorPercent),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bunkmate-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // Revoke on the next tick so the download can start in every browser.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importDataJSON(text);
      if (success) {
        setImportStatus('Backup data imported successfully!');
      } else {
        setImportStatus('Error: Invalid JSON backup file.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
    // Allow re-importing the same file after a failed attempt.
    e.target.value = '';
  };

  const handleReset = () => {
    if (
      confirm(
        'WARNING: This will completely wipe all registered subjects, timetables, and attendance logs. Are you sure?'
      )
    ) {
      resetAllData();
      alert('Application reset to initial blank state.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-indigo-600" />
          <span>System Settings & Preferences</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Personalize student profile, set attendance thresholds, and manage data backups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <span>Student Profile & Academic Rules</span>
            </h2>
            {savedSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved successfully!</span>
              </span>
            )}
          </div>

          {profileError && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Hunter"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7047FF] placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  College / Institute Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University / MIT"
                  value={collegeName}
                  onChange={(e) => setCollegeName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7047FF] placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Current Semester
                </label>
                <input
                  type="text"
                  placeholder="e.g. Semester 5"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7047FF] placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2026-2027"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#7047FF] placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <label className="block font-bold text-slate-700 mb-1">
                  Default Target Percentage (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={defaultTargetPercent}
                  onChange={(e) => setDefaultTargetPercent(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Standard college hall ticket target (e.g. 75%)</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <label className="block font-bold text-slate-700 mb-1">
                  Safety Floor Minimum (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={defaultFloorPercent}
                  onChange={(e) => setDefaultFloorPercent(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Triggers detention warning if breached (e.g. 60%)</p>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Backup & Restore (JSON)
            </h3>

            {importStatus && (
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                {importStatus}
              </div>
            )}

            <p className="text-xs text-slate-500 leading-relaxed">
              Export your attendance records, timetable, and subjects as a portable JSON file to
              safeguard your data or switch devices.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200:bg-slate-700 text-slate-700 text-xs font-bold transition"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Export JSON Backup</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200:bg-slate-700 text-slate-700 text-xs font-bold transition cursor-pointer">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Import Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Data Management &amp; Danger Zone
            </h3>

            <p className="text-xs text-slate-500 leading-relaxed">
              Reset your registered courses, time slots, and attendance marks to start fresh for a new semester.
            </p>

            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition border border-red-200 text-xs font-bold"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Attendance Data</span>
            </button>
          </div>

          {!isNative && (
            <div className="bg-[#171642] text-white p-6 rounded-3xl shadow-sm space-y-3 border border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#7047FF]" />
                  Android Application
                </h3>
                <BunkMateMascot size="xs" variant="float" />
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Install BunkMate on your phone for offline access, home-screen launch and hardware back-button support.
              </p>
              <a
                href="/BunkMate.apk"
                download="BunkMate.apk"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#7047FF] hover:bg-[#5f38e6] transition font-bold text-xs shadow-md shadow-[#7047FF]/25"
              >
                <Download className="w-4 h-4" />
                <span>Download APK</span>
              </a>
              <p className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Data never leaves this device.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
