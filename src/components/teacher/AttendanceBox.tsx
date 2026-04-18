import React, { useState } from 'react';
import { UserCheck, UserX, Clock, Save, Search } from 'lucide-react';

interface AttendanceBoxProps {
  students: any[];
  onSave?: (attendance: any) => void;
}

export const AttendanceBox: React.FC<AttendanceBoxProps> = ({ students, onSave }) => {
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'late'>>(
    students.reduce((acc, s) => ({ ...acc, [s.id]: 'present' }), {})
  );
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  return (
    <div className="bg-surface rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Attendance</h2>
          <p className="text-xs text-slate-500 font-medium">Mark attendance for today, {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
              />
           </div>
           <button 
             onClick={() => onSave?.(attendanceData)}
             className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200"
           >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save Sheet</span>
           </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
            <tr>
              <th className="px-6 py-4">Roll No</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-slate-400">#{student.roll_no}</span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-900">{student.name}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {[
                      { id: 'present', icon: UserCheck, color: 'emerald', label: 'Present' },
                      { id: 'late', icon: Clock, color: 'amber', label: 'Late' },
                      { id: 'absent', icon: UserX, color: 'red', label: 'Absent' }
                    ].map((status) => {
                      const Icon = status.icon;
                      const isActive = attendanceData[student.id] === status.id;
                      return (
                        <button
                          key={status.id}
                          onClick={() => toggleStatus(student.id, status.id as any)}
                          title={status.label}
                          className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                            isActive 
                              ? `bg-${status.color}-50 border-${status.color}-200 text-${status.color}-600 scale-105 shadow-sm` 
                              : 'bg-white border-slate-100 text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {isActive && <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">{status.id}</span>}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="py-20 text-center">
             <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="h-8 w-8 text-slate-200" />
             </div>
             <p className="text-slate-400 font-medium">No students found matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};
