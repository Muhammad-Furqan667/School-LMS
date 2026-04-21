import React from 'react';

interface FeeStatsBarProps {
  totalDue: number;
  totalPaid: number;
  pending: number;
}

export const FeeStatsBar: React.FC<FeeStatsBarProps> = ({ totalDue, totalPaid, pending }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-[#f8fafc] border-b border-slate-100">
      <div className="p-8 text-center group">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Total Receivable</p>
        <h4 className="text-2xl font-black text-slate-900">PKR {totalDue.toLocaleString()}</h4>
        <div className="mt-4 h-1 w-12 bg-slate-200 mx-auto rounded-full" />
      </div>
      <div className="p-8 text-center group">
        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 leading-none">Total Recovered</p>
        <h4 className="text-2xl font-black text-emerald-600">PKR {totalPaid.toLocaleString()}</h4>
        <div className="mt-4 h-1 w-12 bg-emerald-500/30 mx-auto rounded-full" />
      </div>
      <div className="p-8 text-center group">
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 leading-none">Total Arrears</p>
        <h4 className="text-2xl font-black text-rose-600">PKR {pending.toLocaleString()}</h4>
        <div className="mt-4 h-1 w-12 bg-rose-500/30 mx-auto rounded-full" />
      </div>
    </div>
  );
};
