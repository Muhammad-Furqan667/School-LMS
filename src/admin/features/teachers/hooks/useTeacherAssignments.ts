import { useState, useCallback } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';
import type { Teacher, AssignFormState } from '../types/teacher.types';

export const useTeacherAssignments = (fetchAll: () => void) => {
  const [teacherAssignments, setTeacherAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async (teacherId: string) => {
    setLoading(true);
    try {
      const data = await SchoolService.getTeacherAssignments(teacherId);
      setTeacherAssignments(data || []);
    } catch (err) {
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddAssignment = async (
    teacherId: string, 
    assignForm: AssignFormState, 
    onSuccess: (refreshedTeacher: Teacher) => void
  ) => {
    if (!teacherId || !assignForm.subject_id || !assignForm.class_id) return;
    try {
      setLoading(true);
      await SchoolService.createTeacherAssignment(teacherId, assignForm.subject_id, assignForm.class_id);
      toast.success('Subject assigned');
      fetchAll();
      
      const updated = await SchoolService.getTeachers();
      const refreshed = updated.find((t: any) => t.id === teacherId);
      if (refreshed) onSuccess(refreshed);
    } catch {
      toast.error('Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (
    assignmentId: string, 
    teacherId: string, 
    onSuccess: (refreshedTeacher: Teacher) => void
  ) => {
    try {
      setLoading(true);
      await SchoolService.deleteTeacherAssignment(assignmentId);
      toast.success('Assignment removed');
      fetchAll();
      
      const updated = await SchoolService.getTeachers();
      const refreshed = updated.find((t: any) => t.id === teacherId);
      if (refreshed) onSuccess(refreshed);
    } catch {
      toast.error('Remove failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    teacherAssignments,
    setTeacherAssignments,
    loading,
    fetchAssignments,
    handleAddAssignment,
    handleRemoveAssignment
  };
};
