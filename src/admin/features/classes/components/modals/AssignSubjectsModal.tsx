import React, { useState } from 'react';
import { X, Book, User, Plus, Trash2 } from 'lucide-react';

interface AssignSubjectsModalProps {
  selectedClass: any;
  subjects: any[];
  teachers: any[];
  assignments: any[];
  onAssign: (subjectId: string, teacherId: string) => Promise<void>;
  onRemove: (assignmentId: string) => Promise<void>;
  onClose: () => void;
}

export const AssignSubjectsModal: React.FC<AssignSubjectsModalProps> = ({
  selectedClass,
  subjects,
  teachers,
  assignments,
  onAssign,
  onRemove,
  onClose,
}) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !selectedTeacher) return;
    await onAssign(selectedSubject, selectedTeacher);
    setSelectedSubject('');
    setSelectedTeacher('');
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">Subject Registry</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Grade {selectedClass.grade}{selectedClass.section} Curriculum</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Add New Assignment Form */}
          <form onSubmit={handleAdd} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Subject</label>
              <select 
                required
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none font-black text-xs cursor-pointer focus:ring-2 focus:ring-indigo-600 transition-all appearance-none"
              >
                <option value="">Select Subject</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Teacher</label>
              <select 
                required
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none font-black text-xs cursor-pointer focus:ring-2 focus:ring-indigo-600 transition-all appearance-none"
              >
                <option value="">Select Teacher</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <button 
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Subject to Class
              </button>
            </div>
          </form>

          {/* List of Active Assignments */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Assigned Subjects</h3>
            {assignments.length === 0 ? (
              <div className="py-10 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem]">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No subjects defined yet</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {assignments.map(a => (
                  <div key={a.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-indigo-200 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Book className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{a.subject?.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                          <User className="h-3 w-3" /> {a.teacher?.full_name}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onRemove(a.id)}
                      className="p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
          <button 
            onClick={onClose}
            className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
          >
            Finished Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
