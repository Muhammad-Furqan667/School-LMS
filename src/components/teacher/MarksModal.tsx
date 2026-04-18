import React, { useState, useEffect } from 'react';
import { X, Trophy, Hash } from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { toast } from 'sonner';

interface MarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  assignment: any;
  currentResult?: any;
  onSuccess: () => void;
}

export const MarksModal: React.FC<MarksModalProps> = ({ 
  isOpen, 
  onClose, 
  student, 
  assignment,
  currentResult,
  onSuccess 
}) => {
  const [marks, setMarks] = useState('');
  const [total, setTotal] = useState('100');
  const [examType, setExamType] = useState('Monthly Test');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentResult) {
      setMarks(currentResult.marks_obtained.toString());
      setTotal(currentResult.total_marks.toString());
      setExamType(currentResult.exam_type);
    } else {
      setMarks('');
      setTotal('100');
      setExamType('Monthly Test');
    }
  }, [currentResult, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await SchoolService.upsertResult({
        ...(currentResult?.id ? { id: currentResult.id } : {}),
        student_id: student.id,
        subject_id: assignment.subject_id,
        teacher_id: assignment.teacher_id,
        marks_obtained: parseFloat(marks),
        total_marks: parseFloat(total),
        exam_type: examType,
        academic_year_id: assignment.class.academic_year_id
      });
      
      toast.success('Marks updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to save marks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Enter Marks</h2>
            <p className="text-xs text-slate-500 font-medium">{student.name} • {assignment.subject.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Exam Type</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
            >
              <option>Monthly Test</option>
              <option>Midterm Exam</option>
              <option>Final Exam</option>
              <option>Quiz</option>
              <option>Assignment</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Marks Obtained</label>
              <div className="relative">
                <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  required
                  step="0.1"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="85"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Marks</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  required
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Submit Results'}
          </button>
        </form>
      </div>
    </div>
  );
};
