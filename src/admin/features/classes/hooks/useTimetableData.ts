import { useState, useCallback } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';
import type { TimetableSlot, TimetableFormState } from '../types/class.types';

export const useTimetableData = () => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTimetableData = useCallback(async (classId: string) => {
    setLoading(true);
    try {
      const tData = await SchoolService.getTimetable(classId);
      setTimetable(tData ? tData.filter((i: any) => i.assignment !== null) : []);

      const { data: aData, error } = await supabase
        .from('teacher_assignments')
        .select('*, subject:subjects(*), teacher:teachers(*)')
        .eq('class_id', classId);
        
      if (error) throw error;
      setAssignments(aData || []);
    } catch (e) {
      toast.error('Error fetching timetable');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddTimetableSlot = async (classId: string, form: TimetableFormState) => {
    if (!form.assignment_id) return;
    try {
      await SchoolService.upsertTimetable({
        assignment_id: form.assignment_id,
        day_of_week: form.day_of_week,
        start_time: form.start_time,
        end_time: form.end_time
      });
      toast.success('Slot scheduled');
      fetchTimetableData(classId);
    } catch (e: any) {
      toast.error(e.message || 'Failed to schedule slot');
    }
  };

  const handleDeleteSlot = async (id: string, classId: string) => {
    try {
       await SchoolService.deleteTimetable(id);
       toast.success('Slot removed');
       fetchTimetableData(classId);
    } catch {
       toast.error('Deletion failed');
    }
  };

  return {
    timetable,
    assignments,
    loading,
    fetchTimetableData,
    handleAddTimetableSlot,
    handleDeleteSlot
  };
};
