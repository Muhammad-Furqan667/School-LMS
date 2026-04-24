import React from 'react';
import { Calendar, Clock, BookOpen, User } from 'lucide-react';

interface StudentTimetableProps {
  timetable: any[];
}

export const StudentTimetable: React.FC<StudentTimetableProps> = ({ timetable = [] }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Group timetable by day
  const groupedTimetable = timetable.reduce((acc: any, slot) => {
    if (!acc[slot.day_of_week]) acc[slot.day_of_week] = [];
    acc[slot.day_of_week].push(slot);
    return acc;
  }, {});

  // Sort slots by start time
  Object.keys(groupedTimetable).forEach(day => {
    groupedTimetable[day].sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Weekly Academic Schedule</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Class-specific lecture hours & faculty</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.print()}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Print Schedule
          </button>
          <div className="h-12 w-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
            <Calendar className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {days.map((day) => (
          <div key={day} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-6">
               <h4 className="text-lg font-black text-slate-900">{day}</h4>
               <div className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-100">
                  {groupedTimetable[day]?.length || 0} Lectures
               </div>
            </div>

            <div className="space-y-4">
              {(!groupedTimetable[day] || groupedTimetable[day].length === 0) ? (
                <div className="py-10 text-center border-2 border-dashed border-slate-50 rounded-[1.5rem]">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">No classes scheduled</p>
                </div>
              ) : (
                groupedTimetable[day].map((slot: any) => (
                  <div key={slot.id} className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl group-hover:border-indigo-100 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                       <div className="h-8 w-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                          <BookOpen className="h-4 w-4" />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-900">{slot.assignment?.subject?.name}</p>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                             <User className="h-3 w-3" />
                             {slot.assignment?.teacher?.full_name}
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100/50">
                       <Clock className="h-3 w-3 text-indigo-400" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tabular-nums">
                          {slot.start_time.slice(0, 5)} — {slot.end_time.slice(0, 5)}
                       </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
