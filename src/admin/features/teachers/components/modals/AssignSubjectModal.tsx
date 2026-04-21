import React from 'react';
import { BookOpen, X, ChevronRight } from 'lucide-react';
import type { Teacher, AssignFormState } from '../../types/teacher.types';

interface AssignSubjectModalProps {
  selectedTeacher: Teacher;
  assignForm: AssignFormState;
  setAssignForm: React.Dispatch<React.SetStateAction<AssignFormState>>;
  classes: any[];
  subjects: any[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AssignSubjectModal: React.FC<AssignSubjectModalProps> = ({
  selectedTeacher,
  assignForm,
  setAssignForm,
  classes,
  subjects,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 md:p-12 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-10">
          <div className="flex gap-4">
            <div className="h-14 w-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
              <BookOpen className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">Curriculum</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Assigning to {selectedTeacher.full_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-xl">
            <X className="h-5 w-5 text-slate-300" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Academy Grade (Select First)</label>
            <div className="relative group">
              <select
                required
                value={assignForm.class_id}
                onChange={(e) => setAssignForm({ subject_id: '', class_id: e.target.value })}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none font-black text-slate-900"
              >
                <option value="">Select Class / Grade</option>
                {classes.map(c => <option key={c.id} value={c.id}>Grade {c.grade} - {c.section}</option>)}
              </select>
              <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none rotate-90" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Domain Specialization</label>
            <div className="relative group">
              <select
                required
                disabled={!assignForm.class_id}
                value={assignForm.subject_id}
                onChange={(e) => setAssignForm({ ...assignForm, subject_id: e.target.value })}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none font-black text-slate-900 disabled:opacity-50"
              >
                <option value="">{assignForm.class_id ? "Select Subject" : "Select a Class first"}</option>
                {assignForm.class_id && subjects
                  .filter(s => {
                    const cls = classes.find(c => c.id === assignForm.class_id);
                    return cls && s.grade_level?.toString() === cls.grade.toString();
                  })
                  .map(s => <option key={s.id} value={s.id}>{s.name} (Grade {s.grade_level})</option>)
                }
              </select>
              <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none rotate-90" />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] shadow-xl hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Verify & Commit Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
