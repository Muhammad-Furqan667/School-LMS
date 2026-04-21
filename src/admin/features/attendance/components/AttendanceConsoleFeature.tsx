import React from 'react';
import { Search } from 'lucide-react';
import { useGlobalAttendance } from '../hooks/useGlobalAttendance';
import { AttendanceLogTable } from './AttendanceLogTable';
import { AttendanceSummaryCards } from './AttendanceSummaryCards';

export const AttendanceConsoleFeature: React.FC = () => {
  const {
    date,
    setDate,
    filteredAttendance,
    loading,
    searchTerm,
    setSearchTerm,
    stats
  } = useGlobalAttendance(new Date().toISOString().split('T')[0]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Attendance Log</h1>
          <p className="text-slate-500 font-medium mt-2 md:text-lg">
            Monitor daily attendance entries mapped across all academic courses.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative group w-full lg:w-48">
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 font-black text-slate-900 cursor-pointer shadow-sm"
            />
          </div>
        </div>
      </div>

      <AttendanceSummaryCards stats={stats} />

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by student name, roll number, or subject..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 transition-all"
              />
           </div>
        </div>
        
        <AttendanceLogTable attendance={filteredAttendance} loading={loading} />
      </div>
    </div>
  );
};
