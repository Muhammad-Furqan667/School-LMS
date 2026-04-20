import React, { useState, useEffect } from 'react';
import { SchoolService } from '../../services/schoolService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { 
  Calendar, 
  Plus, 
  X,
  Trash2,
  Clock
} from 'lucide-react';

export const ClassConsole: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState({ grade: '', section: '' });

  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [classAttendance, setClassAttendance] = useState<any[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [timetableForm, setTimetableForm] = useState({
    assignment_id: '',
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '09:00'
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    if (isAttendanceModalOpen && selectedClass) {
      fetchAttendanceData(selectedClass.id, attendanceDate);
    }
  }, [attendanceDate, isAttendanceModalOpen, selectedClass]);

  const openAttendance = async (c: any) => {
    setSelectedClass(c);
    setIsAttendanceModalOpen(true);
    // Initial fetch handled by useEffect
  };

  const fetchAttendanceData = async (classId: string, date: string) => {
    try {
      const [students, assignments, attendance] = await Promise.all([
        SchoolService.getStudentsByClass(classId),
        SchoolService.getTeacherAssignmentsByClass(classId),
        SchoolService.getAttendanceByClassAndDate(classId, date)
      ]);
      
      setClassStudents(students || []);
      setAssignments(assignments || []);
      setClassAttendance(attendance || []);
    } catch (e) {
      toast.error('Failed to load attendance records');
    }
  };

  const handleUpdateAttendance = async (studentId: string, assignmentId: string, status: string) => {
    try {
      await SchoolService.bulkUpsertAttendance([{
        student_id: studentId,
        assignment_id: assignmentId,
        date: attendanceDate,
        status: status
      }]);
      // Refresh local state efficiently
      fetchAttendanceData(selectedClass.id, attendanceDate);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const timeSlots = (() => {
    const base = [8, 9, 10, 11, 12, 13, 14, 15]; // 08:00 - 15:00
    const dataHours = timetable.map(t => parseInt(t.start_time.split(':')[0]));
    const maxHour = Math.min(Math.max(...base, ...dataHours), 17);
    const slots = [];
    for (let h = 8; h <= maxHour; h++) {
       slots.push(`${h.toString().padStart(2, '0')}:00:00`);
    }
    return slots;
  })();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const data = await SchoolService.getClasses();
      setClasses(data || []);
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: years } = await supabase.from('academic_years').select('id').eq('is_current', true).single();
      await SchoolService.upsertClass({
        grade: classForm.grade,
        section: classForm.section,
        academic_year_id: years?.id
      });
      toast.success('Class created');
      setIsClassModalOpen(false);
      setClassForm({ grade: '', section: '' });
      fetchClasses();
    } catch {
      toast.error('Failed to create class');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class? All students must be removed first.')) return;
    try {
      await SchoolService.deleteClass(id);
      toast.success('Class deleted');
      fetchClasses();
    } catch {
      toast.error('Cannot delete class, is it empty?');
    }
  };

  const openTimetable = async (c: any) => {
    setSelectedClass(c);
    setIsTimetableModalOpen(true);
    fetchTimetableData(c.id);
  };

  const fetchTimetableData = async (classId: string) => {
    try {
      const tData = await SchoolService.getTimetable(classId);
      // It returns items matching assignment.class_id, but supabase sometimes returns null for inner joined conditions if not strictly inner
      // Filter out invalid items just in case
      setTimetable(tData ? tData.filter((i: any) => i.assignment !== null) : []);

      const { data: aData, error } = await supabase
        .from('teacher_assignments')
        .select('*, subject:subjects(*), teacher:teachers(*)')
        .eq('class_id', classId);
        
      if (error) throw error;
      setAssignments(aData || []);
    } catch (e) {
      toast.error('Error fetching timetable');
    }
  };

  const handleAddTimetableSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timetableForm.assignment_id) return;
    try {
      await SchoolService.upsertTimetable({
        assignment_id: timetableForm.assignment_id,
        day_of_week: timetableForm.day_of_week,
        start_time: timetableForm.start_time,
        end_time: timetableForm.end_time
      });
      toast.success('Slot scheduled');
      fetchTimetableData(selectedClass.id);
    } catch {
      toast.error('Failed to schedule slot');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
       await SchoolService.deleteTimetable(id);
       toast.success('Slot removed');
       fetchTimetableData(selectedClass.id);
    } catch {
       toast.error('Deletion failed');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Class Repository</h1>
          <p className="text-slate-500 font-medium mt-2 md:text-lg">
            Manage academic batches, grades, and classroom timetables.
          </p>
        </div>
        <button 
          onClick={() => setIsClassModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          Create New Class
        </button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
           <div className="col-span-full p-20 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
           </div>
        ) : classes.map((c) => (
          <div key={c.id} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all group relative">
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => handleDeleteClass(c.id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-xl">
                 <Trash2 className="h-4 w-4" />
               </button>
            </div>
            <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-[1.25rem] flex items-center justify-center font-black text-slate-400 text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
              {c.grade}
            </div>
            <div className="mt-6 mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">{c.grade}{c.section} {c.academic_years?.year_label}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Section {c.section}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => openTimetable(c)}
                className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="h-4 w-4" /> Schedule
              </button>
              <button 
                onClick={() => openAttendance(c)}
                className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Clock className="h-4 w-4" /> Attendance
              </button>
            </div>
          </div>
        ))}
      </div>

      {isAttendanceModalOpen && selectedClass && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAttendanceModalOpen(false)} />
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
                   <button onClick={() => setIsAttendanceModalOpen(false)} className="p-4 bg-white text-slate-400 hover:text-red-500 rounded-2xl border border-slate-100 shadow-sm transition-all">
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
                                                  onClick={() => handleUpdateAttendance(student.id, assignment.id, status)}
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
      )}

      {isClassModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsClassModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-10">
               <div>
                  <h2 className="text-2xl font-black">Add Class</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Define new structural grade</p>
               </div>
               <button onClick={() => setIsClassModalOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X className="h-5 w-5"/></button>
             </div>
             <form onSubmit={handleAddClass} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Grade Value</label>
                  <input required value={classForm.grade} onChange={(e) => setClassForm({...classForm, grade: e.target.value})} className="w-full p-5 bg-slate-50 border rounded-2xl outline-none font-bold" placeholder="e.g. 10" />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Section Indicator</label>
                  <input required value={classForm.section} onChange={(e) => setClassForm({...classForm, section: e.target.value.toUpperCase()})} className="w-full p-5 bg-slate-50 border rounded-2xl outline-none font-bold" placeholder="e.g. A" />
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all">Publish Class</button>
             </form>
          </div>
        </div>
      )}

      {isTimetableModalOpen && selectedClass && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsTimetableModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-6xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 h-[90vh] md:max-h-[85vh]">
            {/* Scheduler Sidebar */}
            <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-slate-200 flex flex-col z-10 overflow-y-auto">
               <h2 className="text-2xl font-black">Scheduler</h2>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Class {selectedClass.grade}{selectedClass.section}</p>
               
               <form onSubmit={handleAddTimetableSlot} className="mt-8 space-y-6 flex-1">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Assignment</label>
                    <select required value={timetableForm.assignment_id} onChange={(e) => setTimetableForm({...timetableForm, assignment_id: e.target.value})} className="w-full p-4 bg-white border border-slate-200 rounded-xl outline-none appearance-none font-black text-xs cursor-pointer focus:ring-2 focus:ring-emerald-600 transition-all">
                       <option value="">Choose...</option>
                       {assignments.map(a => (
                          <option key={a.id} value={a.id}>{a.subject?.name} ({a.teacher?.full_name})</option>
                       ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Day</label>
                    <div className="grid grid-cols-1 gap-2">
                       {daysOfWeek.map(d => (
                         <button
                           key={d}
                           type="button"
                           onClick={() => setTimetableForm({...timetableForm, day_of_week: d})}
                           className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${timetableForm.day_of_week === d ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'}`}
                         >
                           {d}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Starts</label>
                      <input required type="time" value={timetableForm.start_time} onChange={(e) => setTimetableForm({...timetableForm, start_time: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-black text-xs" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Ends</label>
                      <input required type="time" value={timetableForm.end_time} onChange={(e) => setTimetableForm({...timetableForm, end_time: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none font-black text-xs" />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-xl hover:bg-emerald-600 transition-all shadow-lg active:scale-95 text-xs uppercase tracking-widest">Add to Schedule</button>
               </form>
               <button onClick={() => setIsTimetableModalOpen(false)} className="mt-6 w-full py-4 text-slate-400 hover:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest">Exit Editor</button>
            </div>

            {/* Timetable Grid View */}
            <div className="flex-1 p-6 overflow-x-auto bg-white">
               <div className="min-w-[700px] h-full flex flex-col">
                  <div className="mb-6 flex items-center justify-between">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Weekly Grid - Class {selectedClass.grade}{selectedClass.section}</p>
                     <div className="h-1 flex-1 mx-4 bg-slate-50 rounded-full" />
                  </div>

                  <div 
                    className="grid gap-1.5"
                    style={{ gridTemplateColumns: `80px repeat(${timeSlots.length || 1}, minmax(100px, 1fr))` }}
                  >
                    {/* Header: Times */}
                    <div className="h-8 invisible" />
                    {timeSlots.length > 0 ? timeSlots.map(time => (
                      <div key={time} className="h-8 flex items-center justify-center font-black text-[9px] text-slate-400 uppercase tracking-widest bg-slate-50 rounded-lg border border-slate-100">
                        {formatTime(time)}
                      </div>
                    )) : (
                      <div className="h-8 flex items-center justify-center text-slate-400 text-[9px] italic">No slots</div>
                    )}

                    {/* Rows: Days */}
                    {daysOfWeek.map(day => (
                      <React.Fragment key={day}>
                        <div className="h-16 flex items-center pr-4 font-bold text-xs text-slate-900 border-r border-slate-100">
                          {day}
                        </div>
                        {timeSlots.map(time => {
                          const slot = timetable.find(s => s.day_of_week === day && s.start_time.startsWith(time.slice(0, 5)));
                          return (
                            <div key={time} className="h-16 p-1 relative group">
                              {slot ? (
                                <div className="h-full w-full bg-emerald-50 rounded-lg border border-emerald-100 p-1.5 flex flex-col justify-center relative animate-in zoom-in-95 duration-300">
                                  <button 
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                  <p className="text-[10px] font-bold text-slate-900 truncate tracking-tight">
                                    {slot.assignment?.subject?.name}
                                  </p>
                                  <p className="text-[8px] text-slate-500 font-bold truncate mt-0.5">
                                    {slot.assignment?.teacher?.full_name}
                                  </p>
                                  <p className="text-[7px] text-emerald-600 font-black mt-1">
                                    {formatTime(slot.start_time)}
                                  </p>
                                </div>
                              ) : (
                                <div className="h-full w-full bg-slate-50/30 rounded-lg border border-dashed border-slate-100 transition-colors hover:bg-slate-50/50" />
                              )}
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>

                  {timetable.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 mt-10">
                       <Calendar className="h-12 w-12 mb-2 text-slate-300" />
                       <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Ready for scheduling</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
