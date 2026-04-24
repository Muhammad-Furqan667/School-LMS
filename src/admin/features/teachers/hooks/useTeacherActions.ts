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

      // Add initial assignment if provided
      if (hireForm.class_id && hireForm.subject_id) {
        await SchoolService.createTeacherAssignment(res.id, hireForm.subject_id, hireForm.class_id);
      }

      toast.success('Teacher hired and assigned successfully');
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
      
      // 1. Update Teacher Basic Info
      await SchoolService.updateTeacher(selectedTeacher.id, {
        full_name: editForm.full_name,
        salary: editForm.salary,
        joined_at: editForm.joined_at ? new Date(editForm.joined_at).toISOString() : null
      });

      // 2. Update Profile Credentials if needed
      if (selectedTeacher.profile_id) {
        if (editForm.password) {
          await SchoolService.resetUserPasswordById(selectedTeacher.profile_id, editForm.password);
        }
        const profileData = Array.isArray(selectedTeacher.profiles) ? selectedTeacher.profiles[0] : selectedTeacher.profiles;
        if (editForm.username && editForm.username !== (profileData?.registration_no || '')) {
          await SchoolService.updateProfileRegistration(selectedTeacher.profile_id, editForm.username);
        }
      } else if (editForm.username && editForm.password) {
        // Create new profile if missing
        await SchoolService.upsertTeacherAccess(selectedTeacher.id, editForm.username, editForm.password);
      }

      toast.success('Teacher updated successfully');
      
      // Fetch fresh data from DB to ensure sync
      const refreshed = await SchoolService.getTeacherById(selectedTeacher.id);
      onSuccess(refreshed);
      fetchAll();
    } catch (err: any) {
      console.error('Update failed:', err);
      toast.error(err.message?.includes('unique') ? 'Registration ID already taken' : 'Update failed');
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

  const handleToggleRole = async (teacher: Teacher, onSuccess: (updated: Teacher) => void) => {
    if (!teacher.profile_id || !teacher.profiles) {
      toast.error('Teacher must have a digital ID first');
      return;
    }

    const newRole = teacher.profiles.role === 'admin' ? 'teacher' : 'admin';
    try {
      setLoading(true);
      await SchoolService.updateProfileRole(teacher.profile_id, newRole);
      const updated = await SchoolService.getTeacherById(teacher.id);
      toast.success(newRole === 'admin' ? 'Promoted to Head of Faculty' : 'Role reverted to Faculty');
      onSuccess(updated);
      fetchAll();
    } catch {
      toast.error('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignModerator = async (teacherId: string, classId: string, onSuccess?: (updatedTeacher: Teacher) => void) => {
    try {
      setLoading(true);
      console.log('Assigning moderator:', { teacherId, classId });
      
      // 1. Clear this teacher from ANY other classes they might be moderating
      // This ensures a clean state and avoids multiple assignments
      const all_classes = await SchoolService.getClasses();
      const currentAssignments = all_classes.filter(c => c.class_teacher_id === teacherId);
      
      for (const c of currentAssignments) {
        if (c.id !== classId) {
          console.log('Clearing old moderator role from class:', c.id);
          await SchoolService.upsertClass({ id: c.id, class_teacher_id: null });
        }
      }

      // 2. Assign to the new class if provided
      if (classId) {
        // STRICT VALIDATION: Ensure teacher has a subject in this class
        const teacher = await SchoolService.getTeacherById(teacherId);
        const hasAssignment = teacher.teacher_assignments?.some((a: any) => a.class_id === classId);
        
        if (!hasAssignment) {
          throw new Error('Teacher must have at least one subject assigned in this class before becoming a moderator.');
        }

        console.log('Setting new moderator role for class:', classId);
        await SchoolService.upsertClass({ id: classId, class_teacher_id: teacherId });
        toast.success('Section Moderator updated successfully');
      } else {
        toast.success('Moderator privileges removed');
      }
      
      // 3. Refresh data
      if (onSuccess) {
        const refreshed = await SchoolService.getTeacherById(teacherId);
        onSuccess(refreshed);
      }
      fetchAll();
    } catch (err: any) {
      console.error('Moderator assignment error:', err);
      toast.error(`Assignment failed: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleHire,
    handleSaveEdit,
    handleDeleteTeacher,
    handleToggleRole,
    handleAssignModerator
  };
};
