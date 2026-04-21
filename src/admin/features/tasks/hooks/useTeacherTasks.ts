import { useState, useCallback } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';
import type { TeacherTask, TaskFormState } from '../types/task.types';

export const useTeacherTasks = () => {
  const [tasks, setTasks] = useState<TeacherTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async (assignmentId?: string, teacherId?: string) => {
    setLoading(true);
    try {
      const data = await SchoolService.getTeacherTasks(assignmentId, teacherId);
      setTasks(data || []);
    } catch (e) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateTask = async (task: TaskFormState, onSuccess: () => void) => {
    try {
      await SchoolService.createTeacherTask(task);
      toast.success('Task assigned to teacher');
      onSuccess();
      // Optionally refresh global tasks if needed
    } catch {
      toast.error('Failed to assign task');
    }
  };

  const handleUpdateStatus = async (taskId: string, status: 'pending' | 'completed') => {
    try {
      await SchoolService.updateTaskStatus(taskId, status);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
      toast.success(`Task marked as ${status}`);
    } catch {
      toast.error('Status update failed');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Cancel this task?')) return;
    try {
      await SchoolService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task removed');
    } catch {
      toast.error('Removal failed');
    }
  };

  return {
    tasks,
    loading,
    fetchTasks,
    handleCreateTask,
    handleUpdateStatus,
    handleDeleteTask
  };
};
