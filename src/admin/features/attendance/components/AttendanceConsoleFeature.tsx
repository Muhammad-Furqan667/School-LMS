import React from 'react';
import { Search, Calendar, Clock } from 'lucide-react';
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
    stats,
    fetchData
  } = useGlobalAttendance(new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    (window as any).refreshGlobalAttendance = fetchData;
    return () => { delete (window as any).refreshGlobalAttendance; };
  }, [fetchData]);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">Faculty Hub</h1>
          <p className="text-slate-500 font-medium mt-3 md:text-lg">
            Institutional oversight for teaching staff logs and daily attendance metrics.
          </p>
        </div>
      </div>

      {/* Prominent Date Selection Bar */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Calendar className="h-6 w-6 text-indigo-400" />
              Schedule Context
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
              Viewing logs for <span className="text-indigo-400">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group">
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl p-5 text-white font-black text-sm outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all cursor-pointer w-full md:w-64 backdrop-blur-md"
                />
             </div>
             <button 
               onClick={fetchData}
               className="p-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg active:scale-95 group"
             >
                <div className="h-5 w-5 animate-in spin-in-180 duration-700">
                   <Clock className="h-5 w-5" />
                </div>
             </button>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-64 w-64 bg-indigo-500/10 blur-[100px] rounded-full" />
      </div>

      <AttendanceSummaryCards stats={stats} />

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by teacher name..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium focus:ring-4 focus:ring-indigo-500/5 transition-all"
              />
           </div>
        </div>
        
        <AttendanceLogTable 
          attendance={filteredAttendance} 
          loading={loading} 
          date={date}
          onRefresh={fetchData}
        />
      </div>
    </div>
  );
};
