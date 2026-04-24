import { useState, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';

export const useAssignmentsData = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classAssignments, setClassAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignmentsMetadata = useCallback(async (classId?: string) => {
    setLoading(true);
    try {
      // 1. Fetch all available subjects
      const { data: subData } = await supabase.from('subjects').select('*').order('name');
      setSubjects(subData || []);

      // 2. Fetch assignments for this specific class
      if (classId) {
        const { data: assignData } = await supabase
          .from('teacher_assignments')
          .select('*, subject:subjects(*), teacher:teachers(*)')
          .eq('class_id', classId);
        setClassAssignments(assignData || []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load subjects/assignments');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAssignSubject = async (classId: string, subjectId: string, teacherId: string) => {
    try {
      const { error } = await supabase
        .from('teacher_assignments')
        .insert({
          class_id: classId,
          subject_id: subjectId,
          teacher_id: teacherId
        });

      if (error) throw error;
      toast.success('Subject assigned successfully');
      fetchAssignmentsMetadata(classId);
    } catch (e) {
      toast.error('Assignment failed. Is this teacher already assigned to this subject?');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string, classId: string) => {
    try {
      const { error } = await supabase
        .from('teacher_assignments')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;
      toast.success('Assignment removed');
      fetchAssignmentsMetadata(classId);
    } catch (e) {
      toast.error('Failed to remove assignment');
    }
  };

  return {
    subjects,
    classAssignments,
    loading,
    fetchAssignmentsMetadata,
    handleAssignSubject,
    handleRemoveAssignment
  };
};
