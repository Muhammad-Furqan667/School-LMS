import { useState, useEffect } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';
import type { Class } from '../types/class.types';

export const useClassesData = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await SchoolService.getClasses();
      setClasses(data || []);
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async (grade: string, section: string, onSuccess: () => void) => {
    try {
      const { data: years } = await supabase.from('academic_years').select('id').eq('is_current', true).single();
      await SchoolService.upsertClass({
        grade,
        section,
        academic_year_id: years?.id
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

  return {
    classes,
    loading,
    fetchClasses,
    handleAddClass,
    handleDeleteClass
  };
};
