import React from 'react';
import { UserPlus, X } from 'lucide-react';
import type { HireFormState } from '../../types/teacher.types';

interface HireTeacherModalProps {
  hireForm: HireFormState;
  setHireForm: React.Dispatch<React.SetStateAction<HireFormState>>;
  subjects: any[];
  classes: any[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const HireTeacherModal: React.FC<HireTeacherModalProps> = ({
  hireForm,
  setHireForm,
  subjects,
  classes,
  loading,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
        {/* Sidebar Info */}
        <div className="md:w-56 bg-slate-900 p-10 text-white flex flex-col justify-between border-r border-white/5">
          <div className="h-14 w-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <div className="mt-10 md:mt-0">
            <h2 className="text-2xl font-black mb-1">Contract Entry</h2>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">New Faculty Onboarding</p>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={onSubmit} className="flex-1 p-8 md:p-12 space-y-8">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Authentication & Payroll</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-50 rounded-lg">
              <X className="h-5 w-5 text-slate-300" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Legal Full Name</label>
              <input
                required
                value={hireForm.full_name}
                onChange={(e) => setHireForm({ ...hireForm, full_name: e.target.value })}
                className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-black text-slate-900"
                placeholder="e.g. Professor Ali"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Portal Username</label>
                <input
                  required
                  value={hireForm.username}
                  onChange={(e) => setHireForm({ ...hireForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-black text-slate-900"
                  placeholder="e.g. p.ali"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Initial Password</label>
                <input
                  required
                  value={hireForm.password}
                  onChange={(e) => setHireForm({ ...hireForm, password: e.target.value })}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-black text-slate-900"
                  placeholder="e.g. Teacher123!"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Initial Class</label>
                <select
                  value={hireForm.class_id}
                  onChange={(e) => setHireForm({ ...hireForm, class_id: e.target.value, subject_id: '' })}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-black text-slate-900 appearance-none cursor-pointer"
                >
                  <option value="">Select Section</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>Grade {c.grade}{c.section}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Primary Subject</label>
                <select
                  required
                  disabled={!hireForm.class_id}
                  value={hireForm.subject_id}
                  onChange={(e) => setHireForm({ ...hireForm, subject_id: e.target.value })}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-black text-slate-900 appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">{hireForm.class_id ? "Select Subject" : "Select Class first"}</option>
                  {hireForm.class_id && subjects
                    .filter(s => {
                      const cls = classes.find(c => c.id === hireForm.class_id);
                      return cls && s.grade_level?.toString() === cls.grade.toString();
                    })
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name} (Grade {s.grade_level})</option>
                    ))
                  }
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Agreed Salary (Monthly)</label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-black">PKR</span>
                <input
                  type="number"
                  required
                  value={hireForm.salary}
                  onChange={(e) => setHireForm({ ...hireForm, salary: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-16 pr-5 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-black text-slate-900"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-emerald-600 text-white font-black rounded-[2rem] shadow-2xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 hover:bg-emerald-700"
            >
              {loading ? 'Initializing Secure Entry...' : 'Confirm Faculty Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
