import React, { useState, useEffect } from 'react';
import { Calendar, Save, History, Edit2, Plus, X } from 'lucide-react';
import { SchoolService } from '../../../../../../services/schoolService';
import { toast } from 'sonner';

interface AttendanceTabProps {
  selectedStudent: any;
}

export const AttendanceTab: React.FC<AttendanceTabProps> = ({ selectedStudent }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDate, setEditDate] = useState(new Date().toISOString().split('T')[0]);
  const [editStatus, setEditStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [targetAssignmentId, setTargetAssignmentId] = useState<string | null>(null);
  const [targetSubjectName, setTargetSubjectName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await SchoolService.getAttendanceHistory(selectedStudent.id);
      setHistory(data || []);
    } catch (e) {
      console.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedStudent.id]);

  const handleSelectToEdit = (record: any) => {
    setEditDate(record.date);
    setEditStatus(record.status as any);
    setTargetAssignmentId(record.assignment_id || null);
    setTargetSubjectName(record.assignment?.subject?.name || 'Manual Registry');
    // Scroll to top of section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSelection = () => {
    setTargetAssignmentId(null);
    setTargetSubjectName(null);
    setEditDate(new Date().toISOString().split('T')[0]);
    setEditStatus('present');
  };

  const handleManualOverride = async () => {
    try {
      setSaving(true);
      const records = [{
        student_id: selectedStudent.id,
        date: editDate,
        status: editStatus,
        assignment_id: targetAssignmentId, 
        marking_time: new Date().toLocaleTimeString('en-GB', { hour12: false })
      }];

      await SchoolService.bulkUpsertAttendance(records);
      toast.success(targetAssignmentId ? 'Record updated' : 'Attendance record added');
      fetchHistory();
      if (targetAssignmentId) clearSelection();
    } catch (e) {
      toast.error('Failed to override attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Manual Override Section */}
      <section className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white ${targetAssignmentId ? 'bg-amber-500' : 'bg-indigo-600'}`}>
              {targetAssignmentId ? <Edit2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>
            {targetAssignmentId ? `Update: ${targetSubjectName}` : 'New Manual Record'}
          </h3>
          {targetAssignmentId && (
            <button 
              onClick={clearSelection}
              className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-600 hover:border-red-100 transition-all flex items-center gap-1"
            >
              <X className="h-3 w-3" /> Cancel Update
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
            <input 
              type="date" 
              disabled={!!targetAssignmentId}
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 font-bold disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Status</label>
            <div className="flex gap-2 p-1 bg-white border border-slate-200 rounded-2xl">
              {(['present', 'absent', 'late'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setEditStatus(s)}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${editStatus === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleManualOverride}
              disabled={saving}
              className={`w-full py-4 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${targetAssignmentId ? 'bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-200' : 'bg-slate-900 hover:bg-indigo-600'}`}
            >
              <Save className="h-4 w-4" />
              {saving ? 'Processing...' : targetAssignmentId ? 'Apply Update' : 'Save Record'}
            </button>
          </div>
        </div>
      </section>

      {/* History List */}
      <section>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
          <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
            <History className="h-4 w-4" />
          </div>
          Attendance Registry
        </h3>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">No attendance records found for this student.</p>
              </div>
            ) : (
              history.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                       <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {record.assignment?.subject?.name || 'Manual Registry'} · {record.marking_time?.slice(0, 5) || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 mr-4">
                       {record.status === 'present' && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Present</span>}
                       {record.status === 'absent' && <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-100">Absent</span>}
                       {record.status === 'late' && <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-100">Late</span>}
                    </div>
                    
                    <button
                      onClick={() => handleSelectToEdit(record)}
                      className="p-3 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm"
                      title="Edit this record"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
};
