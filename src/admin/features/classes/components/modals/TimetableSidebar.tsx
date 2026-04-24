import React from 'react';
import type { TimetableFormState } from '../../types/class.types';

interface TimetableSidebarProps {
  selectedClass: any;
  timetableForm: TimetableFormState;
  setTimetableForm: React.Dispatch<React.SetStateAction<TimetableFormState>>;
  assignments: any[];
  daysOfWeek: string[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export const TimetableSidebar: React.FC<TimetableSidebarProps> = ({
  selectedClass,
  timetableForm,
  setTimetableForm,
  assignments,
  daysOfWeek,
  onSubmit,
  onClose,
}) => {
  return (
    <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-slate-200 flex flex-col z-10 overflow-y-auto">
      <h2 className="text-2xl font-black">Scheduler</h2>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Class {selectedClass.grade}{selectedClass.section}</p>
      
      {!selectedClass.academic_years?.is_current ? (
        <div className="mt-8 space-y-6 flex-1">
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 space-y-3">
             <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Archived Session</p>
             <p className="text-xs text-amber-600 leading-relaxed font-medium">
               This class belongs to a previous academic session. Historical timetables are read-only and cannot be modified.
             </p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-6 flex-1">
          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Assignment</label>
             <select 
               required 
               value={timetableForm.assignment_id} 
               onChange={(e) => setTimetableForm({...timetableForm, assignment_id: e.target.value})} 
               className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none appearance-none font-black text-xs cursor-pointer focus:ring-2 focus:ring-emerald-600 transition-all"
             >
                <option value="">Choose...</option>
                {assignments.map(a => (
                   <option key={a.id} value={a.id}>{a.subject?.name} ({a.teacher?.full_name})</option>
                ))}
             </select>
          </div>
          <div>
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Day</label>
             <div className="grid grid-cols-1 gap-2">
                {daysOfWeek.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTimetableForm({...timetableForm, day_of_week: d})}
                    className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${timetableForm.day_of_week === d ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'}`}
                  >
                    {d}
                  </button>
                ))}
             </div>
          </div>
          <div className="flex gap-4">
             <div className="flex-1">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Starts</label>
               <input required type="time" value={timetableForm.start_time} onChange={(e) => setTimetableForm({...timetableForm, start_time: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-black text-xs" />
             </div>
             <div className="flex-1">
               <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ends</label>
               <input required type="time" value={timetableForm.end_time} onChange={(e) => setTimetableForm({...timetableForm, end_time: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-black text-xs" />
             </div>
          </div>
          <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest">Add to Schedule</button>
        </form>
      )}
      <button onClick={onClose} className="mt-6 w-full py-4 text-slate-400 hover:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest">Exit Editor</button>
    </div>
  );
};
