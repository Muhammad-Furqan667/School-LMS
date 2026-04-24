import React, { useState } from 'react';
import { Target, Trophy, TrendingUp, FileText } from 'lucide-react';

interface AcademicHubProps {
  results: any[];
  activeChild: any;
}

export const AcademicHub: React.FC<AcademicHubProps> = ({ 
  results, 
  activeChild 
}) => {

  // Group results by subject
  const subjectGroups = results.reduce((acc: any, res) => {
    // Extremely robust subject identification: check all possible join names and handle array/object shapes
    const subjectData = res.subjects || res.subject || res.assessment?.subjects || res.assessment?.subject;
    const subject = Array.isArray(subjectData) ? subjectData[0] : subjectData;
    const subjectName = subject?.name || 'General Examination';
    
    if (!acc[subjectName]) {
      acc[subjectName] = {
        name: subjectName,
        teacher: (Array.isArray(res.teachers) ? res.teachers[0] : res.teachers)?.full_name || 
                 (Array.isArray(res.teacher) ? res.teacher[0] : res.teacher)?.full_name ||
                 (Array.isArray(res.assessment?.teachers) ? res.assessment.teachers[0] : res.assessment?.teachers)?.full_name ||
                 (Array.isArray(res.assessment?.teacher) ? res.assessment.teacher[0] : res.assessment?.teacher)?.full_name ||
                 'Assigned Faculty',
        tests: []
      };
    }
    acc[subjectName].tests.push(res);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-10 space-y-12 animate-in fade-in duration-700 printable-area">
      {/* Print Header */}
      <div className="hidden print:flex items-center gap-8 mb-10 pb-10 border-b border-slate-100">
         <div className="h-24 w-24 bg-slate-900 rounded-[2rem] flex items-center justify-center font-black text-white text-4xl overflow-hidden">
            {activeChild?.profile_picture_url ? (
              <img src={activeChild.profile_picture_url} className="h-full w-full object-cover" alt="Profile" />
            ) : (
              activeChild?.name?.[0]
            )}
         </div>
         <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{activeChild?.name}</h1>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mt-2">
               Grade {activeChild?.classes?.grade}{activeChild?.classes?.section} · Academic Report · {activeChild?.classes?.academic_years?.year_label}
            </p>
         </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 no-print">
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl flex items-center gap-8">
           <div className="h-24 w-24 bg-white/10 rounded-[2.5rem] border border-white/10 flex items-center justify-center font-black text-4xl shadow-2xl backdrop-blur-md overflow-hidden relative z-10">
              {activeChild?.profile_picture_url ? (
                <img src={activeChild.profile_picture_url} className="h-full w-full object-cover" alt="Profile" />
              ) : (
                activeChild?.name?.[0]
              )}
           </div>
           <div className="relative z-10">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Assessment Average</p>
              <h3 className="text-5xl font-black tabular-nums">
                 {results.length > 0 
                    ? Math.round(results.reduce((acc, r) => acc + ((r.marks_obtained || 0) / (r.total_marks || 100) * 100), 0) / results.length)
                    : 0}%
              </h3>
              <div className="flex items-center gap-2 mt-4 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                 <TrendingUp className="h-4 w-4" />
                 Academic Performance
              </div>
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
            {Object.keys(subjectGroups).length === 0 ? (
               <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                  <AlertCircle className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-black italic">No achievement records detected for the current session.</p>
               </div>
            ) : Object.values(subjectGroups).map((group: any) => (
              <div key={group.name} className={`bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ${group.tests.length === 0 ? 'print:hidden' : ''}`}>
                <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                         <FileText className="h-6 w-6" />
                      </div>
                      <div>
                         <h3 className="font-black text-slate-900 text-lg">{group.name}</h3>
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            Instructor: {group.teacher || 'Assigned Faculty'}
                         </p>
                      </div>
                   </div>
                </div>
                <div className="p-4 overflow-x-auto">
                   <table className="w-full text-left min-w-[600px]">
                      <thead className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                         <tr>
                            <th className="px-8 py-4">Assessment Cycle</th>
                            <th className="px-8 py-4 text-center">Marks Captured</th>
                            <th className="px-8 py-4 text-right">Outcome</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {group.tests.map((res: any, idx: number) => (
                           <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                 <p className="font-black text-slate-900 text-sm uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                                   {res.assessment?.title || 'General Examination'}
                                 </p>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase">{res.exam_type} · {new Date(res.created_at).toLocaleDateString()}</p>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <div className="inline-flex items-end gap-2 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                                    <span className="text-xl font-black text-slate-900">
                                       {res.marks_obtained}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 mb-1">
                                       / {res.total_marks}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 {(() => {
                                   const passThreshold = Number(res.assessment?.passing_marks || (Number(res.total_marks) * 0.4));
                                   const obtained = Number(res.marks_obtained);
                                   
                                   let status = res.status?.toLowerCase();
                                   // If status is pending or missing, calculate based on threshold
                                   if (!status || status === 'pending') {
                                      status = obtained >= passThreshold ? 'pass' : 'fail';
                                   }

                                   return (
                                     <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                       status === 'pass' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                                     }`}>
                                       {status}
                                     </span>
                                   );
                                 })()}
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
