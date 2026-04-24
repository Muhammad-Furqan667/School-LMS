import React, { useEffect, useState } from 'react';
import { X, Calendar, BookOpen, Settings, CheckCircle2, XCircle, Clock, Trash2, Award } from 'lucide-react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';

interface StudentClassDetailViewProps {
  student: any;
  classData: any;
  onClose: () => void;
  onBack: () => void;
}

export const StudentClassDetailView: React.FC<StudentClassDetailViewProps> = ({
  student,
  classData,
  onClose,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'attendance' | 'marks' | 'actions'>('attendance');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [attData, resData, assData, attStats] = await Promise.all([
          SchoolService.getAttendanceHistory(student.id),
          SchoolService.getResults(student.id),
          SchoolService.getTeacherAssignmentsByClass(classData.id),
          SchoolService.getAttendanceStats(student.id)
        ]);
        setAttendance(attData || []);
        setResults(resData || []);
        setAssignments(assData || []);
        setStats(attStats);
      } catch (error) {
        console.error('Failed to fetch student detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [student.id, classData.id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await SchoolService.updateStudentStatus(student.id, newStatus);
      toast.success(`Student status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleEditAttendance = async (recordId: string, newStatus: string) => {
    try {
      await SchoolService.updateAttendanceRecord(recordId, newStatus);
      
      toast.success('Attendance updated');
      setAttendance(prev => prev.map(r => r.id === recordId ? { ...r, status: newStatus } : r));
      // Refresh stats
      const newStats = await SchoolService.getAttendanceStats(student.id);
      setStats(newStats);
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-white rounded-[3.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500 h-[90vh]">
        
        {/* Header Section */}
        <div className="bg-slate-900 p-10 text-white relative">
          <button onClick={onBack} className="absolute left-8 top-10 flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
            <X className="h-4 w-4" /> Back to List
          </button>
          <div className="absolute right-8 top-8 flex items-center gap-3">
            <button 
              onClick={() => window.print()}
              className="px-6 py-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-colors text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              Print Report
            </button>
            <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-8 mt-6">
            <div className="h-24 w-24 bg-white/10 rounded-[2.5rem] border border-white/10 flex items-center justify-center font-black text-4xl shadow-2xl backdrop-blur-md">
              {student.name[0]}
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">{student.name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                  {student.roll_no}
                </span>
                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                  Grade {classData.grade}{classData.section} · {classData.academic_years?.year_label}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-10">
            {[
              { id: 'attendance', label: 'Attendance', icon: Calendar },
              { id: 'marks', label: 'Academic Marks', icon: BookOpen },
              { id: 'actions', label: 'Management', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' 
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Student Data...</p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'attendance' && (
                <div className="space-y-8">
                  {/* Stats Card */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attendance Precision</p>
                      <h3 className="text-5xl font-black text-slate-900">{stats?.percentage}%</h3>
                    </div>
                    <div className="flex gap-8 text-center">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Present</p>
                        <p className="text-xl font-black text-emerald-600">{stats?.present}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Absent</p>
                        <p className="text-xl font-black text-red-500">{stats?.absent}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Taken</p>
                        <p className="text-xl font-black text-slate-900">{stats?.total}</p>
                      </div>
                    </div>
                  </div>

                  {/* Logs */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest px-2">Daily Logs (Chronological)</h4>
                    <div className="grid gap-3">
                      {attendance.length === 0 ? (
                        <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                          <p className="text-xs font-bold text-slate-400">No attendance records found for this student.</p>
                        </div>
                      ) : (
                        attendance.map((record) => (
                          <div key={record.id} className="bg-white px-8 py-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                            <div className="flex items-center gap-4">
                              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                record.status === 'present' ? 'bg-emerald-50 text-emerald-600' :
                                record.status === 'absent' ? 'bg-red-50 text-red-600' :
                                'bg-amber-50 text-amber-600'
                              }`}>
                                {record.status === 'present' ? <CheckCircle2 className="h-5 w-5" /> :
                                 record.status === 'absent' ? <XCircle className="h-5 w-5" /> :
                                 <Clock className="h-5 w-5" />}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status: {record.status}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleEditAttendance(record.id, record.status === 'present' ? 'absent' : 'present')}
                                className="px-4 py-2 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                              >
                                Toggle Status
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'marks' && (
                <div className="space-y-8">
                  <div className="grid gap-6">
                    {assignments.map((assignment) => {
                      const subjectResults = results.filter(r => r.subject_id === assignment.subject_id);
                      return (
                        <div key={assignment.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">
                                <BookOpen className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="text-xl font-black text-slate-900">{assignment.subject?.name}</h3>
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Instructor: {assignment.teacher?.full_name}</p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {subjectResults.length === 0 ? (
                              <div className="col-span-full py-4 text-center bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                No assessment records for this subject
                              </div>
                            ) : (
                              subjectResults.map((res) => (
                                <div key={res.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{res.exam_type}</p>
                                  <div className="flex items-end gap-2">
                                    <p className="text-2xl font-black text-slate-900">{res.marks_obtained}</p>
                                    <p className="text-xs font-bold text-slate-400 mb-1">/ {res.total_marks}</p>
                                  </div>
                                  <div className={`mt-3 inline-flex px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                    res.status === 'pass' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                                  }`}>
                                    {res.status}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Dummy Report Card Summary */}
                  <div className="bg-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                      <Award className="h-48 w-48" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-black tracking-tight mb-8">Consolidated Performance Report</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Total Obtained</p>
                          <p className="text-3xl font-black">{results.reduce((acc, r) => acc + Number(r.marks_obtained), 0)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Total Weightage</p>
                          <p className="text-3xl font-black">{results.reduce((acc, r) => acc + Number(r.total_marks), 0)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Success Rate</p>
                          <p className="text-3xl font-black">
                            {results.length > 0 
                              ? Math.round((results.filter(r => r.status === 'pass').length / results.length) * 100) 
                              : 0}%
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Subjects Passed</p>
                          <p className="text-3xl font-black">{results.filter(r => r.status === 'pass').length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'actions' && (
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">Identity & Status Control</h3>
                    <div className="grid gap-4">
                      {[
                        { label: 'Active Student', status: 'Active', desc: 'Full access to school services and portal.', color: 'emerald' },
                        { label: 'Suspend Student', status: 'Suspended', desc: 'Restricts access to school portal and results.', color: 'amber' },
                        { label: 'Mark as Left School', status: 'Left', desc: 'Archive student records and end enrollment.', color: 'red' },
                      ].map((action) => (
                        <button
                          key={action.status}
                          onClick={() => handleUpdateStatus(action.status)}
                          className={`flex items-center justify-between p-6 rounded-3xl border transition-all text-left ${
                            student.status === action.status 
                            ? `bg-${action.color}-50 border-${action.color}-200 ring-2 ring-${action.color}-500/10` 
                            : 'bg-white border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <p className={`font-black text-sm text-slate-900`}>{action.label}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-1">{action.desc}</p>
                          </div>
                          {student.status === action.status && (
                            <div className={`h-8 w-8 bg-${action.color}-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-${action.color}-500/20`}>
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100">
                    <div className="flex items-center gap-4 text-red-600 mb-4">
                      <Trash2 className="h-5 w-5" />
                      <h3 className="font-black text-sm uppercase tracking-widest">Danger Zone</h3>
                    </div>
                    <p className="text-xs text-red-500 font-medium mb-6">Deleting a student will permanently remove all their attendance, marks, and financial records. This action cannot be undone.</p>
                    <button className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-500/20">
                      Expel Permanently
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
