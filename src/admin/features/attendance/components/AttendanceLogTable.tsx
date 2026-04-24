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
              <th className="px-6 py-5 whitespace-nowrap">Faculty Member</th>
              <th className="px-6 py-5 whitespace-nowrap">Department/Role</th>
              <th className="px-6 py-5 whitespace-nowrap">Last Updated</th>
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
                  <p className="text-xs font-black uppercase tracking-widest">No Faculty Attendance Logs</p>
                </td>
              </tr>
            ) : (
              attendance.map(a => (
                <tr key={a.teacher_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-900 text-sm whitespace-nowrap">{a.teacher?.full_name || 'Staff'}</p>
                    <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">{a.teacher_id?.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700 text-sm">Academic Faculty</p>
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                      Full-Time Staff
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                      {a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center gap-2">
                      {['present', 'absent', 'late'].map((status) => (
                        <button
                          key={status}
                          onClick={async () => {
                            try {
                              await SchoolService.upsertTeacherAttendance({
                                teacher_id: a.teacher_id,
                                date: a.date,
                                status: status
                              });
                              toast.success(`Marked ${a.teacher?.full_name} as ${status}`);
                              // Refresh data
                              if ((window as any).refreshGlobalAttendance) (window as any).refreshGlobalAttendance();
                            } catch {
                              toast.error('Failed to update attendance');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            a.status === status
                            ? status === 'present' ? 'bg-emerald-600 text-white border-emerald-600' :
                              status === 'absent' ? 'bg-red-600 text-white border-red-600' :
                              'bg-amber-500 text-white border-amber-500'
                            : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
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
