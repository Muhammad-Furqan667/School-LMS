import React from 'react';
import { X, Calendar } from 'lucide-react';
import type { ClassFormState } from '../../types/class.types';

interface AddClassModalProps {
  classForm: ClassFormState;
  setClassForm: React.Dispatch<React.SetStateAction<ClassFormState>>;
  teachers: any[];
  sessions: any[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
  classForm,
  setClassForm,
  teachers,
  sessions,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
         <div className="flex justify-between items-start mb-10">
           <div>
              <h2 className="text-2xl font-black">Add Class</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Define new structural grade</p>
           </div>
           <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X className="h-5 w-5"/></button>
         </div>
         <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Academic Session</label>
              <div className="relative">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                <select
                  required
                  value={classForm.academic_year_id}
                  onChange={(e) => setClassForm({...classForm, academic_year_id: e.target.value})}
                  className="w-full p-5 pl-14 bg-slate-50 border rounded-2xl outline-none font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/5 transition-all"
                >
                  <option value="">Select Session</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>{s.year_label} {s.is_current ? '(Current)' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Grade</label>
                <input 
                  required 
                  value={classForm.grade} 
                  onChange={(e) => setClassForm({...classForm, grade: e.target.value})} 
                  className="w-full p-5 bg-slate-50 border rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all" 
                  placeholder="e.g. 10" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Section</label>
                <input 
                  required 
                  value={classForm.section} 
                  onChange={(e) => setClassForm({...classForm, section: e.target.value.toUpperCase()})} 
                  className="w-full p-5 bg-slate-50 border rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all" 
                  placeholder="e.g. A" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Section Moderator</label>
              <select
                required
                value={classForm.class_teacher_id}
                onChange={(e) => setClassForm({...classForm, class_teacher_id: e.target.value})}
                className="w-full p-5 bg-slate-50 border rounded-2xl outline-none font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/5 transition-all"
              >
                <option value="">Select Moderator</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
               Publish Class
            </button>
         </form>
      </div>
    </div>
  );
};
