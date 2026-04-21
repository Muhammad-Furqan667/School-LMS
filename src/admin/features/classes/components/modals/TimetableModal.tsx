import React from 'react';
import { TimetableSidebar } from './TimetableSidebar';
import { TimetableGrid } from './TimetableGrid';
import type { TimetableSlot, TimetableFormState, Class } from '../../types/class.types';

interface TimetableModalProps {
  selectedClass: Class;
  assignments: any[];
  timetable: TimetableSlot[];
  timetableForm: TimetableFormState;
  setTimetableForm: React.Dispatch<React.SetStateAction<TimetableFormState>>;
  handleAddTimetableSlot: (classId: string, form: TimetableFormState) => Promise<void>;
  handleDeleteSlot: (id: string, classId: string) => Promise<void>;
  onClose: () => void;
}

export const TimetableModal: React.FC<TimetableModalProps> = ({
  selectedClass,
  assignments,
  timetable,
  timetableForm,
  setTimetableForm,
  handleAddTimetableSlot,
  handleDeleteSlot,
  onClose,
}) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const timeSlots = (() => {
    const base = [8, 9, 10, 11, 12, 13, 14, 15]; // 08:00 - 15:00
    const dataHours = timetable.map(t => parseInt(t.start_time.split(':')[0]));
    const maxHour = Math.min(Math.max(...base, ...dataHours), 17);
    const slots = [];
    for (let h = 8; h <= maxHour; h++) {
       slots.push(`${h.toString().padStart(2, '0')}:00:00`);
    }
    return slots;
  })();

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-6xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 h-[90vh] md:max-h-[85vh]">
        <TimetableSidebar
          selectedClass={selectedClass}
          timetableForm={timetableForm}
          setTimetableForm={setTimetableForm}
          assignments={assignments}
          daysOfWeek={daysOfWeek}
          onSubmit={async (e) => {
            e.preventDefault();
            await handleAddTimetableSlot(selectedClass.id, timetableForm);
          }}
          onClose={onClose}
        />
        <TimetableGrid
          selectedClass={selectedClass}
          daysOfWeek={daysOfWeek}
          timeSlots={timeSlots}
          timetable={timetable}
          handleDeleteSlot={handleDeleteSlot}
          formatTime={formatTime}
        />
      </div>
    </div>
  );
};
