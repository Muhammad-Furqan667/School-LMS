import React from 'react';
import { Calendar, Clock, User } from 'lucide-react';

interface StudentTimetableProps {
  timetable: any[];
}

export const StudentTimetable: React.FC<StudentTimetableProps> = ({ timetable = [] }) => {
  const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hasSaturdayData = timetable.some(s => s.day_of_week === 'Saturday');
  const days = hasSaturdayData ? [...defaultDays, 'Saturday'] : defaultDays;

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  // Build time slots starting from 7 AM, default ending at 4 PM (16:00), extending to 6 PM (18:00) if needed
  const timeSlots = (() => {
    const dataHours = timetable
      .map(t => t?.start_time ? parseInt(t.start_time.split(':')[0]) : null)
      .filter((h): h is number => h !== null);
    
    const startHour = 7;
    const defaultEndHour = 16; // 4 PM
    const maxHourInData = dataHours.length > 0 ? Math.max(...dataHours) : 0;
    
    // Extend up to 6 PM (18) if data exists beyond 4 PM (16)
    const endHour = Math.min(Math.max(defaultEndHour, maxHourInData), 18);
    
    const slots = [];
    for (let h = startHour; h <= endHour; h++) {
       slots.push(`${h.toString().padStart(2, '0')}:00:00`);
    }
    return slots;
  })();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 printable-area">
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

      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <h2 className="font-bold text-slate-900">Lecture Grid</h2>
          </div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {days[0]} - {days[days.length - 1]}
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px] p-6">
            <div 
              className="grid gap-2"
              style={{ gridTemplateColumns: `100px repeat(${timeSlots.length || 1}, minmax(120px, 1fr))` }}
            >
              {/* Header: Times */}
              <div className="h-10 invisible" />
              {timeSlots.map(time => (
                <div key={time} className="h-10 flex items-center justify-center font-black text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50 rounded-xl border border-slate-100">
                  {formatTime(time)}
                </div>
              ))}

              {/* Rows: Days */}
              {days.map(day => (
                <React.Fragment key={day}>
                  <div className="h-24 flex items-center pr-4 font-black text-xs text-slate-900 border-r border-slate-100">
                    {day}
                  </div>
                  {timeSlots.map(time => {
                    const slot = timetable.find(s => s.day_of_week === day && s.start_time === time);
                    return (
                      <div key={time} className="h-24 p-1 relative group">
                        {slot ? (
                          <div className="h-full w-full bg-indigo-50 rounded-2xl border border-indigo-100 p-3 flex flex-col justify-center animate-in zoom-in-95 duration-300 shadow-sm group-hover:shadow-md transition-all">
                            <p className="text-[10px] font-black text-slate-900 leading-tight mb-1">
                              {slot.assignment?.subject?.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-auto">
                              <div className="h-5 w-5 bg-white rounded-lg flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                                <User className="h-3 w-3" />
                              </div>
                              <p className="text-[9px] font-bold text-slate-500 uppercase truncate">
                                {slot.assignment?.teacher?.full_name || 'TBD'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full bg-slate-50/30 rounded-2xl border border-dashed border-slate-100" />
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

      {/* Mobile Hint */}
      <div className="md:hidden p-4 bg-amber-50 rounded-2xl border border-amber-100 text-center">
         <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Scroll horizontally to view full schedule</p>
      </div>
    </div>
  );
};
