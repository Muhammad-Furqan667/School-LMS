import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';

import { useTeachersData } from '../hooks/useTeachersData';
import { useTeacherActions } from '../hooks/useTeacherActions';
import { useTeacherAssignments } from '../hooks/useTeacherAssignments';
import { useTeacherTasks } from '../../tasks/hooks/useTeacherTasks';

import { TeacherFilters } from './TeacherFilters';
import { TeacherGrid } from './TeacherGrid';
import { HireTeacherModal } from './modals/HireTeacherModal';
import { AssignSubjectModal } from './modals/AssignSubjectModal';
import { TeacherDetailModal } from './modals/TeacherDetailModal';

import type { Teacher, HireFormState, EditFormState, AssignFormState } from '../types/teacher.types';

export const TeacherConsoleFeature: React.FC = () => {
  // Hooks
  const { teachers, classes, subjects, loading: dataLoading, fetchAll } = useTeachersData();
  const { loading: actionsLoading, handleHire, handleSaveEdit, handleDeleteTeacher, handleAssignModerator } = useTeacherActions(fetchAll);
  const { 
    teacherAssignments, 
    fetchAssignments, 
    handleAddAssignment, 
    handleRemoveAssignment 
  } = useTeacherAssignments(fetchAll);
  
  const { tasks, fetchTasks } = useTeacherTasks();

  // Local State
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subjectId: '',
    grade: '',
    isHeadTeacher: false
  });
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Forms
  const [hireForm, setHireForm] = useState<HireFormState>({
    full_name: '',
    username: '',
    password: '',
    salary: 0,
    subject_id: '',
    class_id: ''
  });

  const [editForm, setEditForm] = useState<EditFormState>({
    full_name: '',
    salary: 0,
    username: '',
    password: '',
    joined_at: ''
  });

  const [assignForm, setAssignForm] = useState<AssignFormState>({
    subject_id: '',
    class_id: ''
  });

  // Handlers
  const openTeacherDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setEditForm({
      full_name: teacher.full_name,
      salary: teacher.salary || 0,
      username: '',
      password: '',
      joined_at: teacher.joined_at ? teacher.joined_at.split('T')[0] : (teacher.created_at ? teacher.created_at.split('T')[0] : '')
    });
    setIsEditing(false);
    fetchAssignments(teacher.id);
    fetchTasks(undefined, teacher.id);
  };

  const closeDetail = () => {
    setSelectedTeacher(null);
    setIsEditing(false);
  };

  const onHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleHire(hireForm, () => {
      setIsHireModalOpen(false);
      setHireForm({ full_name: '', username: '', password: '', salary: 0 });
    });
  };

  const onSaveEditSubmit = async () => {
    if (!selectedTeacher) return;
    await handleSaveEdit(selectedTeacher, editForm, (updated) => {
      setSelectedTeacher(updated);
      setIsEditing(false);
    });
  };

  const onDeleteSubmit = async (id: string) => {
    await handleDeleteTeacher(id, selectedTeacher?.id === id, closeDetail);
  };

  const onAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    await handleAddAssignment(selectedTeacher.id, assignForm, (refreshed) => {
      setSelectedTeacher(refreshed);
      setIsAssignModalOpen(false);
      setAssignForm({ subject_id: '', class_id: '' });
    });
  };

  const onRemoveAssignmentSubmit = async (assignmentId: string) => {
    if (!selectedTeacher) return;
    await handleRemoveAssignment(assignmentId, selectedTeacher.id, (refreshed) => {
      setSelectedTeacher(refreshed);
    });
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = !filters.subjectId || 
      t.teacher_assignments?.some((a: any) => 
        String(a.subject_id) === String(filters.subjectId) || 
        String(a.subject?.id) === String(filters.subjectId)
      );
    
    const matchesGrade = !filters.grade || 
      t.teacher_assignments?.some((a: any) => 
        String(a.class?.grade) === String(filters.grade) || 
        String(a.class_id) === String(filters.grade) // Fallback check
      );
    
    const matchesHead = !filters.isHeadTeacher || 
      classes.some(c => String(c.class_teacher_id) === String(t.id));

    return matchesSearch && matchesSubject && matchesGrade && matchesHead;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Faculty Hub</h1>
          <p className="text-slate-500 font-medium mt-2 md:text-lg">
            {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} actively managing curriculum.
          </p>
        </div>
        <button
          onClick={() => setIsHireModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all w-full lg:w-auto"
        >
          <UserPlus className="h-4 w-4" />
          Onboard New Faculty
        </button>
      </div>

      <TeacherFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        subjects={subjects}
        classes={classes}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-6">
        <TeacherGrid
          filteredTeachers={filteredTeachers}
          selectedTeacher={selectedTeacher}
          loading={dataLoading}
          openTeacherDetail={openTeacherDetail}
        />

        {selectedTeacher && (
          <TeacherDetailModal
            selectedTeacher={selectedTeacher}
            teacherAssignments={teacherAssignments}
            tasks={tasks}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            closeDetail={closeDetail}
            handleSaveEdit={onSaveEditSubmit}
            handleDeleteTeacher={onDeleteSubmit}
            handleRemoveAssignment={onRemoveAssignmentSubmit}
            handleAssignModerator={handleAssignModerator}
            setIsAssignModalOpen={setIsAssignModalOpen}
            classes={classes}
          />
        )}
      </div>

      {isHireModalOpen && (
        <HireTeacherModal
          hireForm={hireForm}
          setHireForm={setHireForm}
          subjects={subjects}
          classes={classes}
          loading={actionsLoading}
          onClose={() => setIsHireModalOpen(false)}
          onSubmit={onHireSubmit}
        />
      )}

      {isAssignModalOpen && selectedTeacher && (
        <AssignSubjectModal
          selectedTeacher={selectedTeacher}
          assignForm={assignForm}
          setAssignForm={setAssignForm}
          classes={classes}
          subjects={subjects}
          onClose={() => setIsAssignModalOpen(false)}
          onSubmit={onAssignSubmit}
        />
      )}
    </div>
  );
};
