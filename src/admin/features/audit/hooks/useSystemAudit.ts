import { useState, useEffect, useCallback } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';

export const useSystemAudit = () => {
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    try {
      const data = await SchoolService.getAuthAudit();
      setAuditData(data);
    } catch (error) {
      toast.error('Failed to scan system identities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  const handleRepairAll = async () => {
    if (!auditData || auditData.totalMissing === 0) return;
    
    setRepairing(true);
    setProgress(0);
    const total = auditData.totalMissing;
    let completed = 0;

    toast.info(`Starting Identity Repair for ${total} users...`, {
      description: 'Please keep this window open for maximum success rate.'
    });

    // 1. Repair Teachers
    for (const teacher of auditData.teachers) {
      try {
        const username = teacher.full_name.split(' ')[0].toLowerCase();
        await SchoolService.createTeacherAccess(teacher.id, username, 'Password123!');
        completed++;
        setProgress(Math.round((completed / total) * 100));
        await new Promise(res => setTimeout(res, 2000));
      } catch (err: any) {
        toast.error(`Failed to repair Teacher: ${teacher.full_name}`, { description: err.message });
      }
    }

    // 2. Repair Students
    for (const student of auditData.students) {
      try {
        await SchoolService.createStudentAccess(student.id, student.roll_no, 'Password123!');
        completed++;
        setProgress(Math.round((completed / total) * 100));
        await new Promise(res => setTimeout(res, 2000));
      } catch (err: any) {
        toast.error(`Failed to repair Student: ${student.name}`, { description: err.message });
      }
    }

    setRepairing(false);
    toast.success('System Audit & Repair Complete', {
        description: `Successfully synchronized ${completed} identities.`
    });
    fetchAudit();
  };

  return {
    auditData,
    loading,
    repairing,
    progress,
    fetchAudit,
    handleRepairAll
  };
};
