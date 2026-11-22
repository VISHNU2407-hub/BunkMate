import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { useAttendance } from '../contexts/AttendanceContext';
import { WORKING_DAYS } from '../utils/attendanceMath';

export const Timetable: React.FC = () => {
  const {
    state,
    activeTimetable,
    updateTimetableSlot,
    addTimeSlot,
    removeTimeSlot,
    setTimetableEffectiveDate,
  } = useAttendance();

  const [newSlotInput, setNewSlotInput] = useState('');
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotInput.trim()) return;
    addTimeSlot(newSlotInput.trim());
    setNewSlotInput('');
    setIsSlotModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-200/70 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Weekly Timetable
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Assign subjects to periods for Monday through Saturday. Changes apply from the effective date.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <label className="flex items-center justify-between sm:justify-start gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs">
            <span className="font-bold text-slate-600 whitespace-nowrap">Effective</span>
            <input
              type="date"
              value={activeTimetable.effectiveDate}
              onChange={(e) => e.target.value && setTimetableEffectiveDate(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none tabular"
            />
          </label>

          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Period</span>
          </button>
        </div>
      </div>

      <div className="surface overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
          <span className="text-[11px] font-bold text-slate-500">
            {activeTimetable.slots.length} periods &bull; {state.subjects.length} subjects
          </span>
          <span className="text-[10px] font-semibold text-slate-400 sm:hidden">
            Swipe sideways to see all periods
          </span>
          <span className="hidden sm:inline text-[10px] font-semibold text-slate-400">
            Hover a period header to delete it
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[720px]">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="sticky left-0 z-10 py-3 px-4 w-28 border-r border-slate-200 bg-slate-50">
                  Day
                </th>
                {activeTimetable.slots.map((slotLabel, slotIndex) => (
                  <th
                    key={slotIndex}
                    className="py-2 px-2 text-center border-r border-slate-200 last:border-r-0 min-w-[7.5rem]"
                  >
                    <div className="flex items-center justify-center gap-1 group">
                      <span className="whitespace-nowrap font-mono text-[10px] tabular">{slotLabel}</span>
                      <button
                        onClick={() => removeTimeSlot(slotIndex)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded transition"
                        title="Delete slot column"
                        aria-label={`Delete ${slotLabel} column`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {WORKING_DAYS.map((day) => {
                const dayGrid = activeTimetable.grid[day] || [];
                return (
                  <tr key={day} className="hover:bg-slate-50/50 transition">
                    <td className="sticky left-0 z-10 py-2.5 px-4 font-bold text-slate-700 border-r border-slate-200 bg-white">
                      {day.slice(0, 3)}
                      <span className="hidden xl:inline">{day.slice(3)}</span>
                    </td>

                    {dayGrid.map((currentSubId, slotIndex) => {
                      const selected = state.subjects.find((s) => s.id === currentSubId);
                      return (
                        <td
                          key={slotIndex}
                          className="p-1.5 text-center border-r border-slate-100 last:border-r-0"
                        >
                          <div className="relative w-full group">
                            <select
                              value={currentSubId || ''}
                              onChange={(e) => updateTimetableSlot(day, slotIndex, e.target.value || null)}
                              aria-label={`${day} period ${slotIndex + 1}`}
                              className={`w-full border-0 rounded-lg py-2 pl-2 pr-6 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none cursor-pointer transition ${
                                !currentSubId
                                  ? 'text-slate-400 bg-transparent'
                                  : selected?.type === 'Lab'
                                  ? 'text-purple-700 bg-purple-50/70'
                                  : 'text-blue-700 bg-blue-50/70'
                              }`}
                            >
                              <option value="">Free</option>
                              {state.subjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>
                                  {sub.name} ({sub.type[0]})
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full max-w-sm shadow-2xl animate-rise">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Add Timetable Period</span>
            </h3>

            <form onSubmit={handleAddSlot} className="space-y-4 text-xs">
              <div>
                <label htmlFor="new-slot-label" className="block font-bold text-slate-700 mb-1">
                  Time slot label <span className="text-red-500">*</span>
                </label>
                <input
                  id="new-slot-label"
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. 03:00 - 04:00"
                  value={newSlotInput}
                  onChange={(e) => setNewSlotInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500/40 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Adds a new column across Monday through Saturday.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSlotModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  Add Period
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
