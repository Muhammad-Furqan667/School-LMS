import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';
import type { Lecture, LectureFormState, Subject } from '../types/curriculum.types';

export const useLectures = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsData, lecturesData] = await Promise.all([
        (supabase as any).from('subjects').select('*'),
        (supabase as any).from('lectures').select('*, subjects(name)')
      ]);
      setSubjects(subjectsData.data || []);
      setLectures(lecturesData.data || []);
    } catch (error) {
      toast.error('Failed to sync syllabus data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLecture = async (form: LectureFormState, onSuccess: () => void) => {
    try {
      const { error } = await (supabase as any).from('lectures').insert(form);
      if (error) throw error;
      toast.success('Lecture published');
      onSuccess();
      fetchData();
    } catch {
      toast.error('Failed to save lecture');
    }
  };

  const handleDeleteLecture = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await (supabase as any).from('lectures').delete().eq('id', id);
      if (error) throw error;
      toast.success('Lecture removed');
      fetchData();
    } catch {
      toast.error('Deletion failed');
    }
  };

  return {
    subjects,
    lectures,
    loading,
    fetchData,
    handleCreateLecture,
    handleDeleteLecture
  };
};
