import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Users,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { toast } from 'sonner';

export const SystemAudit: React.FC = () => {
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchAudit();
  }, []);

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const data = await SchoolService.getAuthAudit();
      setAuditData(data);
    } catch (error) {
      toast.error('Failed to scan system identities');
    } finally {
      setLoading(false);
    }
  };

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
        // Small delay to respect Supabase limits
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
        // Small delay to respect Supabase limits
        await new Promise(res => setTimeout(res, 2000));
      } catch (err: any) {
        toast.error(`Failed to repair Student: ${student.name}`, { description: err.message });
      }
    }

    setRepairing(false);
    toast.success('System Audit & Repair Complete', {
        description: `Successfully synchronized ${completed} identities.`
    });
    fetchAudit(); // Refresh the list
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Activity className="h-10 w-10 text-emerald-500 animate-pulse" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic animate-bounce">Scanning Crypto-Identities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">System Audit</h1>
          <p className="text-slate-500 font-medium mt-2 md:text-lg">
            {auditData.totalMissing === 0 
              ? 'All accounts are synchronized and active.' 
              : `${auditData.totalMissing} identities require authentication synchronization.`}
          </p>
        </div>
        <button 
          onClick={handleRepairAll}
          disabled={repairing || auditData.totalMissing === 0}
          className={`flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-sm shadow-xl transition-all w-full lg:w-auto ${
            repairing 
              ? 'bg-slate-100 text-slate-400' 
              : auditData.totalMissing === 0 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-not-allowed shadow-none' 
                : 'bg-slate-900 text-white hover:bg-emerald-600 active:scale-95 shadow-slate-200 hover:shadow-emerald-500/20'
          }`}
        >
          {repairing ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {repairing ? `Repairing (${progress}%)...` : 'Repair All Identities'}
        </button>
      </div>

      {auditData.totalMissing === 0 ? (
        <div className="bg-white rounded-[3rem] border border-slate-200 p-12 text-center shadow-sm">
           <div className="h-24 w-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-emerald-100">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
           </div>
           <h2 className="text-2xl font-black text-slate-900 mb-2">System Integrity Verified</h2>
           <p className="text-slate-400 font-medium mb-12 max-w-md mx-auto">
             No authentication anomalies detected. All faculty and students have valid digital signatures.
           </p>
           <div className="flex justify-center gap-4">
              <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Verify</p>
                  <p className="text-sm font-black text-slate-700">Just Now</p>
                </div>
                <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-sm font-black text-emerald-600">Stable</p>
                </div>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           {/* Summary Cards */}
           <div className="space-y-6">
              <div className="bg-amber-50 rounded-[2.5rem] border border-amber-200 p-8 flex items-start gap-6 border-l-[12px] border-l-amber-500 shadow-xl shadow-amber-500/5">
                <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-amber-600 shadow-sm shrink-0">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-amber-900 mb-2 leading-none">Action Required</h3>
                  <p className="text-amber-800/60 font-medium text-sm leading-relaxed">
                    Some accounts exist in the registry but lack a **Supabase Auth Login**. This causes the "Invalid Credentials" error.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-amber-200/50 text-amber-900 rounded-xl text-[10px] font-black border border-amber-200">
                      {auditData.students.length} Students Pending
                    </span>
                    <span className="px-4 py-2 bg-amber-200/50 text-amber-900 rounded-xl text-[10px] font-black border border-amber-200">
                      {auditData.teachers.length} Faculty Pending
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Panel when repairing */}
              {repairing && (
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Repair Progress</h3>
                    <span className="text-xs font-black text-emerald-600">{progress}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500 ease-out shadow-lg shadow-emerald-500/50" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 italic">Syncing identities with Supabase Cloud Services...</p>
                </div>
              )}
           </div>

           {/* Missing User List */}
           <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/10 backdrop-blur-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Affected Registry Items</h3>
                <RefreshCcw 
                   onClick={fetchAudit}
                   className={`h-4 w-4 text-slate-300 cursor-pointer hover:text-slate-600 transition-colors ${loading ? 'animate-spin' : ''}`} 
                />
              </div>
              <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
                {auditData.teachers.map((t: any) => (
                  <div key={t.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{t.full_name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Faculty Member</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black rounded-md border border-red-100 uppercase">No Login</span>
                       <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                ))}

                {auditData.students.map((s: any) => (
                  <div key={s.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{s.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                          ID: {s.roll_no}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black rounded-md border border-amber-100 uppercase">Pending Link</span>
                       <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
