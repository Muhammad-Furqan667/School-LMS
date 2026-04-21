import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useClassesData } from '../hooks/useClassesData';
import { useTimetableData } from '../hooks/useTimetableData';
import { useAttendanceData } from '../hooks/useAttendanceData';

import { ClassGrid } from './ClassGrid';
import { AddClassModal } from './modals/AddClassModal';
import { AttendanceModal } from './modals/AttendanceModal';
import { TimetableModal } from './modals/TimetableModal';

import type { Class, ClassFormState, TimetableFormState } from '../types/class.types';

export const ClassConsoleFeature: React.FC = () => {
  // Hooks
  const { classes, loading: classesLoading, handleAddClass, handleDeleteClass } = useClassesData();
  const { 
    timetable, 
    assignments: timetableAssignments, 
    loading: _timetableLoading, 
    fetchTimetableData, 
    handleAddTimetableSlot, 
    handleDeleteSlot 
  } = useTimetableData();
  const { 
    classStudents, 
    assignments: attendanceAssignments, 
    classAttendance, 
    loading: _attendanceLoading, 
    fetchAttendanceData, 
    handleUpdateAttendance 
  } = useAttendanceData();

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Forms state
  const [classForm, setClassForm] = useState<ClassFormState>({ grade: '', section: '' });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [timetableForm, setTimetableForm] = useState<TimetableFormState>({
    assignment_id: '',
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '09:00'
  });

  // Attendance side effects
  useEffect(() => {
    if (isAttendanceModalOpen && selectedClass) {
      fetchAttendanceData(selectedClass.id, attendanceDate);
    }
  }, [attendanceDate, isAttendanceModalOpen, selectedClass, fetchAttendanceData]);

  // Handlers
  const openAttendance = async (c: Class) => {
    setSelectedClass(c);
    setIsAttendanceModalOpen(true);
  };

  const openTimetable = async (c: Class) => {
    setSelectedClass(c);
    setIsTimetableModalOpen(true);
    fetchTimetableData(c.id);
  };

  const onClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddClass(classForm.grade, classForm.section, () => {
      setIsClassModalOpen(false);
      setClassForm({ grade: '', section: '' });
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Class Repository</h1>
          <p className="text-slate-500 font-medium mt-2 md:text-lg">
            Manage academic batches, grades, and classroom timetables.
          </p>
        </div>
        <button 
          onClick={() => setIsClassModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all w-full lg:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create New Class
        </button>
      </div>

      <ClassGrid
        classes={classes}
        loading={classesLoading}
        handleDeleteClass={handleDeleteClass}
        openTimetable={openTimetable}
        openAttendance={openAttendance}
      />

      {isAttendanceModalOpen && selectedClass && (
        <AttendanceModal
          selectedClass={selectedClass}
          attendanceDate={attendanceDate}
          setAttendanceDate={setAttendanceDate}
          assignments={attendanceAssignments}
          classStudents={classStudents}
          classAttendance={classAttendance}
          onUpdateAttendance={async (studentId, assignmentId, status) => {
            await handleUpdateAttendance(studentId, assignmentId, attendanceDate, status, selectedClass.id);
          }}
          onClose={() => setIsAttendanceModalOpen(false)}
        />
      )}

      {isClassModalOpen && (
        <AddClassModal
          classForm={classForm}
          setClassForm={setClassForm}
          onClose={() => setIsClassModalOpen(false)}
          onSubmit={onClassSubmit}
        />
      )}

      {isTimetableModalOpen && selectedClass && (
        <TimetableModal
          selectedClass={selectedClass}
          assignments={timetableAssignments}
          timetable={timetable}
          timetableForm={timetableForm}
          setTimetableForm={setTimetableForm}
          handleAddTimetableSlot={handleAddTimetableSlot}
          handleDeleteSlot={handleDeleteSlot}
          onClose={() => setIsTimetableModalOpen(false)}
        />
      )}
    </div>
  );
};
