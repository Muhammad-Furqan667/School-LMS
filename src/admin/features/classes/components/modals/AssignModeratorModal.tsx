import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import type { Class } from '../../types/class.types';
import type { Teacher } from '../../../teachers/types/teacher.types';

interface AssignModeratorModalProps {
  selectedClass: Class;
  teachers: Teacher[];
  onClose: () => void;
  onSubmit: (teacherId: string) => Promise<void>;
}

export const AssignModeratorModal: React.FC<AssignModeratorModalProps> = ({
  selectedClass,
  teachers,
  onClose,
  onSubmit,
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState(selectedClass.class_teacher_id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(selectedTeacherId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Set Moderator</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Grade {selectedClass.grade}{selectedClass.section}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Choose Moderator</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-indigo-500/5 font-black text-slate-900 appearance-none cursor-pointer"
              >
                <option value="">No Moderator Assigned</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name}
                  </option>
                ))}
              </select>
            </div>

            {!selectedClass.academic_years?.is_current && (
              <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex items-start gap-3">
                <div className="h-5 w-5 bg-red-100 rounded-full flex items-center justify-center text-red-600 flex-shrink-0 mt-0.5">
                   <span className="font-black text-xs">!</span>
                </div>
                <p className="text-[11px] font-black text-red-700 uppercase tracking-tight leading-relaxed">
                  Moderator assignment is restricted to the current session only. This class belongs to a legacy or future session.
                </p>
              </div>
            )}

            {selectedClass.academic_years?.is_current && (
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                <p className="text-[11px] font-bold text-amber-700 leading-relaxed italic">
                  "The Section Moderator will have exclusive authority to mark attendance for this specific grade and section."
                </p>
              </div>
            )}

            <button
              onClick={handleConfirm}
              disabled={isSubmitting || !selectedClass.academic_years?.is_current}
              className={`w-full py-5 font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl ${
                !selectedClass.academic_years?.is_current
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200'
              }`}
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>{!selectedClass.academic_years?.is_current ? 'Assignment Locked' : 'Update Moderator Access'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
