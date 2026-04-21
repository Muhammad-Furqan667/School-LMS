import React from 'react';
import { 
  ShieldCheck, 
  RefreshCcw, 
  Activity 
} from 'lucide-react';
import { useSystemAudit } from '../hooks/useSystemAudit';
import { AuditLogTable } from './AuditLogTable';
import { AuditSummaryCard } from './AuditSummaryCard';
import { AuditVerificationView } from './AuditVerificationView';

export const SystemAuditFeature: React.FC = () => {
  const {
    auditData,
    loading,
    repairing,
    progress,
    fetchAudit,
    handleRepairAll
  } = useSystemAudit();

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
        <AuditVerificationView />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
           {/* Summary Cards */}
           <div className="space-y-6">
              <AuditSummaryCard studentsCount={auditData.students.length} teachersCount={auditData.teachers.length} />

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
           <AuditLogTable 
             teachers={auditData.teachers} 
             students={auditData.students} 
             loading={loading} 
             onRefresh={fetchAudit} 
           />
        </div>
      )}
    </div>
  );
};
