import React from 'react';
import { Target, Trophy, Calendar, CheckCircle2, AlertCircle, Clock, TrendingUp, BarChart3 } from 'lucide-react';

interface AcademicHubProps {
  results: any[];
  attendanceStats: any;
  activeChild: any;
}

export const AcademicHub: React.FC<AcademicHubProps> = ({ results, attendanceStats, activeChild }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Attendance Rate</p>
           <h2 className="text-6xl font-black tabular-nums">{attendanceStats?.percentage || 0}%</h2>
           <div className="flex items-center gap-2 mt-6 text-emerald-400 font-bold text-xs">
              <TrendingUp className="h-4 w-4" />
              Keep it above 85%
           </div>
           <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-white/5 rounded-full blur-[80px]" />
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 flex flex-col justify-between shadow-sm">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Assessment Average</p>
              <h3 className="text-4xl font-black text-slate-900">
                 {results.length > 0 
                    ? Math.round(results.reduce((acc, r) => acc + ((r.marks_obtained || 0) / (r.total_marks || 100) * 100), 0) / results.length)
                    : 0}%
              </h3>
           </div>
           <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                      {i}
                   </div>
                 ))}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Compared to class avg</span>
           </div>
        </div>

        <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100 flex flex-col justify-between shadow-sm">
           <div>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Latest Badge</p>
              <h3 className="text-xl font-black text-indigo-900">Active Learner</h3>
           </div>
           <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
              <Trophy className="h-8 w-8 text-indigo-600" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Results List */}
        <section className="bg-surface rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
               <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Examination Marks
               </h2>
               <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase">Session 2026</div>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                     <tr>
                        <th className="px-8 py-4">Subject</th>
                        <th className="px-8 py-4">Total</th>
                        <th className="px-8 py-4 text-right">Obtained</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {results.map((res, idx) => (
                       <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6">
                             <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{res.subjects?.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold">{res.exam_type}</p>
                          </td>
                          <td className="px-8 py-6 font-bold text-slate-400 text-sm whitespace-nowrap">{res.total_marks}</td>
                          <td className="px-8 py-6 text-right">
                             <span className={`text-sm font-black ${(res.marks_obtained || 0) / (res.total_marks || 1) < 0.4 ? 'text-red-500' : 'text-emerald-600'}`}>
                                {res.marks_obtained || 0}
                             </span>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
               {results.length === 0 && (
                 <div className="py-20 text-center text-slate-400 italic text-sm">No exam results recorded for this session.</div>
               )}
            </div>
        </section>

        {/* Attendance Breakdown */}
        <section className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
               <Calendar className="h-5 w-5 text-indigo-600" />
               Daily Log Summary
            </h2>
            <div className="space-y-6">
               <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Present', count: attendanceStats?.present || 0, color: 'emerald', icon: CheckCircle2 },
                    { label: 'Late', count: attendanceStats?.late || 0, color: 'amber', icon: Clock },
                    { label: 'Absent', count: attendanceStats?.absent || 0, color: 'red', icon: AlertCircle }
                  ].map((stat) => (
                    <div key={stat.label} className={`p-4 bg-${stat.color}-50 rounded-2xl border border-${stat.color}-100`}>
                       <stat.icon className={`h-4 w-4 text-${stat.color}-600 mb-2`} />
                       <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{stat.label}</p>
                       <p className={`text-xl font-black text-${stat.color}-700`}>{stat.count}</p>
                    </div>
                  ))}
               </div>

               <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                     <BarChart3 className="h-4 w-4 text-slate-400" />
                     Academic Insights
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                     Student attendance is correlated with academic performance. {activeChild.name} is currently showing a stable attendance record.
                  </p>
               </div>
            </div>
        </section>
      </div>
    </div>
  );
};
