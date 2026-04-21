import { useState, useCallback } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';

export const useAttendanceData = () => {
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classAttendance, setClassAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendanceData = useCallback(async (classId: string, date: string) => {
    setLoading(true);
    try {
      const [students, assignments, attendance] = await Promise.all([
        SchoolService.getStudentsByClass(classId),
        SchoolService.getTeacherAssignmentsByClass(classId),
        SchoolService.getAttendanceByClassAndDate(classId, date)
      ]);
      
      setClassStudents(students || []);
      setAssignments(assignments || []);
      setClassAttendance(attendance || []);
    } catch (e) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateAttendance = async (studentId: string, assignmentId: string, date: string, status: string, classId: string) => {
    try {
      await SchoolService.bulkUpsertAttendance([{
        student_id: studentId,
        assignment_id: assignmentId,
        date: date,
        status: status
      }]);
      await fetchAttendanceData(classId, date);
    } catch {
      toast.error('Failed to update status');
    }
  };

  return {
    classStudents,
    assignments,
    classAttendance,
    loading,
    fetchAttendanceData,
    handleUpdateAttendance
  };
};
