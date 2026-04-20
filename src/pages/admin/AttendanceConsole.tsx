import React, { useState, useEffect } from 'react';
import { SchoolService } from '../../services/schoolService';
import { toast } from 'sonner';
import { 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';

export const AttendanceConsole: React.FC = () => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await SchoolService.getAllAttendance(date);
      setAttendance(data || []);
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(record => 
    record.students?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.students?.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.assignment?.subject?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(a => a.status === 'present').length,
    absent: filteredAttendance.filter(a => a.status === 'absent').length,
    late: filteredAttendance.filter(a => a.status === 'late').length,
  };

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
               ) : filteredAttendance.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="py-20 text-center text-slate-400">
                     <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
                     <p className="text-xs font-black uppercase tracking-widest">No Attendance Logs Found</p>
                   </td>
                 </tr>
               ) : (
                 filteredAttendance.map(a => (
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
    </div>
  );
};
