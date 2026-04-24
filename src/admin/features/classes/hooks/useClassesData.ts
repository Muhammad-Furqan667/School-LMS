import { useState, useEffect } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';
import type { Class } from '../types/class.types';

export const useClassesData = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await SchoolService.getClasses();
      setClasses(data || []);
      
      const years = await SchoolService.getAcademicYears();
      setSessions(years || []);
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async (grade: string, section: string, classTeacherId: string, sessionId: string, onSuccess: () => void) => {
    try {
      await SchoolService.upsertClass({
        grade,
        section,
        class_teacher_id: classTeacherId,
        academic_year_id: sessionId
      });
      toast.success('Class created');
      onSuccess();
      fetchClasses();
    } catch {
      toast.error('Failed to create class');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class? All students must be removed first.')) return;
    try {
      await SchoolService.deleteClass(id);
      toast.success('Class deleted');
      fetchClasses();
    } catch {
      toast.error('Cannot delete class, is it empty?');
    }
  };

  const handleUpdateClass = async (id: string, updates: Partial<Class>) => {
    try {
      await SchoolService.upsertClass({ id, ...updates });
      toast.success('Class updated');
      fetchClasses();
    } catch {
      toast.error('Failed to update class');
    }
  };

  const handleAddSession = async (label: string) => {
    try {
      await SchoolService.upsertAcademicYear({ year_label: label, is_current: false });
      toast.success(`Academic Session ${label} initialized`);
      fetchClasses();
    } catch {
      toast.error('Failed to create session');
    }
  };

  return {
    classes,
    sessions,
    loading,
    fetchClasses,
    handleAddClass,
    handleDeleteClass,
    handleUpdateClass,
    handleAddSession
  };
};
