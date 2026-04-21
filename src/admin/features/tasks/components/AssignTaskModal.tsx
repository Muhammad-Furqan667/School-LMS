import React, { useState } from 'react';
import { ClipboardList, X, Calendar, User, BookOpen } from 'lucide-react';
import type { TaskFormState } from '../types/task.types';

interface AssignTaskModalProps {
  assignments: any[];
  onClose: () => void;
  onSubmit: (task: TaskFormState) => Promise<void>;
}

export const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  assignments,
  onClose,
  onSubmit,
}) => {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [form, setForm] = useState<TaskFormState>({
    assignment_id: '',
    task_description: '',
    target_date: new Date().toISOString().split('T')[0],
  });

  // Unique Classes from assignments
  const classOptions = Array.from(new Set(assignments.map(a => a.class_id)))
    .map(id => {
      const a = assignments.find(asgn => asgn.class_id === id);
      return a ? { id, label: `Grade ${a.class?.grade}${a.class?.section}` } : null;
    })
    .filter(Boolean) as { id: string; label: string }[];

  // Teachers assigned to selected class
  const teacherOptions = assignments
    .filter(a => a.class_id === selectedClassId)
    .map(a => a.teacher)
    .filter((v, i, a) => a.findIndex(t => t?.id === v?.id) === i);

  // Subjects taught by selected teacher in selected class
  const subjectOptions = assignments
    .filter(a => a.class_id === selectedClassId && a.teacher_id === selectedTeacherId)
    .map(a => a.subject);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find the actual assignment_id
    const finalAssignment = assignments.find(a => 
      a.class_id === selectedClassId && 
      a.teacher_id === selectedTeacherId && 
      a.subject_id === form.assignment_id
    );

    if (!finalAssignment) return;

    onSubmit({
      ...form,
      assignment_id: finalAssignment.id
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 md:p-12 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start mb-10">
          <div className="flex gap-4">
            <div className="h-14 w-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
              <ClipboardList className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">Lesson Planner</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Directing Faculty Curriculum</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="h-5 w-5 text-slate-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Select Class */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">1. Target Class</label>
            <div className="relative">
              <select
                required
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setSelectedTeacherId('');
                  setForm({ ...form, assignment_id: '' });
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-amber-500/5 font-bold text-slate-900 appearance-none"
              >
                <option value="">Choose Class...</option>
                {classOptions.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Step 2: Select Teacher (Dependent on Class) */}
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${!selectedClassId ? 'text-slate-200' : 'text-slate-400'}`}>2. Select Teacher</label>
            <div className="relative">
              <select
                required
                disabled={!selectedClassId}
                value={selectedTeacherId}
                onChange={(e) => {
                  setSelectedTeacherId(e.target.value);
                  setForm({ ...form, assignment_id: '' });
                }}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-amber-500/5 font-bold text-slate-900 appearance-none disabled:opacity-30"
              >
                <option value="">{selectedClassId ? 'Select Faculty...' : 'Waiting for Class...'}</option>
                {teacherOptions.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
          </div>

          {/* Step 3: Select Subject (Dependent on Teacher & Class) */}
          <div className="space-y-2">
            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${!selectedTeacherId ? 'text-slate-200' : 'text-slate-400'}`}>3. Target Subject</label>
            <div className="relative">
              <select
                required
                disabled={!selectedTeacherId}
                value={form.assignment_id}
                onChange={(e) => setForm({ ...form, assignment_id: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-amber-500/5 font-bold text-slate-900 appearance-none disabled:opacity-30"
              >
                <option value="">{selectedTeacherId ? 'Select Subject...' : 'Waiting for Teacher...'}</option>
                {subjectOptions.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code || 'GEN'})</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teaching Objective / Task</label>
            <textarea
              required
              value={form.task_description}
              onChange={(e) => setForm({ ...form, task_description: e.target.value })}
              placeholder="What specifically should be taught?"
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-amber-500/5 font-medium text-slate-800 placeholder:text-slate-300 transition-all resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Execution Date</label>
            <div className="relative">
              <input
                required
                type="date"
                value={form.target_date}
                onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-amber-500/5 font-black text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] shadow-xl hover:bg-amber-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Issue Directive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
