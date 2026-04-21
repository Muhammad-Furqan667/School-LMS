import { useState } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';
import type { Teacher, HireFormState, EditFormState } from '../types/teacher.types';

export const useTeacherActions = (fetchAll: () => void) => {
  const [loading, setLoading] = useState(false);

  const handleHire = async (hireForm: HireFormState, onSuccess: () => void) => {
    if (!hireForm.full_name.trim() || !hireForm.username.trim() || !hireForm.password.trim()) return;
    try {
      setLoading(true);
      const res = await SchoolService.upsertTeacher({
        full_name: hireForm.full_name,
        salary: hireForm.salary
      });
      await SchoolService.upsertTeacherAccess(res.id, hireForm.username, hireForm.password);

      toast.success('Teacher hired successfully');
      onSuccess();
      fetchAll();
    } catch {
      toast.error('Hiring failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (
    selectedTeacher: Teacher, 
    editForm: EditFormState, 
    onSuccess: (updatedTeacher: Teacher) => void
  ) => {
    try {
      setLoading(true);
      await SchoolService.updateTeacher(selectedTeacher.id, {
        full_name: editForm.full_name,
        salary: editForm.salary,
        joined_at: editForm.joined_at ? new Date(editForm.joined_at).toISOString() : null
      });

      if (editForm.password) {
        if (selectedTeacher.profile_id) {
          await SchoolService.resetUserPasswordById(selectedTeacher.profile_id, editForm.password);
        } else if (editForm.username) {
          await SchoolService.upsertTeacherAccess(selectedTeacher.id, editForm.username, editForm.password);
        }
      }

      toast.success('Teacher updated');
      const updatedTeacher = {
        ...selectedTeacher,
        full_name: editForm.full_name,
        salary: editForm.salary,
        joined_at: editForm.joined_at
      };
      onSuccess(updatedTeacher);
      fetchAll();
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: string, isSelected: boolean, closeDetail: () => void) => {
    if (!confirm('Are you sure you want to remove this teacher and all their assignments?')) return;
    try {
      setLoading(true);
      await SchoolService.deleteTeacher(id);
      toast.success('Teacher removed');
      if (isSelected) closeDetail();
      fetchAll();
    } catch {
      toast.error('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleHire,
    handleSaveEdit,
    handleDeleteTeacher
  };
};
