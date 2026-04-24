import React, { useState } from 'react';
import { UserCheck, UserX, Clock, Save, Search } from 'lucide-react';

interface AttendanceBoxProps {
  students: any[];
  isClassTeacher?: boolean; // True if current teacher is the Section Moderator
  existingAttendance?: any[]; // Records already saved for today
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSave?: (attendance: any, time: string) => void;
}

export const AttendanceBox: React.FC<AttendanceBoxProps> = ({ 
  students = [], 
  isClassTeacher, 
  existingAttendance = [], 
  selectedDate,
  onDateChange,
  onSave 
}) => {
  const isAlreadyMarked = existingAttendance && existingAttendance.length > 0;
  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  
  const [markingTime, setMarkingTime] = React.useState(() => {
    if (isAlreadyMarked && existingAttendance[0].marking_time) {
      return existingAttendance[0].marking_time.slice(0, 5);
    }
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  const isLockedByTime = React.useMemo(() => {
    if (!isAlreadyMarked) return false;
    
    const firstRecord = existingAttendance[0];
    let createdTime: number;

    if (firstRecord.marking_time) {
      // Robust date parsing for "YYYY-MM-DDTHH:mm"
      const dateStr = `${firstRecord.date}T${firstRecord.marking_time.slice(0, 5)}`;
      createdTime = new Date(dateStr).getTime();
    } else {
      createdTime = new Date(firstRecord.created_at).getTime();
    }
    
    const now = new Date().getTime();
    const diffHours = (now - createdTime) / (1000 * 60 * 60);
    
    return diffHours > 5;
  }, [existingAttendance, isAlreadyMarked]);

  const canEdit = isClassTeacher && isToday && !isLockedByTime;

  const currentHour = new Date().getHours();
  const displayHour = String(currentHour).padStart(2, '0');

  const [attendanceData, setAttendanceData] = React.useState<Record<string, 'present' | 'absent' | 'late'>>({});

  React.useEffect(() => {
    if (isAlreadyMarked) {
      setAttendanceData(existingAttendance.reduce((acc: any, curr: any) => ({
        ...acc,
        [curr.student_id]: curr.status
      }), {}));
      if (existingAttendance[0].marking_time) {
        setMarkingTime(existingAttendance[0].marking_time.slice(0, 5));
      }
    } else if (isToday) {
      // Default to 'present' only for current day marking
      setAttendanceData((students || []).reduce((acc, s) => ({ ...acc, [s.id]: 'present' }), {}));
    } else {
      // Historical data with no records should show as empty/not-marked
      setAttendanceData({});
    }
  }, [isAlreadyMarked, existingAttendance, students, isToday]);
  
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (studentId: string, status: 'present' | 'absent' | 'late') => {
    if (!canEdit) return;
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };
  
  const handleTimeChange = (val: string) => {
    if (isAlreadyMarked) return;
    
    if (isToday) {
       const [h] = val.split(':');
       if (parseInt(h) !== currentHour) {
          return;
       }
    }
    setMarkingTime(val);
  };

  return (
    <div className="bg-surface rounded-3xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!isClassTeacher && (
        <div className="bg-amber-50 border-b border-amber-100 p-4 flex items-center gap-3">
          <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Attendance marking is restricted to the Section Moderator only.</p>
        </div>
      )}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Attendance</h2>
          <p className="text-xs text-slate-500 font-medium">
            {!isToday 
              ? `Viewing historical records for ${new Date(selectedDate).toLocaleDateString()}`
              : isLockedByTime 
                ? `Attendance record officially locked for ${new Date(selectedDate).toLocaleDateString()}`
                : isAlreadyMarked
                  ? `Editing window active for ${new Date(selectedDate).toLocaleDateString()}`
                  : `Mark attendance for ${new Date(selectedDate).toLocaleDateString()}`
            }
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-2">
             <input 
               type="date"
               value={selectedDate}
               max={new Date().toISOString().split('T')[0]}
               onChange={(e) => onDateChange(e.target.value)}
               className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 transition-all disabled:opacity-50"
             />
             <div className="relative group">
               <input 
                 type="time"
                 value={markingTime}
                 min={isToday ? `${displayHour}:00` : undefined}
                 max={isToday ? `${displayHour}:59` : undefined}
                 disabled={isAlreadyMarked || !isToday}
                 onChange={(e) => handleTimeChange(e.target.value)}
                 className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600 transition-all disabled:opacity-50"
               />
               {!isAlreadyMarked && isToday && (
                 <span className="absolute -top-6 left-0 text-[8px] font-black text-indigo-500 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                   Locked to {displayHour}:XX
                 </span>
               )}
             </div>
           </div>
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
             onClick={() => onSave?.(attendanceData, markingTime)}
             disabled={!canEdit}
             className={`flex items-center gap-2 px-6 py-2 font-bold rounded-xl transition-all shadow-lg ${
               canEdit
                 ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' 
                 : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
             }`}
           >
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isLockedByTime ? 'Record Locked' : isAlreadyMarked ? 'Update Sheet' : 'Save Sheet'}
              </span>
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
                    {attendanceData[student.id] ? (
                      [
                        { id: 'present', icon: UserCheck, color: 'emerald', label: 'Present' },
                        { id: 'late', icon: Clock, color: 'amber', label: 'Late' },
                        { id: 'absent', icon: UserX, color: 'red', label: 'Absent' }
                      ].map((status) => {
                        const Icon = status.icon;
                        const isActive = attendanceData[student.id] === status.id;
                        const Tag = canEdit ? 'button' : 'div';
                        return (
                          <Tag
                            key={status.id}
                            onClick={() => canEdit && toggleStatus(student.id, status.id as any)}
                            title={status.label}
                            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                              isActive 
                                ? `bg-${status.color}-50 border-${status.color}-200 text-${status.color}-600 scale-105 shadow-sm` 
                                : `bg-white border-slate-100 ${canEdit ? 'text-slate-300 hover:border-slate-300' : 'text-slate-200 opacity-20'}`
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            {isActive && <span className="text-[10px] font-black uppercase tracking-tighter hidden sm:inline">{status.id}</span>}
                          </Tag>
                        );
                      })
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                        No Record Found
                      </span>
                    )}
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
