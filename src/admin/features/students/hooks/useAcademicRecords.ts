import { useState, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';
import type { Student, AcademicResults } from '../types/student.types';

export const useAcademicRecords = () => {
  const [academicResults, setAcademicResults] = useState<AcademicResults>({ current: [], past: [] });

  const fetchAcademicResults = useCallback(async (selectedStudent: Student | null) => {
    if (!selectedStudent) return;
    try {
      const { data: resultsData, error } = await (supabase as any)
        .from('results')
        .select('*, subjects(*), academic_years(*)')
        .eq('student_id', selectedStudent.id);

      if (error) throw error;

      const requiredSubjects = await SchoolService.getSubjectsByGrade(selectedStudent.classes?.grade);

      const currentYearResults = requiredSubjects.map((sub: any) => {
        const existing = (resultsData || []).find((r: any) => r.subject_id === sub.id && r.academic_year_id === selectedStudent.classes?.academic_year_id);
        return existing || {
          subject_id: sub.id,
          student_id: selectedStudent.id,
          status: 'pending',
          subjects: sub,
          is_current: true
        };
      });

      const pastMap: Record<string, any> = {};
      (resultsData || []).forEach((r: any) => {
        if (r.academic_year_id !== selectedStudent.classes?.academic_year_id) {
          const yearLabel = r.academic_years?.year_label || 'Archives';
          if (!pastMap[yearLabel]) {
            pastMap[yearLabel] = {
              label: yearLabel,
              results: [],
              totalMarks: 0,
              obtainedMarks: 0
            };
          }
          pastMap[yearLabel].results.push(r);
          pastMap[yearLabel].totalMarks += (r.total_marks || 100);
          pastMap[yearLabel].obtainedMarks += (r.marks_obtained || 0);
        }
      });

      setAcademicResults({
        current: currentYearResults,
        past: Object.values(pastMap).sort((a: any, b: any) => b.label.localeCompare(a.label))
      });
    } catch (error) {
      toast.error('Failed to load academic records');
    }
  }, []);

  const handleUpdateResult = async (result: any, status: 'pass' | 'fail' | 'pending', selectedStudent: Student) => {
    try {
      const payload = {
        student_id: selectedStudent.id,
        subject_id: result.subject_id,
        status,
        academic_year_id: selectedStudent.classes?.academic_year_id
      };
      if (result.id) (payload as any).id = result.id;

      await SchoolService.upsertResult(payload);
      toast.success(`Marked as ${status.toUpperCase()}`);
      fetchAcademicResults(selectedStudent);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  return {
    academicResults,
    setAcademicResults,
    fetchAcademicResults,
    handleUpdateResult,
  };
};
