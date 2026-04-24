import React, { useEffect, useState } from 'react';
import { X, TrendingUp, Calendar, BookOpen, CheckCircle2 } from 'lucide-react';
import { SchoolService } from '../../../../../services/schoolService';
import { toast } from 'sonner';

interface PromoteStudentModalProps {
  student: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const PromoteStudentModal: React.FC<PromoteStudentModalProps> = ({
  student,
  onClose,
  onSuccess
}) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionData, classData] = await Promise.all([
          SchoolService.getAcademicYears(),
          SchoolService.getClasses()
        ]);
        setSessions(sessionData || []);
        setClasses(classData || []);
        
        // Default to current session or latest
        const currentSession = sessionData?.find((s: any) => s.is_current) || sessionData?.[0];
        if (currentSession) setSelectedSession(currentSession.id);
      } catch (error) {
        toast.error('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredClasses = classes.filter(c => c.academic_year_id === selectedSession);

  const handlePromote = async () => {
    if (!selectedClass) {
      toast.error('Please select a target class');
      return;
    }

    try {
      setSubmitting(true);
      await SchoolService.promoteStudents([student.id], selectedClass, selectedSession);
      toast.success(`${student.name} has been promoted successfully!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to promote student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Academic Promotion</h3>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Transition Management</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {loading ? (
            <div className="py-10 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Academic Batches...</p>
            </div>
          ) : (
            <>
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-100">
                  {student.name[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{student.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Current: Grade {student.classes?.grade}{student.classes?.section}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">
                    Target Session
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={selectedSession}
                      onChange={(e) => {
                        setSelectedSession(e.target.value);
                        setSelectedClass('');
                      }}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none"
                    >
                      <option value="">Select Session</option>
                      {sessions.map(s => (
                        <option key={s.id} value={s.id}>{s.year_label} {s.is_current ? '(Current)' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">
                    Target Class & Section
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      disabled={!selectedSession}
                      className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none disabled:opacity-50"
                    >
                      <option value="">Select Class</option>
                      {filteredClasses.map(c => (
                        <option key={c.id} value={c.id}>Grade {c.grade} - Section {c.section}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handlePromote}
                  disabled={submitting || !selectedClass}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
                >
                  {submitting ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Execute Promotion
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
