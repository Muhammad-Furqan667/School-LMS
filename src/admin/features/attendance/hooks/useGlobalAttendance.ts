import { useState, useEffect, useCallback } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';

export const useGlobalAttendance = (initialDate: string) => {
  const [date, setDate] = useState<string>(initialDate);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SchoolService.getAllTeacherAttendance(date);
      setAttendance(data || []);
    } catch {
      toast.error('Failed to load teacher attendance');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAttendance = attendance.filter(record => 
    record.teacher?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(a => a.status === 'present').length,
    absent: filteredAttendance.filter(a => a.status === 'absent').length,
    late: filteredAttendance.filter(a => a.status === 'late').length,
  };

  return {
    date,
    setDate,
    attendance,
    filteredAttendance,
    loading,
    searchTerm,
    setSearchTerm,
    stats,
    fetchData
  };
};
