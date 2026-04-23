import React from 'react';
import { Award, ChevronRight, Briefcase } from 'lucide-react';
import type { Teacher } from '../types/teacher.types';

interface TeacherGridProps {
  filteredTeachers: Teacher[];
  selectedTeacher: Teacher | null;
  loading: boolean;
  openTeacherDetail: (teacher: Teacher) => void;
}

export const TeacherGrid: React.FC<TeacherGridProps> = ({
  filteredTeachers,
  selectedTeacher,
  loading,
  openTeacherDetail,
}) => {
  return (
    <div className={`grid gap-4 md:gap-6 transition-all ${selectedTeacher ? 'grid-cols-1 lg:grid-cols-2 xl:flex-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full'}`}>
      {filteredTeachers.map((teacher) => (
        <div
          key={teacher.id}
          onClick={() => openTeacherDetail(teacher)}
          className={`bg-white rounded-[2.5rem] border p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer relative overflow-hidden ${selectedTeacher?.id === teacher.id ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-xl' : 'border-slate-200'
            }`}
        >
          <div className="flex items-start justify-between mb-8">
            <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-[1.25rem] flex items-center justify-center font-black text-slate-300 text-2xl group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300">
              {teacher.full_name[0]}
            </div>
            <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 group-hover:text-emerald-500 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-1 mb-8">
            <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">{teacher.full_name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
              {teacher.joined_at
                ? `Active since ${new Date(teacher.joined_at).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}`
                : 'New Faculty Entry'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-50 mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 leading-none">Net Salary</p>
              <p className="font-black text-slate-900 text-sm">
                PKR {(teacher.salary || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 leading-none">Curriculum</p>
              <div className="flex items-center gap-1.5">
                <Award className="h-3 w-3 text-amber-500" />
                <span className="font-black text-slate-900 text-sm">{teacher.teacher_assignments?.length || 0} Subjects</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(teacher.teacher_assignments || []).slice(0, 4).map((a: any) => (
              <span key={a.id} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black border border-indigo-100">
                {a.subject?.name || 'Subject'}{a.class ? ` - G${a.class.grade}` : ''}
              </span>
            ))}
            {(teacher.teacher_assignments?.length || 0) > 4 && (
              <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black">
                +{teacher.teacher_assignments.length - 4} More
              </span>
            )}
          </div>
        </div>
      ))}

      {loading && (
        <div className="col-span-full p-20 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Syncing Academy Records...</p>
        </div>
      )}

      {!loading && filteredTeachers.length === 0 && (
        <div className="col-span-full p-20 text-center">
          <div className="h-20 w-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <Briefcase className="h-10 w-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-black mb-1 italic">No faculty records detected</p>
        </div>
      )}
    </div>
  );
};
