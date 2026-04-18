import React, { useState, useEffect } from 'react';
import { X, User, Hash, School } from 'lucide-react';
import type { Tables } from '../../types/database';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (student: any) => Promise<void>;
  student?: Tables<'students'> | null;
  classes: Tables<'classes'>[];
}

export const StudentModal: React.FC<StudentModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  student,
  classes 
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [classId, setClassId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setName(student.name);
      setRollNo(student.roll_no);
      setClassId(student.class_id || '');
    } else {
      setName('');
      setRollNo('');
      setClassId('');
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm({
        ...(student?.id ? { id: student.id } : {}),
        name,
        roll_no: rollNo,
        class_id: classId || null
      });
      onClose();
    } catch (error) {
      // Error handled by parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Student Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Roll Number / ID</label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                required
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="STU-001"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Class</label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none"
              >
                <option value="">No Class Assigned</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>Grade {c.grade}-{c.section}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : student ? 'Update Identity' : 'Register Student'}
          </button>
        </form>
      </div>
    </div>
  );
};
