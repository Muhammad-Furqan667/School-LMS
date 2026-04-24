import React from 'react';
import { Calendar, Users, Trash2, ShieldCheck, Book } from 'lucide-react';
import type { Class } from '../types/class.types';

interface ClassGridProps {
  classes: Class[];
  loading: boolean;
  handleDeleteClass: (id: string) => Promise<void>;
  openTimetable: (c: Class) => Promise<void>;
  openStudentList: (c: Class) => Promise<void>;
  onAssignModerator: (c: Class) => void;
  onManageSubjects: (c: Class) => void;
}

export const ClassGrid: React.FC<ClassGridProps> = ({
  classes,
  loading,
  handleDeleteClass,
  openTimetable,
  openStudentList,
  onAssignModerator,
  onManageSubjects,
}) => {
  const groupedClasses = React.useMemo(() => {
    const groups: Record<string, Class[]> = {};
    classes.forEach(c => {
      const session = c.academic_years?.year_label || 'Unassigned Session';
      if (!groups[session]) groups[session] = [];
      groups[session].push(c);
    });
    // Sort sessions by label descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .reduce((acc, key) => {
        acc[key] = groups[key];
        return acc;
      }, {} as Record<string, Class[]>);
  }, [classes]);

  if (loading) {
    return (
      <div className="col-span-full p-20 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {Object.entries(groupedClasses).map(([session, sessionClasses]) => (
        <div key={session} className="space-y-6">
          <div className="flex items-center gap-4 px-2">
            <div className="h-px flex-1 bg-slate-200" />
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
              Session {session}
            </h2>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sessionClasses.map((c) => (
              <div key={c.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group relative">
                <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onAssignModerator(c)} 
                    className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl"
                    title="Assign Moderator"
                  >
                     <ShieldCheck className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDeleteClass(c.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-[1.25rem] flex items-center justify-center font-black text-slate-400 text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  {c.grade}
                </div>
                <div className="mt-6 mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{c.grade}{c.section}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Section {c.section}</p>
                  {c.class_teacher && (
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">Moderator: {c.class_teacher.full_name}</p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onManageSubjects(c)}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 transition-all flex items-center justify-center gap-2"
                    >
                      <Book className="h-4 w-4" /> Subjects
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openTimetable(c)}
                      className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar className="h-4 w-4" /> Schedule
                    </button>
                    <button
                      onClick={() => openStudentList(c)}
                      className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Users className="h-4 w-4" /> Students
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
