import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  DollarSign, 
  Trash2, 
  X,
  Plus,
  Search,
  Edit3,
  Award,
  Calendar,
  BookOpen,
  GraduationCap,
  Briefcase,
  ChevronRight,
  Clock
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const TeacherConsole: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // Detail panel
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    salary: 0,
    joined_at: ''
  });

  // Hire form
  const [hireForm, setHireForm] = useState({
    full_name: '',
    salary: 0,
  });

  // Assignment form
  const [assignForm, setAssignForm] = useState({
    subject_id: '',
    class_id: ''
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [teacherData, classData, subjectData] = await Promise.all([
        SchoolService.getTeachers(),
        SchoolService.getClasses(),
        SchoolService.getSubjects()
      ]);
      setTeachers(teacherData || []);
      setClasses(classData || []);
      setSubjects(subjectData || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openTeacherDetail = (teacher: any) => {
    setSelectedTeacher(teacher);
    setEditForm({
      full_name: teacher.full_name,
      salary: teacher.salary || 0,
      joined_at: teacher.joined_at ? teacher.joined_at.split('T')[0] : (teacher.created_at ? teacher.created_at.split('T')[0] : '')
    });
    setIsEditing(false);
  };

  const closeDetail = () => {
    setSelectedTeacher(null);
    setIsEditing(false);
  };

  const filteredTeachers = teachers.filter(t =>
    t.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireForm.full_name.trim()) return;
    try {
      setLoading(true);
      await SchoolService.upsertTeacher({
        full_name: hireForm.full_name,
        salary: hireForm.salary
      });
      toast.success('Teacher hired successfully');
      setIsHireModalOpen(false);
      setHireForm({ full_name: '', salary: 0 });
      fetchAll();
    } catch {
      toast.error('Hiring failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedTeacher) return;
    try {
      await SchoolService.updateTeacher(selectedTeacher.id, {
        full_name: editForm.full_name,
        salary: editForm.salary,
        joined_at: editForm.joined_at ? new Date(editForm.joined_at).toISOString() : null
      });
      toast.success('Teacher updated');
      setIsEditing(false);
      fetchAll();
      // Update selected teacher locally
      setSelectedTeacher((prev: any) => ({
        ...prev,
        full_name: editForm.full_name,
        salary: editForm.salary,
        joined_at: editForm.joined_at
      }));
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to remove this teacher and all their assignments?')) return;
    try {
      await SchoolService.deleteTeacher(id);
      toast.success('Teacher removed');
      if (selectedTeacher?.id === id) closeDetail();
      fetchAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !assignForm.subject_id || !assignForm.class_id) return;
    try {
      await SchoolService.createTeacherAssignment(selectedTeacher.id, assignForm.subject_id, assignForm.class_id);
      toast.success('Subject assigned');
      setIsAssignModalOpen(false);
      setAssignForm({ subject_id: '', class_id: '' });
      fetchAll();
      // Refresh detail
      const updated = await SchoolService.getTeachers();
      const refreshed = updated.find((t: any) => t.id === selectedTeacher.id);
      if (refreshed) setSelectedTeacher(refreshed);
    } catch {
      toast.error('Assignment failed');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await SchoolService.deleteTeacherAssignment(assignmentId);
      toast.success('Assignment removed');
      fetchAll();
      // Refresh the selected teacher
      const updated = await SchoolService.getTeachers();
      const refreshed = updated.find((t: any) => t.id === selectedTeacher.id);
      if (refreshed) setSelectedTeacher(refreshed);
    } catch {
      toast.error('Remove failed');
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Faculty Hub</h1>
          <p className="text-slate-500 font-medium mt-2 md:text-lg">
            {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} actively managing curriculum.
          </p>
        </div>
        <button 
          onClick={() => setIsHireModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all w-full lg:w-auto"
        >
          <UserPlus className="h-4 w-4" />
          Onboard New Faculty
        </button>
      </div>

      {/* Modern Search */}
      <div className="relative group max-w-2xl px-1">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter faculty by name..."
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-3xl shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Teacher Cards Grid */}
        <div className={`grid gap-4 md:gap-6 transition-all ${selectedTeacher ? 'grid-cols-1 lg:grid-cols-2 xl:flex-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full'}`}>
          {filteredTeachers.map((teacher) => (
            <div 
              key={teacher.id} 
              onClick={() => openTeacherDetail(teacher)}
              className={`bg-white rounded-[2.5rem] border p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group cursor-pointer relative overflow-hidden ${
                selectedTeacher?.id === teacher.id ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-xl' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-8">
                <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-[1.25rem] flex items-center justify-center font-black text-slate-300 text-2xl group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300">
                  {teacher.full_name[0]}
                </div>
                <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 group-hover:text-emerald-500 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">{teacher.full_name}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                  {teacher.joined_at 
                    ? `Active since ${new Date(teacher.joined_at).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' })}` 
                    : 'New Faculty Entry'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-50 mb-6">
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 leading-none">Net Salary</p>
                  <p className="font-black text-slate-900 text-sm">
                    PKR {(teacher.salary || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1.5 leading-none">Curriculum</p>
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3 w-3 text-amber-500" />
                    <span className="font-black text-slate-900 text-sm">{teacher.teacher_assignments?.length || 0} Subjects</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(teacher.teacher_assignments || []).slice(0, 2).map((a: any) => (
                  <span key={a.id} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black border border-indigo-100">
                    {a.subject?.name || 'Subject'}
                  </span>
                ))}
                {(teacher.teacher_assignments?.length || 0) > 2 && (
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black">
                    +{teacher.teacher_assignments.length - 2} More
                  </span>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="col-span-full p-20 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Syncing Academy Records...</p>
            </div>
          )}

          {!loading && filteredTeachers.length === 0 && (
            <div className="col-span-full p-20 text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                 <Briefcase className="h-10 w-10 text-slate-200" />
              </div>
              <p className="text-slate-400 font-black mb-1 italic">No faculty records detected</p>
            </div>
          )}
        </div>

        {/* Teacher Detail Slide-Over (Responsive Overlay) */}
        {selectedTeacher && (
          <div className="fixed inset-0 z-[100] xl:relative xl:z-auto xl:w-[460px] bg-white xl:rounded-[2.5rem] border-0 xl:border border-slate-200 shadow-2xl xl:shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-right-5 duration-300 shrink-0">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative flex flex-col items-center text-center">
              <div className="absolute right-6 top-6">
                <button onClick={closeDetail} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="h-24 w-24 bg-white/10 rounded-[2.5rem] border border-white/10 flex items-center justify-center font-black text-4xl mb-6 backdrop-blur-xl shadow-2xl">
                {selectedTeacher.full_name[0]}
              </div>
              
              {isEditing ? (
                <div className="w-full space-y-2">
                  <input 
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    placeholder="Enter Full Name"
                    className="text-xl font-black bg-white/10 rounded-[1.25rem] px-5 py-3 w-full outline-none border border-white/20 focus:bg-white/20 transition-all text-center"
                  />
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Editing Faculty Name</p>
                </div>
              ) : (
                <div className="space-y-1">
                   <h2 className="text-2xl font-black tracking-tight">{selectedTeacher.full_name}</h2>
                   <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] pt-1">Senior Faculty Member</p>
                </div>
              )}
            </div>

            {/* Profile Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Context Actions */}
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSaveEdit}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Commit Changes
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          full_name: selectedTeacher.full_name,
                          salary: selectedTeacher.salary || 0,
                          joined_at: selectedTeacher.joined_at ? selectedTeacher.joined_at.split('T')[0] : ''
                        });
                      }}
                      className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Discard
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                    >
                      <Edit3 className="h-4 w-4" /> Modify Profile
                    </button>
                    <button 
                      onClick={() => handleDeleteTeacher(selectedTeacher.id)}
                      className="py-4 px-5 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all border border-red-100"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Data Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                    <DollarSign className="h-3 w-3" /> Agreement Salary (PKR)
                  </label>
                  {isEditing ? (
                    <input 
                      type="number"
                      value={editForm.salary}
                      onChange={(e) => setEditForm({...editForm, salary: parseFloat(e.target.value) || 0})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-[1.25rem] outline-none font-black text-slate-900 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                  ) : (
                    <p className="text-xl font-black text-slate-900 tracking-tight">PKR {(selectedTeacher.salary || 0).toLocaleString()}</p>
                  )}
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Registration Date
                  </label>
                  {isEditing ? (
                    <input 
                      type="date"
                      value={editForm.joined_at}
                      onChange={(e) => setEditForm({...editForm, joined_at: e.target.value})}
                      className="w-full p-4 bg-white border border-slate-200 rounded-[1.25rem] outline-none font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                  ) : (
                    <p className="text-sm font-black text-slate-900">
                      {selectedTeacher.joined_at 
                        ? new Date(selectedTeacher.joined_at).toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' })
                        : 'Institutional Entry Record Missing'}
                    </p>
                  )}
                </div>
              </div>

              {/* Assignments Hub */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-slate-400" />
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Curriculum</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setAssignForm({ subject_id: '', class_id: '' });
                      setIsAssignModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-[1rem] text-[10px] font-black uppercase tracking-widest border border-emerald-100 transition-all"
                  >
                    Add Assignment
                  </button>
                </div>

                {(selectedTeacher.teacher_assignments || []).length === 0 ? (
                  <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 p-12 text-center group transition-colors">
                    <GraduationCap className="h-10 w-10 mx-auto mb-4 text-slate-200 group-hover:text-emerald-300 transition-colors" />
                    <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">No Subjects Found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(selectedTeacher.teacher_assignments || []).map((a: any) => (
                      <div key={a.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between group hover:border-emerald-200 transition-all hover:shadow-lg hover:shadow-emerald-500/5">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                              {a.subject?.name?.[0]}
                           </div>
                           <div>
                            <p className="text-sm font-black text-slate-900 mb-0.5">{a.subject?.name || 'Technical Elective'}</p>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                              {a.class ? `Class ${a.class.grade}-${a.class.section}` : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleRemoveAssignment(a.id)}
                          className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================== PREMIUM OVERLAYS ==================== */}

      {/* Hire Modal */}
      {isHireModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsHireModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
              {/* Sidebar Info */}
              <div className="md:w-56 bg-slate-900 p-10 text-white flex flex-col justify-between border-r border-white/5">
                <div className="h-14 w-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <UserPlus className="h-7 w-7 text-white" />
                </div>
                <div className="mt-10 md:mt-0">
                  <h2 className="text-2xl font-black mb-1">Contract Entry</h2>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">New Faculty Onboarding</p>
                </div>
              </div>
              
              {/* Form Content */}
              <form onSubmit={handleHire} className="flex-1 p-8 md:p-12 space-y-8">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Authentication & Payroll</h3>
                   <button type="button" onClick={() => setIsHireModalOpen(false)} className="p-2 hover:bg-slate-50 rounded-lg">
                      <X className="h-5 w-5 text-slate-300" />
                   </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Legal Full Name</label>
                    <input 
                      required
                      value={hireForm.full_name}
                      onChange={(e) => setHireForm({...hireForm, full_name: e.target.value})}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-black text-slate-900" 
                      placeholder="e.g. Professor Ali" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Agreed Salary (Monthly)</label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-black">PKR</span>
                      <input 
                        type="number"
                        required
                        value={hireForm.salary}
                        onChange={(e) => setHireForm({...hireForm, salary: parseFloat(e.target.value) || 0})}
                        className="w-full pl-16 pr-5 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-black text-slate-900" 
                        placeholder="0" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                   <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-6 bg-emerald-600 text-white font-black rounded-[2rem] shadow-2xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 hover:bg-emerald-700"
                  >
                    {loading ? 'Initializing Secure Entry...' : 'Confirm Faculty Registration'}
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* Assignment Modal (Similar structure) */}
      {isAssignModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAssignModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 md:p-12 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-10">
              <div className="flex gap-4">
                 <div className="h-14 w-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                   <BookOpen className="h-7 w-7" />
                 </div>
                 <div>
                   <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">Curriculum</h2>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Assigning to {selectedTeacher.full_name}</p>
                 </div>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl">
                <X className="h-5 w-5 text-slate-300" />
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Domain Specialization</label>
                <div className="relative group">
                  <select 
                    required
                    value={assignForm.subject_id}
                    onChange={(e) => setAssignForm({...assignForm, subject_id: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none font-black text-slate-900"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none rotate-90" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Academy Grade</label>
                <div className="relative group">
                  <select 
                    required
                    value={assignForm.class_id}
                    onChange={(e) => setAssignForm({...assignForm, class_id: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none font-black text-slate-900"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>Grade {c.grade} - {c.section}</option>)}
                  </select>
                  <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none rotate-90" />
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] shadow-xl hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Verify & Commit Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
