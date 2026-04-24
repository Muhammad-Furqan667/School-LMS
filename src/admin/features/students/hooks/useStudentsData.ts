import { useState, useEffect } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';
import type { Student } from '../types/student.types';
import type { Class } from '../../classes/types/class.types';

export const useStudentsData = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [studentData, classData] = await Promise.all([
        SchoolService.getStudents(),
        SchoolService.getClasses()
      ]);
      setStudents(studentData || []);
      setClasses(classData || []);
      
      const years = await SchoolService.getAcademicYears();
      setSessions(years || []);
    } catch (error) {
      console.error('Failed to load students data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDeleteStudent = async (id: string, callback?: () => void) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    try {
      await SchoolService.deleteStudent(id);
      toast.success('Student removed');
      if (callback) callback();
      fetchAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  return {
    students,
    classes,
    sessions,
    loading,
    fetchAll,
    handleDeleteStudent,
  };
};
