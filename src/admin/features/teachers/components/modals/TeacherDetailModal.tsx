import React from 'react';
import { X, Edit3, Trash2, DollarSign, Calendar, ShieldCheck, CheckCircle2, BookOpen, ClipboardList } from 'lucide-react';
import type { Teacher, EditFormState } from '../../types/teacher.types';

interface TeacherDetailModalProps {
  selectedTeacher: Teacher;
  teacherAssignments: any[];
  tasks: any[];
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  editForm: EditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  closeDetail: () => void;
  handleSaveEdit: () => Promise<void>;
  handleDeleteTeacher: (id: string) => Promise<void>;
  handleRemoveAssignment: (assignmentId: string) => Promise<void>;
  setIsAssignModalOpen: (val: boolean) => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  selectedTeacher,
  teacherAssignments,
  tasks,
  isEditing,
  setIsEditing,
  editForm,
  setEditForm,
  closeDetail,
  handleSaveEdit,
  handleDeleteTeacher,
  handleRemoveAssignment,
  setIsAssignModalOpen,
}) => {
  const groupedTasks = (tasks || []).reduce((acc: any, task: any) => {
    const className = task.assignment?.class 
      ? `Grade ${task.assignment.class.grade}${task.assignment.class.section}`
      : 'Unassigned';
    if (!acc[className]) acc[className] = [];
    acc[className].push(task);
    return acc;
  }, {});
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={closeDetail} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh]">
        {/* Sidebar Info Section */}
        <div className="w-full md:w-80 bg-slate-900 p-8 text-white flex flex-col relative overflow-y-auto min-h-[300px] md:min-h-0">
          <button onClick={closeDetail} className="absolute right-6 top-6 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center mt-6">
            <div className="h-24 w-24 bg-white/10 rounded-[2.5rem] border border-white/10 flex items-center justify-center font-black text-4xl mb-6 backdrop-blur-xl shadow-2xl">
              {selectedTeacher.full_name?.[0]}
            </div>

            {isEditing ? (
              <div className="w-full space-y-2">
                <input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  placeholder="Enter Full Name"
                  className="text-xl font-black bg-white/10 rounded-[1.25rem] px-5 py-3 w-full outline-none border border-white/20 focus:bg-white/20 transition-all text-center"
                />
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Editing Faculty Name</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black tracking-tight">{selectedTeacher.full_name}</h2>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] pt-1 leading-none mt-2">Senior Faculty Member</p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-auto pt-10">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                >
                  Commit Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-full py-4 bg-white/5 text-white/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Discard
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20"
                >
                  <Edit3 className="h-4 w-4" /> Modify Profile
                </button>
                <button
                  onClick={() => handleDeleteTeacher(selectedTeacher.id)}
                  className="w-full py-4 bg-red-600/10 text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600/20 transition-all flex items-center justify-center gap-3"
                >
                  <Trash2 className="h-4 w-4" /> Remove Faculty
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 bg-white custom-scrollbar">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 transition-all hover:bg-slate-100/50">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                <DollarSign className="h-3 w-3" /> Monthly Stipend (PKR)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editForm.salary}
                  onChange={(e) => setEditForm({ ...editForm, salary: parseFloat(e.target.value) || 0 })}
                  className="w-full p-4 bg-white border border-slate-200 rounded-[1.25rem] outline-none font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              ) : (
                <p className="text-xl font-black text-slate-900 tracking-tight">PKR {(selectedTeacher.salary || 0).toLocaleString()}</p>
              )}
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex flex-col justify-center transition-all hover:bg-slate-100/50">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Tenure Since
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editForm.joined_at}
                  onChange={(e) => setEditForm({ ...editForm, joined_at: e.target.value })}
                  className="w-full p-4 bg-white border border-slate-200 rounded-[1.25rem] outline-none font-black text-slate-900 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                />
              ) : (
                <p className="text-sm font-black text-slate-900">
                  {selectedTeacher.joined_at
                    ? new Date(selectedTeacher.joined_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Institutional entry record missing'}
                </p>
              )}
            </div>
          </div>

          {/* Identity Hub */}
          <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
            <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Academic Portal Security
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                {!selectedTeacher.profile_id && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Public Username</label>
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      placeholder="e.g. professor.ali"
                      required
                      className="w-full bg-white border border-slate-200 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-indigo-500/5 font-black text-slate-900"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-2">Secure Passkey</label>
                  <input
                    type="text"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    placeholder={selectedTeacher.profile_id ? "Leave blank to keep existing password" : "Set Initial Password"}
                    required={!selectedTeacher.profile_id}
                    className="w-full bg-white border border-slate-200 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-indigo-500/5 font-black text-slate-900"
                  />
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-2">* Passwords must be at least 8 characters with institutional symbols.</p>
                </div>
              </div>
            ) : selectedTeacher.profile_id ? (
              <div className="flex items-center justify-between bg-white/60 p-6 rounded-3xl border border-white">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Faculty Identity ACTIVE</p>
                    <p className="text-sm font-black text-slate-900">Digital Access Token Verified</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            ) : (
              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 border-dashed">
                <p className="text-[11px] text-amber-800 font-bold leading-relaxed italic text-center">
                  "This faculty member currently lacks a digital ID. Initialize their profile to enable curriculum management and digital attendance."
                </p>
              </div>
            )}
          </div>

          {/* Assignments Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Academic Domain load
              </h3>
              {!isEditing && (
                <button
                  onClick={() => {
                    setIsAssignModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                >
                  New Assignment
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teacherAssignments.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Active Course load Detected</p>
                </div>
              ) : (
                teacherAssignments.map((assignment) => (
                  <div key={assignment.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleRemoveAssignment(assignment.id)}
                        className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs uppercase">
                          {assignment.subject?.name?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 tracking-tight truncate">{assignment.subject?.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{assignment.class ? `Grade ${assignment.class.grade} · ${assignment.class.section}` : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-slate-50 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest">Academy Hub</span>
                        <span className="px-2 py-1 bg-slate-50 rounded-md text-[8px] font-black text-slate-500 uppercase tracking-widest">{assignment.subject?.code || 'GEN-01'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Professional Roadmap / Lesson Plans */}
          <div className="space-y-6 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Professional Strategy & Lesson Plans
            </h3>
            
            {Object.keys(groupedTasks).length === 0 ? (
               <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Lesson Directives Issued Yet</p>
               </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedTasks).map(([className, classTasks]: [string, any]) => (
                  <div key={className} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[8px] font-black uppercase tracking-widest leading-none">
                        {className}
                      </div>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {classTasks.sort((a: any, b: any) => new Date(b.target_date).getTime() - new Date(a.target_date).getTime()).map((task: any) => (
                        <div key={task.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                          <div className="flex justify-between items-start mb-3">
                             <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-indigo-500" />
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                   {new Date(task.target_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </span>
                             </div>
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${task.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                {task.status}
                             </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                             "{task.task_description}"
                          </p>
                          <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                Assigned for: <span className="text-slate-900">{task.assignment?.subject?.name}</span>
                             </p>
                             <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                By {task.admin?.username}
                             </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
