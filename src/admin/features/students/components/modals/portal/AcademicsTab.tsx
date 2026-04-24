import React from 'react';
import { Target, Trophy, Calendar, FileText, BarChart3, TrendingUp } from 'lucide-react';
import type { Student, AcademicResults } from '../../../types/student.types';

interface AcademicsTabProps {
  selectedStudent: Student;
  academicResults: AcademicResults;
  handleUpdateResult: (result: any, status: 'pass' | 'fail' | 'pending', student: Student) => Promise<void>;
}

export const AcademicsTab: React.FC<AcademicsTabProps> = ({
  selectedStudent,
  academicResults,
  handleUpdateResult,
}) => {
  // Group current results by assessment
  const groupedCurrent = academicResults.current.reduce((acc: any, res) => {
    const title = res.assessment?.title || 'Class Assessments';
    if (!acc[title]) acc[title] = [];
    acc[title].push(res);
    return acc;
  }, {});

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Current Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Session Performance</p>
            <h3 className="text-4xl font-black">
               {academicResults.current.length > 0 
                  ? Math.round(academicResults.current.reduce((acc, r) => acc + ((r.marks_obtained || 0) / (r.total_marks || 100) * 100), 0) / academicResults.current.length)
                  : 0}%
            </h3>
            <div className="mt-6 flex items-center gap-2 text-indigo-400 font-bold text-xs">
               <TrendingUp className="h-4 w-4" />
               Academic Aggregate
            </div>
         </div>
         <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 flex items-center gap-6">
            <div className="h-16 w-16 bg-white rounded-2xl border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xl shadow-indigo-500/10">
               <Trophy className="h-8 w-8" />
            </div>
            <div>
               <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">Rank Standing</p>
               <h4 className="text-xl font-black text-indigo-900 italic">Distinction Path</h4>
            </div>
         </div>
      </div>

      {/* Current Session Sections */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" /> Active Assessments
          </h4>
          <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
             Batch: {selectedStudent.classes?.grade}-{selectedStudent.classes?.section}
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedCurrent).map(([title, items]: [string, any]) => (
            <div key={title} className="bg-white border-2 border-slate-50 rounded-[2.5rem] overflow-hidden transition-all hover:border-indigo-100 group">
              <div className="p-6 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm text-indigo-600">
                       <FileText className="h-6 w-6" />
                    </div>
                    <div>
                       <h5 className="font-black text-slate-900 text-sm leading-none mb-1">{title}</h5>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{items[0]?.assessment?.date ? new Date(items[0].assessment.date).toLocaleDateString() : 'Active Assessment'}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-lg font-black text-slate-900 leading-none">
                       {Math.round(items.reduce((acc: number, r: any) => acc + ((r.marks_obtained || 0) / (r.total_marks || 1) * 100), 0) / items.length)}%
                    </p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Average</p>
                 </div>
              </div>
              
              <div className="p-4 sm:p-6 divide-y divide-slate-50">
                 {items.map((res: any, idx: number) => (
                   <div key={idx} className="py-4 flex items-center justify-between group-hover:bg-slate-50/30 transition-colors px-2 rounded-xl">
                      <div>
                         <p className="text-sm font-black text-slate-800">{res.subjects?.name}</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Graded by Faculty</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                         <span className={`text-base font-black ${(res.marks_obtained || 0) / (res.total_marks || 1) < 0.4 ? 'text-red-500' : 'text-indigo-600'}`}>
                            {res.marks_obtained} <span className="text-xs text-slate-400 font-bold">/ {res.total_marks}</span>
                         </span>
                         <div className="h-1 w-20 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                               className={`h-full rounded-full transition-all duration-1000 ${ (res.marks_obtained || 0) / (res.total_marks || 1) < 0.4 ? 'bg-red-500' : 'bg-indigo-600' }`} 
                               style={{ width: `${(res.marks_obtained || 0) / (res.total_marks || 1) * 100}%` }}
                            />
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          ))}

          {academicResults.current.length === 0 && (
            <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
               <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                  <BarChart3 className="h-8 w-8" />
               </div>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No assessment data for this student</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Archives */}
      {academicResults.past && academicResults.past.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-slate-100">
          <div className="flex items-center gap-3 px-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Academic Transcript Archives</h4>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {academicResults.past.map((session: any) => {
              const percentage = session.totalMarks > 0 ? Math.round((session.obtainedMarks / session.totalMarks) * 100) : 0;
              return (
                <div key={session.label} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                  <div className="p-6 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{session.label}</p>
                      <h5 className="text-sm font-black text-slate-900 italic">Session Legacy Record</h5>
                    </div>
                    <div className="text-right">
                       <span className="text-2xl font-black text-slate-900">{percentage}%</span>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aggregate</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {session.results?.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                          <div>
                            <p className="text-xs font-black text-slate-900 leading-none mb-1">{r.subjects?.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.assessment?.title || 'Annual Test'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-900">{r.marks_obtained}/{r.total_marks || 100}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
