import React from 'react';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface AttendanceLogTableProps {
  attendance: any[];
  loading: boolean;
}

export const AttendanceLogTable: React.FC<AttendanceLogTableProps> = ({ attendance, loading }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-[10px] uppercase font-black text-slate-400 tracking-widest">
            <tr>
              <th className="px-6 py-5 whitespace-nowrap">Student Identity</th>
              <th className="px-6 py-5 whitespace-nowrap">Course Assignment</th>
              <th className="px-6 py-5 whitespace-nowrap">Instructor</th>
              <th className="px-6 py-5 whitespace-nowrap text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-20 text-center text-slate-400">
                  <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-indigo-600 rounded-full mx-auto mb-3"></div>
                  <p className="text-xs font-bold">Synchronizing Logs...</p>
                </td>
              </tr>
            ) : attendance.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center text-slate-400">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">No Attendance Logs Found</p>
                </td>
              </tr>
            ) : (
              attendance.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-900 text-sm whitespace-nowrap">{a.students?.name || 'Unknown User'}</p>
                    <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">{a.students?.roll_no}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700 text-sm">{a.assignment?.subject?.name || 'General Admission'}</p>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      {a.assignment?.class ? `Class ${a.assignment.class.grade}-${a.assignment.class.section}` : 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                      {a.assignment?.teacher?.full_name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center">
                      {a.status === 'present' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100"><CheckCircle2 className="h-3.5 w-3.5" /> Present</span>}
                      {a.status === 'absent' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100"><XCircle className="h-3.5 w-3.5" /> Absent</span>}
                      {a.status === 'late' && <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl text-xs font-black uppercase tracking-widest border border-amber-100"><Clock className="h-3.5 w-3.5" /> Late</span>}
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
