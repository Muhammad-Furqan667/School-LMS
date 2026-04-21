import { useState, useEffect } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';
import type { Subject } from '../types/curriculum.types';

export const useCourses = (selectedGrade: string | null) => {
  const [courses, setCourses] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    if (!selectedGrade) return;
    setLoading(true);
    try {
      const data = await SchoolService.getSubjectsByGrade(selectedGrade);
      setCourses(data || []);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedGrade]);

  const handleAddCourse = async (name: string, onSuccess: () => void) => {
    if (!selectedGrade || !name.trim()) return;
    try {
      await SchoolService.createSubject(name, selectedGrade);
      toast.success('Course created');
      onSuccess();
      fetchCourses();
    } catch {
      toast.error('Failed to create course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await SchoolService.deleteSubject(id);
      toast.success('Course removed');
      fetchCourses();
    } catch {
      toast.error('Deletion failed');
    }
  };

  return {
    courses,
    loading,
    fetchCourses,
    handleAddCourse,
    handleDeleteCourse
  };
};
