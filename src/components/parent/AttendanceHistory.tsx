import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock, MapPin } from 'lucide-react';

interface AttendanceHistoryProps {
  history?: any[];
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ history = [] }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-8 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Attendance Logs</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Full history of student presence</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Print Registry
          </button>
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-8 py-4">Date</th>
              <th className="px-8 py-4">Subject & Session</th>
              <th className="px-8 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-8 py-12 text-center text-slate-400 italic text-sm">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-900 text-sm">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <MapPin className="h-4 w-4" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900">{record.assignment?.subject?.name || 'Daily Attendance'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                            By {record.assignment?.teacher?.full_name || 'Class Moderator'}
                          </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       {record.status === 'present' && (
                         <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" /> Present
                         </div>
                       )}
                       {record.status === 'absent' && (
                         <div className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" /> Absent
                         </div>
                       )}
                       {record.status === 'late' && (
                         <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Late
                         </div>
                       )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
