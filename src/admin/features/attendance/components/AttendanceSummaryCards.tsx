import React from 'react';

interface AttendanceSummaryCardsProps {
  stats: {
    total: number;
    present: number;
    late: number;
    absent: number;
  };
}

export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Recs</h3>
        <p className="text-3xl font-black text-slate-900">{stats.total}</p>
      </div>
      <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 shadow-sm flex flex-col items-center text-center">
        <h3 className="text-[10px] font-black text-emerald-600/60 uppercase tracking-widest mb-2">Present</h3>
        <p className="text-3xl font-black text-emerald-700">{stats.present}</p>
      </div>
      <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 shadow-sm flex flex-col items-center text-center">
        <h3 className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-2">Late Logins</h3>
        <p className="text-3xl font-black text-amber-700">{stats.late}</p>
      </div>
      <div className="bg-red-50 rounded-3xl p-6 border border-red-100 shadow-sm flex flex-col items-center text-center">
        <h3 className="text-[10px] font-black text-red-600/60 uppercase tracking-widest mb-2">Absent</h3>
        <p className="text-3xl font-black text-red-700">{stats.absent}</p>
      </div>
    </div>
  );
};
