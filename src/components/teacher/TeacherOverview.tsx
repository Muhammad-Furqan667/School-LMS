import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  History,
  CheckCircle2,
  Users,
  Trophy,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';

interface TeacherOverviewProps {
  assignments: any[];
  selectedAssignment: string;
  setSelectedAssignment: (val: string) => void;
  diaryContent: string;
  setDiaryContent: (val: string) => void;
  handleCreateDiary: (e: React.FormEvent) => void;
  teacherStats: any;
  setIsCourseModalOpen: (val: boolean) => void;
  timetable: any[];
  students: any[];
  results: any[];
  setActiveStudentForMarks: (val: any) => void;
  setIsMarksModalOpen: (val: boolean) => void;
  history: any[];
}

export const TeacherOverview: React.FC<TeacherOverviewProps> = ({
  assignments,
  selectedAssignment,
  setSelectedAssignment,
  diaryContent,
  setDiaryContent,
  handleCreateDiary,
  teacherStats,
  setIsCourseModalOpen,
  timetable,
  students,
  results,
  setActiveStudentForMarks,
  setIsMarksModalOpen,
  history
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Teacher Workplace</h1>
          <p className="text-slate-500 text-sm md:text-base">Manage your daily classroom diaries and schedules.</p>
        </div>
        <div className="hidden lg:block">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 italic text-sm">
            <CheckCircle2 className="h-4 w-4" />
            Connected to Real-time Sync
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Diary Entry Form */}
        <section className="lg:col-span-1 bg-surface rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Plus className="h-6 w-6 text-indigo-600" />
              </div>
              <h2 className="font-bold text-slate-900 text-xl">Post Diary</h2>
            </div>
          </div>

          <form onSubmit={handleCreateDiary} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Class / Subject</label>
              <select
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              >
                <option value="">Select a class</option>
                {assignments.map((asgn) => (
                  <option key={asgn.id} value={asgn.id}>
                    Grade {asgn.class.grade}-{asgn.class.section} • {asgn.subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Diary Content</label>
              <textarea
                required
                value={diaryContent}
                onChange={(e) => setDiaryContent(e.target.value)}
                placeholder="What happened in class today? Homework, test dates, etc."
                className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none transition-all"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Publish to Parents
            </button>
          </form>

          {/* Quick Stats Integration */}
          <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
             <div 
               onClick={() => navigate('/teacher/salary')}
               className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden cursor-pointer group"
             >
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-2">My Earnings</p>
                <p className="text-2xl font-black group-hover:text-indigo-300 transition-colors">Rs. {teacherStats?.revenue?.toLocaleString() || 0}</p>
                <div className="flex items-center gap-2 mt-4 text-[10px] font-black text-indigo-400 uppercase">
                   <TrendingUp className="h-3 w-3" />
                   View Breakdown
                </div>
                <div className="absolute -right-4 -bottom-4 h-20 w-20 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
             </div>
             
             <button 
               onClick={() => setIsCourseModalOpen(true)}
               className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 transition-all group"
             >
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                      <Award className="h-4 w-4 text-indigo-600 group-hover:text-white" />
                   </div>
                   <div className="text-left">
                      <p className="text-sm font-black text-slate-900">Configure Courses</p>
                      <p className="text-[10px] text-slate-500">Subject settings & fees</p>
                   </div>
                </div>
             </button>
          </div>
        </section>

        {/* Timetable & Student Grid */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-xl">Today's Timetable</h2>
              </div>
              <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Full Schedule</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {timetable.length > 0 ? (
                timetable.map((slot, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-center">
                    <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Per</span>
                      <span className="text-sm font-black text-indigo-600">{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{slot.assignment.subject.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{slot.start_time} - {slot.end_time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 col-span-2 text-center text-slate-400 text-sm italic">
                  No schedule found for this class today.
                </div>
              )}
            </div>
          </section>

          <section className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-xl">My Students</h2>
              </div>
              <button 
                onClick={() => navigate('/teacher/attendance')}
                className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100"
              >
                Mark Attendance
              </button>
            </div>
            
            <div className="overflow-x-auto -mx-6 md:mx-0">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((student) => {
                    const studentResult = results.find(r => r.student_id === student.id);
                    return (
                      <tr key={student.id} className="text-sm hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-black">#{student.roll_no}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{student.name}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${student.is_locked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {student.is_locked ? 'Locked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setActiveStudentForMarks(student);
                              setIsMarksModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all font-black text-[10px] uppercase tracking-wider shadow-sm"
                          >
                            {studentResult ? (
                              <><Target className="h-3 w-3" /> {studentResult.marks_obtained}/{studentResult.total_marks}</>
                            ) : (
                              <><Trophy className="h-3 w-3" /> Add Marks</>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {students.length === 0 && (
                <p className="text-center text-slate-400 py-12 text-sm italic">No students registered in this class.</p>
              )}
            </div>
          </section>

          <section className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
             <div className="flex items-center gap-2 mb-6">
                <History className="h-6 w-6 text-slate-300" />
                <h2 className="font-bold text-slate-900 text-xl">Recent Posts</h2>
              </div>
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((entry) => (
                    <div key={entry.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors">
                      <p className="text-slate-900 text-sm font-semibold mb-2 leading-relaxed">{entry.content}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm italic text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">No diary entries posted recently.</p>
                )}
              </div>
          </section>
        </div>
      </div>
    </div>
  );
};
