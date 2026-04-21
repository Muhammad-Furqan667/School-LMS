import React from 'react';
import { X, Calendar } from 'lucide-react';
import type { TimetableSlot } from '../../types/class.types';

interface TimetableGridProps {
  selectedClass: any;
  daysOfWeek: string[];
  timeSlots: string[];
  timetable: TimetableSlot[];
  handleDeleteSlot: (id: string, classId: string) => Promise<void>;
  formatTime: (time: string) => string;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  selectedClass,
  daysOfWeek,
  timeSlots,
  timetable,
  handleDeleteSlot,
  formatTime,
}) => {
  return (
    <div className="flex-1 p-6 overflow-x-auto bg-white">
      <div className="min-w-[700px] h-full flex flex-col">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Grid - Class {selectedClass.grade}{selectedClass.section}</p>
          <div className="h-1 flex-1 mx-4 bg-slate-50 rounded-full" />
        </div>

        <div 
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `80px repeat(${timeSlots.length || 1}, minmax(100px, 1fr))` }}
        >
          {/* Header: Times */}
          <div className="h-8 invisible" />
          {timeSlots.length > 0 ? timeSlots.map(time => (
            <div key={time} className="h-8 flex items-center justify-center font-black text-[9px] text-slate-400 uppercase tracking-widest bg-slate-50 rounded-lg border border-slate-100">
              {formatTime(time)}
            </div>
          )) : (
            <div className="h-8 flex items-center justify-center text-slate-400 text-[9px] italic">No slots</div>
          )}

          {/* Rows: Days */}
          {daysOfWeek.map(day => (
            <React.Fragment key={day}>
              <div className="h-16 flex items-center pr-4 font-bold text-xs text-slate-900 border-r border-slate-100">
                {day}
              </div>
              {timeSlots.map(time => {
                const slot = timetable.find(s => s.day_of_week === day && s.start_time.startsWith(time.slice(0, 5)));
                return (
                  <div key={time} className="h-16 p-1 relative group">
                    {slot ? (
                      <div className="h-full w-full bg-emerald-50 rounded-lg border border-emerald-100 p-1.5 flex flex-col justify-center relative animate-in zoom-in-95 duration-300">
                        <button 
                          onClick={() => handleDeleteSlot(slot.id, selectedClass.id)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-[10px] font-bold text-slate-900 truncate tracking-tight">
                          {slot.assignment?.subject?.name}
                        </p>
                        <p className="text-[8px] text-slate-500 font-bold truncate mt-0.5">
                          {slot.assignment?.teacher?.full_name}
                        </p>
                        <p className="text-[7px] text-emerald-600 font-black mt-1">
                          {formatTime(slot.start_time)}
                        </p>
                      </div>
                    ) : (
                      <div className="h-full w-full bg-slate-50/30 rounded-lg border border-dashed border-slate-100 transition-colors hover:bg-slate-50/50" />
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {timetable.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 mt-10">
             <Calendar className="h-12 w-12 mb-2 text-slate-300" />
             <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Ready for scheduling</p>
          </div>
        )}
      </div>
    </div>
  );
};
