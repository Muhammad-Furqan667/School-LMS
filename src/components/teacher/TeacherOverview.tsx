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
  timetable: any[];
  teacherTimetable: any[];
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
  timetable,
  teacherTimetable,
  students,
  results,
  setActiveStudentForMarks,
  setIsMarksModalOpen,
  history
}) => {
  const navigate = useNavigate();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${m} ${ampm}`;
  };
  
  // Build time slots starting from 8 AM and ending between 3 PM and 5 PM based on data
  const timeSlots = (() => {
    const base = [8, 9, 10, 11, 12, 13, 14, 15]; // 08:00 to 15:00 (3 PM)
    const dataHours = teacherTimetable.map(t => parseInt(t.start_time.split(':')[0]));
    const maxHour = Math.min(Math.max(...base, ...dataHours), 17); // Max cap at 5 PM
    
    const slots = [];
    for (let h = 8; h <= maxHour; h++) {
       slots.push(`${h.toString().padStart(2, '0')}:00:00`);
    }
    return slots;
  })();

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
        <div className="h-24 w-24 bg-slate-100 rounded-3xl flex items-center justify-center">
          <BookOpen className="h-12 w-12 text-slate-300" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome to your Workplace</h1>
          <p className="text-slate-500 max-w-md mx-auto">
            You haven't been assigned to any classes yet. Please contact the administrator to set up your subjects and schedule.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate('/teacher/profile')}
             className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all"
           >
             View My Profile
           </button>
        </div>
      </div>
    );
  }

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

      {/* Main Grid: Diary Form vs Weekly Timetable */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Left Column: Diary & Stats */}
        <div className="xl:col-span-1 space-y-8">
          <section className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
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
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm font-bold"
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
                  placeholder="What happened in class today?"
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none resize-none transition-all text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <BookOpen className="h-4 w-4" />
                Publish
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100">
               <div 
                 onClick={() => navigate('/teacher/salary')}
                 className="p-5 bg-slate-900 rounded-2xl text-white relative overflow-hidden cursor-pointer group"
               >
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mb-2">My Earnings</p>
                  <p className="text-xl font-black group-hover:text-indigo-300 transition-colors">Rs. {teacherStats?.revenue?.toLocaleString() || 0}</p>
                  <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-indigo-400 uppercase">
                     <TrendingUp className="h-3 w-3" />
                     View Details
                  </div>
                  <div className="absolute -right-4 -bottom-4 h-20 w-20 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
               </div>
            </div>
          </section>
        </div>

        {/* Weekly Timetable Grid */}
        <div className="xl:col-span-3 space-y-8">
          <section className="bg-surface rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <h2 className="font-bold text-slate-900 text-lg">Weekly Schedule</h2>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mon - Fri</p>
            </div>

            <div className="overflow-x-auto">
               <div className="min-w-[700px] p-4">
                  {/* Grid Table */}
                  <div 
                    className="grid gap-1.5"
                    style={{ gridTemplateColumns: `80px repeat(${timeSlots.length || 1}, minmax(100px, 1fr))` }}
                  >
                    {/* Header: Times */}
                    <div className="h-8 invisible" />
                    {timeSlots.length > 0 ? timeSlots.map(time => (
                      <div key={time} className="h-8 flex items-center justify-center font-black text-[9px] text-slate-400 uppercase tracking-widest bg-slate-50 rounded-lg border border-slate-100">
                        {formatTime(time)}
                      </div>
                    )) : (
                      <div className="h-8 flex items-center justify-center text-slate-400 text-[9px] italic">No slots</div>
                    )}

                    {/* Rows: Days */}
                    {days.map(day => (
                      <React.Fragment key={day}>
                        <div className="h-16 flex items-center pr-4 font-bold text-xs text-slate-900 border-r border-slate-100">
                          {day}
                        </div>
                        {timeSlots.map(time => {
                          const slot = teacherTimetable.find(s => s.day_of_week === day && s.start_time === time);
                          return (
                            <div key={time} className="h-16 p-1 relative group">
                              {slot ? (
                                <div className="h-full w-full bg-indigo-50 rounded-lg border border-indigo-100 p-1.5 flex flex-col justify-center animate-in zoom-in-95 duration-300 shadow-sm">
                                  <p className="text-[8px] font-black text-indigo-600 uppercase leading-none mb-0.5">
                                    {slot.assignment?.class?.grade}-{slot.assignment?.class?.section}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-900 truncate tracking-tight">
                                    {slot.assignment?.subject?.name}
                                  </p>
                                  <p className="text-[8px] text-slate-400 font-bold mt-0.5">
                                    {formatTime(slot.start_time)}
                                  </p>
                                </div>
                              ) : (
                                <div className="h-full w-full bg-slate-50/30 rounded-lg border border-dashed border-slate-100" />
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
               </div>
            </div>
          </section>

          {/* Student Grid */}
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

          {/* Recent History */}
          <section className="bg-surface rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
             <div className="flex items-center gap-2 mb-6">
                <History className="h-6 w-6 text-slate-300" />
                <h2 className="font-bold text-slate-900 text-xl">Recent Diary Posts</h2>
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
