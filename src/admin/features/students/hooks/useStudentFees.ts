import { useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';
import type { Student, FeeFormState } from '../types/student.types';

export const useStudentFees = () => {
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);

  const fetchStudentFees = async (studentId: string) => {
    setLoadingFees(true);
    try {
      const fees = await SchoolService.getStudentFees(studentId);
      setStudentFees(fees || []);
    } catch {
      setStudentFees([]);
    } finally {
      setLoadingFees(false);
    }
  };

  const handleIssueFee = async (
    feeForm: FeeFormState, 
    selectedStudent: Student, 
    totalFeeAmount: number,
    onSuccess: () => void
  ) => {
    try {
      const { data: years } = await supabase.from('academic_years').select('id').eq('is_current', true).single();
      await SchoolService.upsertFee({
        id: feeForm.id,
        student_id: selectedStudent.id,
        month: feeForm.month,
        amount_due: totalFeeAmount,
        amount_paid: parseFloat(feeForm.amount_paid),
        status: feeForm.status,
        items: feeForm.items,
        academic_year_id: years?.id
      });
      toast.success(feeForm.id ? 'Fee record updated' : 'Fee record saved');
      onSuccess();
      await fetchStudentFees(selectedStudent.id);
    } catch {
      toast.error('Fee operation failed');
    }
  };

  return {
    studentFees,
    setStudentFees,
    loadingFees,
    fetchStudentFees,
    handleIssueFee,
  };
};
