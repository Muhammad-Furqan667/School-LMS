import React from 'react';
import { User, X, ChevronRight, Calendar } from 'lucide-react';
import type { Class, StudentFormState } from '../../types/student.types';

interface EnrollStudentModalProps {
  studentForm: StudentFormState;
  setStudentForm: React.Dispatch<React.SetStateAction<StudentFormState>>;
  classes: Class[];
  sessions: any[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  studentForm,
  setStudentForm,
  classes,
  sessions,
  loading,
  onClose,
  onSubmit,
}) => {

  const filteredClasses = classes.filter(c => {
    if (!studentForm.academic_year_id) return true;
    return c.academic_year_id === studentForm.academic_year_id;
  });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl p-6 sm:p-12 animate-in zoom-in-95 duration-300 my-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
          <div className="flex gap-5">
            <div className="h-16 w-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{studentForm.id ? 'Modify Profile' : 'Student Enrollment'}</h2>
              <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Secure Data Collection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all self-end sm:self-auto">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                 <h3 className="text-sm font-black text-slate-800">1. Structural Assignment</h3>
                 <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded uppercase tracking-widest">Required</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Academic Session</label>
                    <div className="relative group">
                      <select
                        required
                        value={studentForm.academic_year_id}
                        onChange={(e) => setStudentForm({ ...studentForm, academic_year_id: e.target.value, class_id: '' })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/20 transition-all font-bold cursor-pointer"
                      >
                        <option value="">Select Session</option>
                        {sessions.map(s => (
                          <option key={s.id} value={s.id}>{s.year_label} {s.is_current ? '(Current)' : ''}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none rotate-90" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Grade</label>
                    <div className="relative group">
                      <select
                        required
                        disabled={!studentForm.academic_year_id}
                        value={studentForm.class_id}
                        onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold cursor-pointer disabled:opacity-50"
                      >
                        <option value="">{studentForm.academic_year_id ? 'Select Grade' : 'Pick Session First'}</option>
                        {filteredClasses
                          .sort((a, b) => {
                            const numA = parseInt(a.grade);
                            const numB = parseInt(b.grade);
                            if (!isNaN(numA) && !isNaN(numB)) {
                              if (numA !== numB) return numA - numB;
                              return a.section.localeCompare(b.section);
                            }
                            return a.grade.localeCompare(b.grade);
                          })
                          .map(c => (
                            <option key={c.id} value={c.id}>Grade {c.grade}-{c.section}</option>
                          ))}
                      </select>
                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none rotate-90" />
                    </div>
                 </div>
              </div>

              <div>
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Admission Date</label>
                 <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    <input
                      required
                      type="date"
                      value={studentForm.admission_date}
                      onChange={(e) => setStudentForm({ ...studentForm, admission_date: e.target.value })}
                      className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold"
                    />
                 </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">2. Personal Information</h3>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Student Name</label>
                  <input
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold"
                    placeholder="e.g. Abdullah Khan"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Registration Roll No</label>
                  <input
                    required
                    value={studentForm.roll_no}
                    onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold"
                    placeholder="e.g. REG-2024-001"
                  />
                </div>
                <div>
                   <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Student's CNIC / B-Form</label>
                   <input
                     required
                     value={studentForm.cnic}
                     onChange={(e) => setStudentForm({ ...studentForm, cnic: e.target.value })}
                     className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold tracking-widest"
                     placeholder="13 Digits No"
                     maxLength={13}
                   />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">3. Parent / Guardian Access</h3>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Father / Guardian Name</label>
                <input
                  required
                  value={studentForm.father_name}
                  onChange={(e) => setStudentForm({ ...studentForm, father_name: e.target.value })}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold"
                  placeholder="e.g. Javed Khan"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Parent's CNIC (13 Digits)</label>
                <input
                  required
                  value={studentForm.parent_cnic}
                  onChange={(e) => setStudentForm({ ...studentForm, parent_cnic: e.target.value })}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold tracking-widest"
                  placeholder="e.g. 3520212345678"
                  maxLength={13}
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{studentForm.id ? "Change Parent Password (Optional)" : "Set Parent Password"}</label>
                <input
                  required={!studentForm.id}
                  type="text"
                  value={studentForm.password || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                  className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold"
                  placeholder={studentForm.id ? "Leave blank to keep existing password" : "e.g. Password123"}
                />
              </div>

              <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Enrollment Summary</p>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-500">Selected Session</span>
                       <span className="text-xs font-black text-slate-900">{sessions.find(s => s.id === studentForm.academic_year_id)?.year_label || '---'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-500">Target Grade</span>
                       <span className="text-xs font-black text-slate-900">{classes.find(c => c.id === studentForm.class_id) ? `Grade ${classes.find(c => c.id === studentForm.class_id)?.grade}-${classes.find(c => c.id === studentForm.class_id)?.section}` : '---'}</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl hover:bg-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Processing Registry...' : studentForm.id ? 'Save Profile Changes' : 'Confirm New Enrollment'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-10 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all"
            >
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
