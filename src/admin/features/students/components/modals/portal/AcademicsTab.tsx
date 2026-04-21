import React from 'react';
import { CheckCircle2, History, XCircle } from 'lucide-react';
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
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Current Year Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Current Session (Grade {selectedStudent.classes?.grade})
          </h4>
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="space-y-3">
          {academicResults.current?.map((result: any) => (
            <div key={result.subject_id} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${result.status === 'pass' ? 'bg-emerald-50 text-emerald-600' :
                      result.status === 'fail' ? 'bg-rose-50 text-rose-600' :
                        'bg-slate-50 text-slate-400'
                    }`}>
                    {result.subjects?.name?.[0]}
                  </div>
                  <p className="text-sm font-black text-slate-900">{result.subjects?.name}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${result.status === 'pass' ? 'bg-emerald-100 text-emerald-700' :
                    result.status === 'fail' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-500'
                  }`}>
                  {result.status}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateResult(result, 'pass', selectedStudent)}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${result.status === 'pass' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                >
                  <CheckCircle2 className="h-3 w-3" /> Pass
                </button>
                <button
                  onClick={() => handleUpdateResult(result, 'fail', selectedStudent)}
                  className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${result.status === 'fail' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600'}`}
                >
                  <XCircle className="h-3 w-3" /> Fail
                </button>
              </div>
            </div>
          ))}
          {academicResults.current?.length === 0 && (
            <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No current courses</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Session Section */}
      {academicResults.past && academicResults.past.length > 0 && (
        <div className="space-y-6 pt-8 border-t border-slate-100">
          <div className="flex items-center gap-2 px-2">
            <History className="h-4 w-4 text-slate-400" />
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Academic Transcript Archives</h4>
          </div>

          <div className="space-y-6">
            {academicResults.past.map((session: any) => {
              const percentage = session.totalMarks > 0 ? Math.round((session.obtainedMarks / session.totalMarks) * 100) : 0;
              return (
                <div key={session.label} className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                  <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{session.label}</p>
                      <h5 className="text-sm font-black text-slate-900">Historical Performance</h5>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900 leading-none">{percentage}%</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aggregate</p>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      {session.results?.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${r.status === 'pass' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                              {r.subjects?.name?.[0]}
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-900">{r.subjects?.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.exam_type || 'Annual Examination'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-slate-900">{r.marks_obtained}/{r.total_marks || 100}</p>
                            <div className={`text-[8px] font-black uppercase tracking-[0.1em] mt-0.5 ${r.status === 'pass' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {r.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center justify-between px-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div key={s} className={`h-1.5 w-6 rounded-full ${s <= (percentage / 20) ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Grade Standing: <span className="text-indigo-600">{percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Satisfactory' : 'Requires Improv.'}</span>
                      </p>
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
