import React, { useState } from 'react';
import { Target, Trophy, Calendar, CheckCircle2, AlertCircle, Clock, TrendingUp, BarChart3, FileText, ClipboardList } from 'lucide-react';
import { AttendanceHistory } from './AttendanceHistory';
import { StudentTimetable } from './StudentTimetable';

interface AcademicHubProps {
  results: any[];
  attendanceStats: any;
  attendanceHistory: any[];
  timetable: any[];
  activeChild: any;
}

export const AcademicHub: React.FC<AcademicHubProps> = ({ 
  results, 
  attendanceStats, 
  attendanceHistory, 
  timetable, 
  activeChild 
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'attendance' | 'timetable'>('results');

  // Group results by assessment title
  const groupedResults = results.reduce((acc: any, res) => {
    const title = res.assessment?.title || 'General Examination';
    if (!acc[title]) acc[title] = [];
    acc[title].push(res);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-10 space-y-12 animate-in fade-in duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Assessment Average</p>
           <h3 className="text-6xl font-black tabular-nums">
              {results.length > 0 
                 ? Math.round(results.reduce((acc, r) => acc + ((r.marks_obtained || 0) / (r.total_marks || 100) * 100), 0) / results.length)
                 : 0}%
           </h3>
           <div className="flex items-center gap-2 mt-6 text-emerald-400 font-bold text-xs uppercase tracking-widest">
              <TrendingUp className="h-4 w-4" />
              Above Class Average
           </div>
           <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/5 rounded-full blur-[80px]" />
        </div>

        <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
           <div>
              <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest mb-1">Academic Batch</p>
              <h3 className="text-3xl font-black">Grade {activeChild?.classes?.grade}{activeChild?.classes?.section}</h3>
              <p className="text-indigo-200 text-xs font-bold mt-2 uppercase tracking-widest">{activeChild?.classes?.academic_years?.year_label} Session</p>
           </div>
           <div className="absolute right-10 bottom-10 h-20 w-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-md">
              <Trophy className="h-10 w-10 text-white" />
           </div>
        </div>
      </div>

      <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                   <Target className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Achievement Registry</h2>
             </div>
             <button 
               onClick={() => window.print()}
               className="hidden md:flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95"
             >
               Export Academic Record
             </button>
          </div>

          <div className="grid gap-8">
            {Object.keys(groupedResults).length === 0 ? (
               <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <AlertCircle className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-black italic">No achievement records detected for the current session.</p>
               </div>
            ) : Object.entries(groupedResults).map(([title, items]: [string, any]) => (
              <div key={title} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
                <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                         <FileText className="h-6 w-6" />
                      </div>
                      <div>
                         <h3 className="font-black text-slate-900 text-lg">{title}</h3>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            Official Assessment Log
                         </p>
                      </div>
                   </div>
                </div>
                <div className="p-4">
                   <table className="w-full text-left">
                      <tbody className="divide-y divide-slate-50">
                         {items.map((res: any, idx: number) => (
                           <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                 <p className="font-black text-slate-900 text-sm uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{res.subjects?.name}</p>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="inline-flex items-end gap-2 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                                    <span className="text-xl font-black text-slate-900">
                                       {res.marks_obtained}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 mb-1">
                                       / {res.total_marks}
                                    </span>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
            ))}
          </div>
      </section>
    </div>
  );
};
