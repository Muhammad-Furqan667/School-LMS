import React from 'react';
import { Clock, X, Plus } from 'lucide-react';
import type { Class } from '../../types/class.types';

interface AttendanceModalProps {
  selectedClass: Class;
  attendanceDate: string;
  setAttendanceDate: (val: string) => void;
  assignments: any[];
  classStudents: any[];
  classAttendance: any[];
  onUpdateAttendance: (studentId: string, assignmentId: string, status: string) => Promise<void>;
  onClose: () => void;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  selectedClass,
  attendanceDate,
  setAttendanceDate,
  assignments,
  classStudents,
  classAttendance,
  onUpdateAttendance,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
         <div className="p-8 pb-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex gap-5">
               <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Clock className="h-7 w-7 text-white" />
               </div>
               <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Class Attendance</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Grade {selectedClass.grade} Section {selectedClass.section}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <input 
                  type="date" 
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="p-3 bg-white border border-slate-200 rounded-xl font-black text-xs outline-none focus:ring-2 focus:ring-indigo-600"
               />
               <button onClick={onClose} className="p-4 bg-white text-slate-400 hover:text-red-500 rounded-2xl border border-slate-100 shadow-sm transition-all">
                  <X className="h-5 w-5" />
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-8">
            {assignments.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                 <Plus className="h-12 w-12 mb-4 text-slate-300" />
                 <p className="font-black text-slate-400 uppercase tracking-widest text-xs">No Subject Assignments Found for this class</p>
              </div>
            ) : (
              <div className="space-y-8">
                {assignments.map(assignment => {
                  const subjectAttendance = classAttendance.filter(a => a.assignment_id === assignment.id);
                  return (
                    <div key={assignment.id} className="bg-slate-50/50 border border-slate-100 rounded-[2rem] overflow-hidden">
                       <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                             <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center font-black text-indigo-600 text-xs">
                                {assignment.subject?.name?.[0]}
                             </div>
                             <div>
                                <h3 className="font-black text-slate-900">{assignment.subject?.name}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{assignment.teacher?.full_name}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6">
                             <div className="text-right">
                                <p className="text-sm font-black text-slate-900">{subjectAttendance.length}/{classStudents.length}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Logged Records</p>
                             </div>
                          </div>
                       </div>

                       <div className="p-6 overflow-x-auto">
                          <table className="w-full text-left">
                             <thead className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                                <tr>
                                   <th className="pb-4 pl-2">Student Name</th>
                                   <th className="pb-4 text-center">Status</th>
                                   <th className="pb-4 text-right pr-2">Last Action</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100/50">
                                {classStudents.map(student => {
                                  const record = classAttendance.find(a => a.student_id === student.id && a.assignment_id === assignment.id);
                                  return (
                                    <tr key={student.id} className="group">
                                      <td className="py-4 pl-2">
                                        <p className="text-sm font-bold text-slate-800">{student.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{student.roll_no}</p>
                                      </td>
                                      <td className="py-4">
                                        <div className="flex justify-center gap-1.5">
                                          {['present', 'absent', 'late'].map(status => (
                                            <button
                                              key={status}
                                              onClick={() => onUpdateAttendance(student.id, assignment.id, status)}
                                              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${record?.status === status 
                                                ? status === 'present' ? 'bg-emerald-600 text-white shadow-lg' : status === 'absent' ? 'bg-rose-600 text-white shadow-lg' : 'bg-amber-500 text-white shadow-lg'
                                                : 'bg-white border border-slate-100 text-slate-300 hover:bg-slate-50'
                                              }`}
                                            >
                                              {status}
                                            </button>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="py-4 text-right pr-2">
                                        <p className="text-[10px] font-bold text-slate-400">
                                          {record ? new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                        </p>
                                      </td>
                                    </tr>
                                  );
                                })}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
