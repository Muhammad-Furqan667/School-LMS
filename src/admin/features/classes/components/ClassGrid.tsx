import React from 'react';
import { Calendar, Clock, Trash2, ShieldCheck } from 'lucide-react';
import type { Class } from '../types/class.types';

interface ClassGridProps {
  classes: Class[];
  loading: boolean;
  handleDeleteClass: (id: string) => Promise<void>;
  openTimetable: (c: Class) => Promise<void>;
  openAttendance: (c: Class) => Promise<void>;
  onAssignModerator: (c: Class) => void;
}

export const ClassGrid: React.FC<ClassGridProps> = ({
  classes,
  loading,
  handleDeleteClass,
  openTimetable,
  openAttendance,
  onAssignModerator,
}) => {
  if (loading) {
    return (
      <div className="col-span-full p-20 flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {classes.map((c) => (
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
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{c.grade}{c.section} {c.academic_years?.year_label}</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Section {c.section}</p>
            {c.class_teacher && (
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">Moderator: {c.class_teacher.full_name}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openTimetable(c)}
              className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="h-4 w-4" /> Schedule
            </button>
            <button
              onClick={() => openAttendance(c)}
              className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Clock className="h-4 w-4" /> Attendance
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
