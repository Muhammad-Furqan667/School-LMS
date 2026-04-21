import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AuditSummaryCardProps {
  studentsCount: number;
  teachersCount: number;
}

export const AuditSummaryCard: React.FC<AuditSummaryCardProps> = ({ studentsCount, teachersCount }) => {
  return (
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
            {studentsCount} Students Pending
          </span>
          <span className="px-4 py-2 bg-amber-200/50 text-amber-900 rounded-xl text-[10px] font-black border border-amber-200">
            {teachersCount} Faculty Pending
          </span>
        </div>
      </div>
    </div>
  );
};
