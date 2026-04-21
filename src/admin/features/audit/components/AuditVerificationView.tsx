import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const AuditVerificationView: React.FC = () => {
  return (
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
  );
};
