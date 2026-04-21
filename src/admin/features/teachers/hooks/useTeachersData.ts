import { useState, useEffect, useCallback } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';
import type { Teacher } from '../types/teacher.types';

export const useTeachersData = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [teacherData, classData, subjectData] = await Promise.all([
        SchoolService.getTeachers(),
        SchoolService.getClasses(),
        SchoolService.getSubjects()
      ]);
      setTeachers(teacherData || []);
      setClasses(classData || []);
      setSubjects(subjectData || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    teachers,
    classes,
    subjects,
    loading,
    fetchAll,
    setTeachers
  };
};
