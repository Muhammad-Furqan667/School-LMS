import { useState, useEffect, useCallback } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useFeeHistory = (studentId?: string) => {
  const [student, setStudent] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStudentData = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const target = await SchoolService.getStudentById(id);
      
      if (!target) {
        toast.error('Student not found');
        navigate('/admin/students');
        return;
      }
      
      setStudent(target);
      
      const feeData = await SchoolService.getStudentFees(id);
      setFees(feeData || []);
    } catch (error) {
      console.error('Failed to load fee card data:', error);
      // Removed toast to prevent duplicate alerts reported by user
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (studentId) fetchStudentData(studentId);
  }, [studentId, fetchStudentData]);

  const stats = {
    totalDue: fees.reduce((sum, f) => sum + Number(f.amount_due), 0),
    totalPaid: fees.reduce((sum, f) => sum + Number(f.amount_paid), 0),
    get pending() { return this.totalDue - this.totalPaid; }
  };

  return {
    student,
    fees,
    loading,
    stats,
    fetchStudentData
  };
};
