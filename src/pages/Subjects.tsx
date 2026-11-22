import React, { useMemo, useState } from 'react';
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  FlaskConical,
} from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';
import { BunkMateMascot } from '../components/BunkMateMascot';
import type { Subject, SubjectType } from '../types';

export const Subjects: React.FC = () => {
  const { state, subjectStatsMap, addSubject, updateSubject, deleteSubject } = useAttendance();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<SubjectType>('Theory');
  const [targetPercentage, setTargetPercentage] = useState<number>(state.settings.defaultTargetPercent);
  const [floorPercentage, setFloorPercentage] = useState<number>(state.settings.defaultFloorPercent);
  const [error, setError] = useState<string | null>(null);

  const orderedSubjects = useMemo(
    () => [
      ...state.subjects.filter((s) => s.type === 'Theory'),
      ...state.subjects.filter((s) => s.type === 'Lab'),
    ],
    [state.subjects]
  );

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setType('Theory');
    setTargetPercentage(state.settings.defaultTargetPercent);
    setFloorPercentage(state.settings.defaultFloorPercent);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setType(sub.type);
    setTargetPercentage(sub.targetPercentage ?? state.settings.defaultTargetPercent);
    setFloorPercentage(sub.floorPercentage ?? state.settings.defaultFloorPercent);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setError('Subject name is required.');
      return;
    }

    if (!Number.isFinite(targetPercentage) || targetPercentage < 1 || targetPercentage > 100) {
      setError('Target percentage must be between 1 and 100.');
      return;
    }

    if (!Number.isFinite(floorPercentage) || floorPercentage < 1 || floorPercentage > 100) {
      setError('Safety floor must be between 1 and 100.');
      return;
    }

    if (floorPercentage > targetPercentage) {
      setError('The safety floor cannot be greater than the target percentage.');
      return;
    }

    const isDuplicate = state.subjects.some(
      (s) => s.id !== editingId && s.name.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      setError(`A course named "${cleanName}" already exists.`);
      return;
    }

    if (editingId) {
      updateSubject(editingId, {
        name: cleanName,
        type,
        targetPercentage: Number(targetPercentage),
        floorPercentage: Number(floorPercentage),
      });
    } else {
      addSubject({
        name: cleanName,
        type,
        targetPercentage: Number(targetPercentage),
        floorPercentage: Number(floorPercentage),
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, subName: string) => {
    if (state.subjects.length <= 1) {
      alert('You must have at least one course registered.');
      return;
    }

    if (
      confirm(
        `Remove "${subName}"? It will also be removed from your weekly timetable. Existing attendance history is kept.`
      )
    ) {
      deleteSubject(id);
    }
  };

  const renderStats = (sub: Subject) => {
    const stats = subjectStatsMap[sub.id];
    const hasData = Boolean(stats && stats.total > 0);
    const pct = stats ? stats.percentage : 0;
    const target = sub.targetPercentage ?? state.settings.defaultTargetPercent;
    const floor = sub.floorPercentage ?? state.settings.defaultFloorPercent;
    const isCritical = stats?.status === 'critical';
    const tone = !hasData
      ? 'text-slate-400'
      : isCritical
      ? 'text-red-600'
      : pct < target
      ? 'text-amber-600'
      : 'text-emerald-600';

    return { stats, pct, target, floor, isCritical, hasData, tone };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/70 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Curriculum &amp; Subjects
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage theory and laboratory courses, per-subject targets, and safety floors.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition self-stretch sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {state.subjects.length === 0 ? (
        <div className="surface py-14 px-6 text-center max-w-lg mx-auto">
          <div className="flex justify-center mb-4">
            <BunkMateMascot size="lg" variant="bounce" />
          </div>
          <h2 className="text-lg font-extrabold text-[#171642]">No subjects registered yet</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Add each theory and lab course you're enrolled in. BunkMate will track your hours, safe bunks, and alert you before you breach the floor threshold.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7047FF] hover:bg-[#5f38e6] text-white text-xs font-bold shadow-md shadow-[#7047FF]/25 transition"
          >
            <Plus className="w-4 h-4" /> Add your first subject
          </button>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-2.5">
            {orderedSubjects.map((sub) => {
              const { stats, pct, target, floor, isCritical, hasData, tone } = renderStats(sub);
              const isLab = sub.type === 'Lab';
              return (
                <div key={sub.id} className="surface p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isLab ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {isLab ? <FlaskConical className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{sub.name}</h3>
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                            isLab
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {sub.type}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className={`text-2xl font-black tracking-tight tabular ${tone}`}>
                          {hasData ? `${pct}%` : '—'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 tabular">
                          {stats ? `${stats.attended} / ${stats.total}` : '0 / 0'} conducted
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCritical ? 'bg-red-500' : pct < target ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${hasData ? Math.min(100, Math.max(0, pct)) : 0}%` }}
                        />
                      </div>
                      <div className="mt-2.5 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                        <span>
                          Target {target}% · Floor {floor}%
                        </span>
                        <span>{stats?.safeBunks ? `${stats.safeBunks} safe bunks` : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(sub)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id, sub.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-[11px] font-bold text-red-600 hover:bg-red-100 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4 w-28">Type</th>
                  <th className="py-3.5 px-4 w-32">Attended / Total</th>
                  <th className="py-3.5 px-4 w-36">Attendance</th>
                  <th className="py-3.5 px-4 w-32">Target / Floor</th>
                  <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderedSubjects.map((sub) => {
                  const { stats, pct, target, floor, isCritical, hasData, tone } = renderStats(sub);
                  const isLab = sub.type === 'Lab';
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isLab ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {isLab ? (
                              <FlaskConical className="w-4 h-4" />
                            ) : (
                              <BookOpen className="w-4 h-4" />
                            )}
                          </span>
                          <span className="font-bold text-slate-900">{sub.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isLab ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {sub.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800 tabular">
                        {stats ? `${stats.attended} / ${stats.total}` : '0 / 0'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isCritical ? 'bg-red-500' : pct < target ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${hasData ? Math.min(100, Math.max(0, pct)) : 0}%` }}
                            />
                          </div>
                          <span className={`font-black text-sm tabular ${tone}`}>
                            {hasData ? `${pct}%` : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-500 tabular">
                        {target}% / {floor}%
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition"
                            aria-label={`Edit ${sub.name}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id, sub.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
                            aria-label={`Delete ${sub.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl max-h-[92dvh] overflow-y-auto animate-rise">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {editingId ? (
                  <Edit2 className="w-5 h-5 text-indigo-600" />
                ) : (
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                )}
                <span>{editingId ? 'Edit Subject' : 'Register New Subject'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label htmlFor="subject-name" className="block font-bold text-slate-700 mb-1">
                  Subject name <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject-name"
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-300 focus:outline-none"
                />
              </div>

              <div>
                <span className="block font-bold text-slate-700 mb-1.5">Subject type</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['Theory', 'Lab'] as SubjectType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                        type === t
                          ? t === 'Lab'
                            ? 'border-purple-300 bg-purple-50 text-purple-700'
                            : 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {t === 'Lab' ? (
                        <FlaskConical className="w-4 h-4" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                      {t === 'Lab' ? 'Laboratory' : 'Theory'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="subject-target" className="block font-bold text-slate-700 mb-1">
                    Target (%)
                  </label>
                  <input
                    id="subject-target"
                    type="number"
                    min="1"
                    max="100"
                    value={targetPercentage}
                    onChange={(e) => setTargetPercentage(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-center tabular focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="subject-floor" className="block font-bold text-slate-700 mb-1">
                    Safety floor (%)
                  </label>
                  <input
                    id="subject-floor"
                    type="number"
                    min="1"
                    max="100"
                    value={floorPercentage}
                    onChange={(e) => setFloorPercentage(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-center tabular focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                The target is your eligibility percentage. The floor is the minimum that triggers a
                detention warning.
              </p>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                >
                  {editingId ? 'Save Changes' : 'Register Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
