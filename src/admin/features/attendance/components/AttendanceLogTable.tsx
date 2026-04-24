import React, { useState } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, Save, History } from 'lucide-react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';

interface AttendanceLogTableProps {
  attendance: any[];
  loading: boolean;
  date: string;
  onRefresh: () => void;
}

export const AttendanceLogTable: React.FC<AttendanceLogTableProps> = ({ attendance, loading, date, onRefresh }) => {
  const [localChanges, setLocalChanges] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleStatusChange = (teacherId: string, status: string) => {
    setLocalChanges(prev => ({ ...prev, [teacherId]: status }));
  };

  const handleSaveAll = async () => {
    const changeEntries = Object.entries(localChanges);
    if (changeEntries.length === 0) {
      toast.info('No changes to save');
      return;
    }

    setSaving(true);
    const records = changeEntries.map(([teacherId, status]) => ({
      teacher_id: teacherId,
      date: date,
      status: status
    }));

    try {
      // Use bulk upsert if available, or sequential
      await Promise.all(records.map(r => SchoolService.upsertTeacherAttendance(r)));
      toast.success(`Successfully updated ${records.length} faculty records`);
      setLocalChanges({});
      onRefresh();
    } catch (error) {
      toast.error('Failed to sync attendance changes');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(localChanges).length > 0;

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
             <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance Sheet</p>
            <p className="text-sm font-black text-slate-900">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={!hasChanges || saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg ${
            hasChanges 
              ? 'bg-slate-900 text-white hover:bg-indigo-600 shadow-indigo-100' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
          }`}
        >
          {saving ? (
            <div className="h-4 w-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Syncing...' : 'Save Daily Sheet'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/30 text-[10px] uppercase font-black text-slate-400 tracking-widest">
            <tr>
              <th className="px-6 py-5 whitespace-nowrap">Faculty Member</th>
              <th className="px-6 py-5 whitespace-nowrap">Department/Role</th>
              <th className="px-6 py-5 whitespace-nowrap">Status (Queued)</th>
              <th className="px-6 py-5 whitespace-nowrap text-center">Mark Attendance</th>
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
              attendance.map(a => {
                const currentStatus = localChanges[a.teacher_id] || a.status;
                const isChanged = !!localChanges[a.teacher_id];

                return (
                  <tr key={a.teacher_id} className={`transition-colors ${isChanged ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-900 text-sm whitespace-nowrap">{a.teacher?.full_name || 'Staff'}</p>
                      <p className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">{a.teacher_id?.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700 text-sm">Academic Faculty</p>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                        {isChanged ? (
                          <span className="text-indigo-600 font-black flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Unsaved Change
                          </span>
                        ) : 'Full-Time Staff'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        currentStatus === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        currentStatus === 'absent' ? 'bg-red-50 text-red-600 border-red-100' :
                        currentStatus === 'late' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {currentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        {['present', 'absent', 'late'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(a.teacher_id, status)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              currentStatus === status
                              ? status === 'present' ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100' :
                                status === 'absent' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-100' :
                                'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100'
                              : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
