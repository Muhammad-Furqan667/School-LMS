import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useClassesData } from '../hooks/useClassesData';
import { useTimetableData } from '../hooks/useTimetableData';
import { useTeachersData } from '../../teachers/hooks/useTeachersData';
import { useAssignmentsData } from '../hooks/useAssignmentsData';

import { ClassGrid } from './ClassGrid';
import { AddClassModal } from './modals/AddClassModal';
import { TimetableModal } from './modals/TimetableModal';
import { AssignModeratorModal } from './modals/AssignModeratorModal';
import { AssignSubjectsModal } from './modals/AssignSubjectsModal';
import { SectionStudentList } from './SectionStudentList';
import { StudentClassDetailView } from './StudentClassDetailView';

import type { Class, ClassFormState, TimetableFormState } from '../types/class.types';

export const ClassConsoleFeature: React.FC = () => {
  // Hooks
  const { classes, sessions, loading: classesLoading, handleAddClass, handleDeleteClass, handleUpdateClass, handleAddSession } = useClassesData();
  const { teachers, fetchAll: fetchAllTeachers } = useTeachersData();
  const { 
    subjects,
    classAssignments,
    fetchAssignmentsMetadata,
    handleAssignSubject,
    handleRemoveAssignment
  } = useAssignmentsData();
  const { 
    timetable, 
    assignments: timetableAssignments, 
    loading: _timetableLoading, 
    fetchTimetableData, 
    handleAddTimetableSlot, 
    handleDeleteSlot 
  } = useTimetableData();

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isStudentListOpen, setIsStudentListOpen] = useState(false);
  const [isStudentDetailOpen, setIsStudentDetailOpen] = useState(false);
  const [isModeratorModalOpen, setIsModeratorModalOpen] = useState(false);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Forms state
  const [classForm, setClassForm] = useState<ClassFormState>({ grade: '', section: '', class_teacher_id: '', academic_year_id: '' });
  const [timetableForm, setTimetableForm] = useState<TimetableFormState>({
    assignment_id: '',
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '09:00'
  });


  // Handlers
  const openStudentList = async (c: Class) => {
    setSelectedClass(c);
    setIsStudentListOpen(true);
  };

  const openModeratorAssignment = (c: Class) => {
    setSelectedClass(c);
    setIsModeratorModalOpen(true);
  };

  const openSubjects = async (c: Class) => {
    setSelectedClass(c);
    setIsSubjectsModalOpen(true);
    fetchAssignmentsMetadata(c.id);
  };

  const openTimetable = async (c: Class) => {
    setSelectedClass(c);
    setIsTimetableModalOpen(true);
    fetchTimetableData(c.id);
  };

  const onClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddClass(classForm.grade, classForm.section, classForm.class_teacher_id, classForm.academic_year_id, () => {
      setIsClassModalOpen(false);
      setClassForm({ grade: '', section: '', class_teacher_id: '', academic_year_id: '' });
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
        <div className="flex gap-3 w-full lg:w-auto">
          <button 
            onClick={() => {
              const label = prompt('Enter New Session Label (e.g., 2027-28):');
              if (label) handleAddSession(label);
            }}
            className="flex items-center justify-center gap-2 px-6 py-5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm flex-1 lg:flex-none"
          >
            <Plus className="h-4 w-4" />
            New Session
          </button>
          <button 
            onClick={() => setIsClassModalOpen(true)}
            className="flex items-center justify-center gap-2 px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all flex-1 lg:flex-none"
          >
            <Plus className="h-4 w-4" />
            Create New Class
          </button>
        </div>
      </div>

      {/* Grouped Class Grid */}
      <div className="space-y-12">
        {Object.entries(
          classes.reduce((acc: any, c) => {
            const session = c.academic_years?.year_label || 'Legacy / Unassigned';
            if (!acc[session]) acc[session] = [];
            acc[session].push(c);
            return acc;
          }, {})
        ).sort((a: any, b: any) => b[0].localeCompare(a[0])).map(([session, sessionClasses]: [string, any]) => (
          <div key={session} className={`space-y-6 ${!sessionClasses[0]?.academic_years?.is_current ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div className="flex items-center gap-6">
              <div className={`h-px flex-1 ${sessionClasses[0]?.academic_years?.is_current ? 'bg-emerald-200' : 'bg-slate-200'}`} />
              <div className="flex flex-col items-center gap-2">
                <p className={`text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap px-4 py-2 rounded-full border ${
                  sessionClasses[0]?.academic_years?.is_current 
                    ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                    : 'text-slate-400 bg-slate-50 border-slate-100'
                }`}>
                  {sessionClasses[0]?.academic_years?.is_current ? '🟢 ACTIVE CURRENT SESSION' : '⚪ PREVIOUS ARCHIVED SESSION'}
                </p>
                <p className="text-xl font-black text-slate-900">{session}</p>
              </div>
              <div className={`h-px flex-1 ${sessionClasses[0]?.academic_years?.is_current ? 'bg-emerald-200' : 'bg-slate-200'}`} />
            </div>
            
            <ClassGrid
              classes={sessionClasses}
              loading={classesLoading}
              handleDeleteClass={handleDeleteClass}
              openTimetable={openTimetable}
              openStudentList={openStudentList}
              onAssignModerator={openModeratorAssignment}
              onManageSubjects={openSubjects}
            />
          </div>
        ))}
        
        {classes.length === 0 && !classesLoading && (
           <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-black italic">No academic batches detected. Create your first class to begin.</p>
           </div>
        )}
      </div>

      {isStudentListOpen && selectedClass && (
        <SectionStudentList
          selectedClass={selectedClass}
          onClose={() => setIsStudentListOpen(false)}
          onSelectStudent={(student) => {
            setSelectedStudent(student);
            setIsStudentDetailOpen(true);
          }}
        />
      )}

      {isStudentDetailOpen && selectedStudent && selectedClass && (
        <StudentClassDetailView
          student={selectedStudent}
          classData={selectedClass}
          onBack={() => setIsStudentDetailOpen(false)}
          onClose={() => {
            setIsStudentDetailOpen(false);
            setIsStudentListOpen(false);
          }}
        />
      )}

      {isClassModalOpen && (
        <AddClassModal
          classForm={classForm}
          setClassForm={setClassForm}
          teachers={teachers.filter(t => 
            !classes.some(c => 
              c.academic_year_id === classForm.academic_year_id && 
              c.class_teacher_id === t.id
            )
          )}
          sessions={sessions}
          onClose={() => setIsClassModalOpen(false)}
          onSubmit={onClassSubmit}
        />
      )}

      {isModeratorModalOpen && selectedClass && (
        <AssignModeratorModal
          selectedClass={selectedClass}
          teachers={teachers.filter(t => {
            // Must have a subject assignment in this specific class
            const hasAssignmentInClass = t.teacher_assignments?.some(a => a.class_id === selectedClass.id);
            if (!hasAssignmentInClass) return false;

            // Must be the current moderator OR if they aren't moderating any class in this session
            return t.id === selectedClass.class_teacher_id ||
                   !classes.some(c => 
                     c.academic_year_id === selectedClass.academic_year_id && 
                     c.class_teacher_id === t.id
                   );
          })}
          onClose={() => setIsModeratorModalOpen(false)}
          onSubmit={async (teacherId) => {
            await handleUpdateClass(selectedClass.id, { class_teacher_id: teacherId });
            await fetchAllTeachers();
          }}
        />
      )}
      {isSubjectsModalOpen && selectedClass && (
        <AssignSubjectsModal
          selectedClass={selectedClass}
          subjects={subjects}
          teachers={teachers}
          assignments={classAssignments}
          onAssign={async (sid, tid) => {
            await handleAssignSubject(selectedClass.id, sid, tid);
          }}
          onRemove={async (aid) => {
            await handleRemoveAssignment(aid, selectedClass.id);
          }}
          onClose={() => setIsSubjectsModalOpen(false)}
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
