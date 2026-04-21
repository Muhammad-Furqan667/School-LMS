import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Edit3,
  DollarSign,
  Trash2,
  CheckCircle2,
  X,
  Plus,
  ChevronRight,
  CreditCard,
  Filter,
  User,
  ShieldAlert,
  TrendingUp,
  History,
  XCircle
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const StudentConsole: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showOnlyDues, setShowOnlyDues] = useState(false);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'academics'>('profile');
  const [academicResults, setAcademicResults] = useState<any>({ current: [], past: [] });
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);

  // Detail slide-over
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: '',
    roll_no: '',
    class_id: '',
    father_name: '',
    cnic: '',
    parent_cnic: '',
    password: '',
    id: undefined as string | undefined
  });

  const [feeForm, setFeeForm] = useState({
    id: undefined as string | undefined,
    month: 'January',
    amount_paid: '0',
    status: 'Unpaid',
    items: [{ category: 'Monthly Fee', amount: 1200 }]
  });

  const totalFeeAmount = feeForm.items.reduce((acc, item) => acc + (parseFloat(item.amount.toString()) || 0), 0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [studentData, classData] = await Promise.all([
        SchoolService.getStudents(),
        SchoolService.getClasses()
      ]);
      setStudents(studentData || []);
      setClasses(classData || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openStudentDetail = async (student: any) => {
    setSelectedStudent(student);
    setLoadingFees(true);
    try {
      const fees = await SchoolService.getStudentFees(student.id);
      setStudentFees(fees || []);
    } catch {
      setStudentFees([]);
    } finally {
      setLoadingFees(false);
    }
  };

  const closeDetail = () => {
    setSelectedStudent(null);
    setStudentFees([]);
    setAcademicResults({ current: [], past: [] });
    setActiveTab('profile');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.father_name && s.father_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = !filterClass || s.class_id === filterClass;
    
    // Check if any fee is Not Paid
    const hasDues = (s.fees || []).some((f: any) => 
      f.status?.toLowerCase() === 'unpaid' || 
      f.status?.toLowerCase() === 'partial'
    );
    
    const matchesDues = !showOnlyDues || hasDues;

    return matchesSearch && matchesClass && matchesDues;
  });

  useEffect(() => {
    if (selectedStudent && activeTab === 'academics') {
      fetchAcademicResults();
    }
  }, [selectedStudent, activeTab]);

  const fetchAcademicResults = async () => {
    if (!selectedStudent) return;
    try {
      // Fetch results with related subjects and academic years
      const { data: resultsData, error } = await (supabase as any)
        .from('results')
        .select('*, subjects(*), academic_years(*)')
        .eq('student_id', selectedStudent.id);

      if (error) throw error;

      const requiredSubjects = await SchoolService.getSubjectsByGrade(selectedStudent.classes?.grade);

      // Construct current year's bucket
      const currentYearResults = requiredSubjects.map((sub: any) => {
        const existing = (resultsData || []).find((r: any) => r.subject_id === sub.id && r.academic_year_id === selectedStudent.classes?.academic_year_id);
        return existing || {
          subject_id: sub.id,
          student_id: selectedStudent.id,
          status: 'pending',
          subjects: sub,
          is_current: true
        };
      });

      // Group past results by Academic Year
      const pastMap: Record<string, any> = {};
      (resultsData || []).forEach((r: any) => {
        if (r.academic_year_id !== selectedStudent.classes?.academic_year_id) {
          const yearLabel = r.academic_years?.year_label || 'Archives';
          if (!pastMap[yearLabel]) {
            pastMap[yearLabel] = {
              label: yearLabel,
              results: [],
              totalMarks: 0,
              obtainedMarks: 0
            };
          }
          pastMap[yearLabel].results.push(r);
          pastMap[yearLabel].totalMarks += (r.total_marks || 100);
          pastMap[yearLabel].obtainedMarks += (r.marks_obtained || 0);
        }
      });

      setAcademicResults({
        current: currentYearResults,
        past: Object.values(pastMap).sort((a: any, b: any) => b.label.localeCompare(a.label))
      });
    } catch (error) {
      toast.error('Failed to load academic records');
    }
  };

  const handleUpdateResult = async (result: any, status: 'pass' | 'fail' | 'pending') => {
    try {
      const payload = {
        student_id: selectedStudent.id,
        subject_id: result.subject_id,
        status,
        academic_year_id: selectedStudent.classes?.academic_year_id
      };
      if (result.id) (payload as any).id = result.id;

      await SchoolService.upsertResult(payload);
      toast.success(`Marked as ${status.toUpperCase()}`);
      fetchAcademicResults();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleUpsertStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[A-Za-z\s]+$/.test(studentForm.name)) {
      toast.error("Student name must only contain letters.");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(studentForm.father_name)) {
      toast.error("Parent name must only contain letters.");
      return;
    }
    if (!/^\d{13}$/.test(studentForm.cnic)) {
      toast.error("Student CNIC must be exactly 13 digits.");
      return;
    }
    if (!/^\d{13}$/.test(studentForm.parent_cnic)) {
      toast.error("Parent CNIC must be exactly 13 digits.");
      return;
    }
    if (!studentForm.id && !studentForm.password) {
      toast.error("Please provide an initial portal password.");
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        name: studentForm.name,
        roll_no: studentForm.roll_no,
        class_id: studentForm.class_id || null,
        father_name: studentForm.father_name,
        cnic: studentForm.cnic,
        parent_cnic: studentForm.parent_cnic
      };
      if (studentForm.id) payload.id = studentForm.id;

      const res = await SchoolService.upsertStudent(payload);

      if (studentForm.password) {
        await SchoolService.upsertStudentAccess(res.id, res.roll_no, studentForm.password);
      }

      toast.success(studentForm.id ? 'Student updated' : 'Student enrolled & portal initialized');
      setIsEditModalOpen(false);
      setStudentForm({ name: '', roll_no: '', class_id: '', father_name: '', cnic: '', parent_cnic: '', password: '', id: undefined });
      fetchAll();
    } catch (error) {
      toast.error('Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditModal = (student?: any) => {
    // Mutual exclusivity: Close detail when opening edit
    closeDetail();
    if (student) {
      setStudentForm({
        name: student.name,
        roll_no: student.roll_no,
        class_id: student.class_id || '',
        father_name: student.father_name || '',
        cnic: student.cnic || '',
        parent_cnic: student.parent_cnic || '',
        password: '', // Blank password implies no change unless typed
        id: student.id
      });
    } else {
      setStudentForm({ name: '', roll_no: '', class_id: '', father_name: '', cnic: '', parent_cnic: '', password: '', id: undefined });
    }
    setIsEditModalOpen(true);
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    try {
      await SchoolService.deleteStudent(id);
      toast.success('Student removed');
      if (selectedStudent?.id === id) closeDetail();
      fetchAll();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleIssueFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const { data: years } = await supabase.from('academic_years').select('id').eq('is_current', true).single();
      await SchoolService.upsertFee({
        id: feeForm.id,
        student_id: selectedStudent.id,
        month: feeForm.month,
        amount_due: totalFeeAmount,
        amount_paid: parseFloat(feeForm.amount_paid),
        status: feeForm.status,
        breakdown: feeForm.items,
        year_id: years?.id
      });
      toast.success(feeForm.id ? 'Fee record updated' : 'Fee record saved');
      setIsFeeModalOpen(false);
      // Refresh fees
      const fees = await SchoolService.getStudentFees(selectedStudent.id);
      setStudentFees(fees || []);
      fetchAll();
    } catch {
      toast.error('Fee operation failed');
    }
  };



  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const grades = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Registry</h1>
          <p className="text-slate-500 font-medium mt-1">
            {students.length} students enrolled · {students.filter(s => s.is_locked).length} with pending dues
          </p>
        </div>
        <button
          onClick={() => handleOpenEditModal()}
          className="flex items-center justify-center gap-2 px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all w-full lg:w-auto"
        >
          <Plus className="h-4 w-4" />
          Enroll New Student
        </button>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, roll, or father's name..."
            className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-medium"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full sm:w-auto pl-11 pr-10 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] outline-none appearance-none font-bold text-sm text-slate-600 min-w-[160px] cursor-pointer hover:bg-white transition-colors"
            >
              <option value="">All Grades</option>
              {classes.filter(c => grades.includes(parseInt(c.grade))).map(c => (
                <option key={c.id} value={c.id}>Grade {c.grade} - {c.section}</option>
              ))}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none rotate-90" />
          </div>

          <button
            onClick={() => setShowOnlyDues(!showOnlyDues)}
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all border ${showOnlyDues
                ? 'bg-red-50 text-red-600 border-red-200 shadow-lg shadow-red-500/10'
                : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
              }`}
          >
            <ShieldAlert className={`h-4 w-4 ${showOnlyDues ? 'animate-pulse' : ''}`} />
            {showOnlyDues ? 'Viewing Dues Only' : 'Filter Dues'}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Student Table Container */}
        <div className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all ${selectedStudent ? 'xl:flex-1' : 'w-full'}`}>
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead className="bg-[#f8fafc] border-b border-slate-100">
                <tr>
                  <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Student / Father</th>
                  <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Grade</th>
                  <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Roll No</th>
                  <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className={`hover:bg-slate-50/80 transition-all group cursor-pointer ${selectedStudent?.id === student.id ? 'bg-emerald-50/50' : ''}`}
                    onClick={() => openStudentDetail(student)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-lg shadow-sm group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300">
                          {student.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-base leading-tight group-hover:text-emerald-700 transition-colors">{student.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">S/O: {student.father_name || 'Not Recorded'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-4 py-1.5 bg-slate-100 rounded-xl text-xs font-black text-slate-600">
                        {student.classes ? student.classes.grade : 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col items-center">
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${student.is_locked
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                          {student.is_locked ? 'Fees Pending' : 'Verified'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                        {student.roll_no}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-all">
                        <button
                          onClick={() => handleOpenEditModal(student)}
                          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all"
                          title="Edit Profile"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all"
                          title="Expel Student"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="p-20 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Registry...</p>
            </div>
          )}

          {!loading && filteredStudents.length === 0 && (
            <div className="p-20 text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold mb-1">No students found</p>
              <p className="text-xs text-slate-300 font-medium">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>

        {/* Improved Student Sidebar Details -> NOW A CENTERED MODAL */}
        {selectedStudent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={closeDetail} />
            <div className="relative bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 h-[90vh] md:h-auto md:max-h-[85vh]">
              {/* Profile Header / Sidebar */}
              <div className="w-full md:w-80 bg-slate-900 p-8 text-white flex flex-col relative overflow-y-auto min-h-[300px] md:min-h-0">
                <button onClick={closeDetail} className="absolute right-6 top-6 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                  <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col items-center text-center mt-6">
                  <div className="h-24 w-24 bg-white/10 rounded-[2.5rem] border border-white/10 flex items-center justify-center font-black text-4xl mb-6 backdrop-blur-xl shadow-2xl">
                    {selectedStudent?.name?.[0] || '?'}
                  </div>

                  <h2 className="text-2xl font-black tracking-tight">{selectedStudent.name}</h2>
                  <div className="flex flex-wrap justify-center items-center gap-3 mt-3">
                    <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/20">
                      {selectedStudent.roll_no}
                    </span>
                    <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                      Grade: {selectedStudent.classes?.grade || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto pt-10">
                   <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    Profile Hub
                  </button>
                  <button
                    onClick={() => setActiveTab('academics')}
                    className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'academics' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    Academics
                  </button>
                </div>
              </div>
              {/* Modal Content Area */}
              <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 bg-white custom-scrollbar">
                {activeTab === 'profile' ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        to={`/admin/students/${selectedStudent.id}/fee-card`}
                        className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                      >
                        <CreditCard className="h-4 w-4" /> Management Fee Card
                      </Link>
                      <button
                        onClick={() => handleOpenEditModal(selectedStudent)}
                        className="px-8 py-5 bg-slate-100 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                      >
                        <Edit3 className="h-4 w-4" /> Edit Profile
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <User className="h-3 w-3" /> Father / Guardian
                        </p>
                        <p className="text-base font-black text-slate-900">{selectedStudent.father_name || 'Not Provided'}</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <TrendingUp className="h-3 w-3" /> Grade Sync
                        </p>
                        <button
                          onClick={async () => {
                            try {
                              const result = await SchoolService.upgradeStudentGrade(selectedStudent.id, selectedStudent.classes.grade, classes);
                              if (result === 'graduated') {
                                toast.success('Congratulations!', { description: `${selectedStudent.name} has graduated.` });
                                setSelectedStudent({ ...selectedStudent, classes: { grade: 'GRADUATED' } });
                              } else {
                                toast.success('Promotion Successful');
                                fetchAll();
                                closeDetail();
                              }
                            } catch (err: any) {
                              toast.error(err.message);
                            }
                          }}
                          className="w-full py-2 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all"
                        >
                          Promote to Grade {selectedStudent.classes?.grade ? parseInt(selectedStudent.classes.grade) + 1 : 'N/A'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                      <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" /> Verification & Access
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200/60 transition-all hover:border-indigo-200">
                           <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">National Identity CNIC</p>
                              <p className="text-sm font-black text-slate-900 tracking-widest">{selectedStudent.cnic || '---'}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Parent Identity</p>
                              <p className="text-sm font-black text-slate-900 tracking-widest">{selectedStudent.parent_cnic || '---'}</p>
                           </div>
                        </div>

                        <div className={`p-6 rounded-2xl border ${selectedStudent.parents?.profile_id ? 'bg-emerald-50/30 border-emerald-100' : 'bg-amber-50/30 border-amber-100'}`}>
                           <div className="flex items-center justify-between mb-4">
                              <p className="text-xs font-black text-slate-900">Portal Security Authentication</p>
                              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedStudent.parents?.profile_id ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                                 {selectedStudent.parents?.profile_id ? 'ACTIVE SESSIONS' : 'ACCESS PENDING'}
                              </span>
                           </div>
                           {!selectedStudent.parents?.profile_id ? (
                              <button 
                                onClick={async () => {
                                   toast.promise(SchoolService.createStudentAccess(selectedStudent.id, selectedStudent.roll_no, 'Password123!'), {
                                      loading: 'Generating Identity...',
                                      success: 'Portal initialized successfully!',
                                      error: 'Failed to create access'
                                   });
                                   fetchAll();
                                   closeDetail();
                                }}
                                className="w-full py-4 bg-amber-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/20"
                              >
                                Initialize Student Portal
                              </button>
                           ) : (
                              <div className="flex items-center justify-between bg-white/60 p-4 rounded-xl border border-white">
                                 <p className="text-[10px] font-bold text-slate-400">USERNAME: <span className="text-slate-900">{selectedStudent.roll_no}</span></p>
                                 <button onClick={() => toast.info('Request Admin for local password reset')} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Security Key Settings</button>
                              </div>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Ledger</h3>
                        <button
                          onClick={() => {
                            setFeeForm({ id: undefined, month: 'January', amount_paid: '0', status: 'Unpaid', items: [{ category: 'Monthly Fee', amount: 1200 }] });
                            setIsFeeModalOpen(true);
                          }}
                          className="px-4 py-2 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Issue New Bill
                        </button>
                      </div>

                      {loadingFees ? (
                        <div className="py-10 flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                      ) : studentFees.length === 0 ? (
                        <div className="rounded-[2rem] border-2 border-dashed border-slate-100 p-10 text-center">
                          <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="h-7 w-7 text-slate-200" />
                          </div>
                          <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">No Active Ledger</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {studentFees.slice(0, 4).map((fee) => (
                            <div 
                              key={fee.id} 
                              onClick={() => {
                                  setFeeForm({
                                    id: fee.id,
                                    month: fee.month,
                                    amount_paid: fee.amount_paid.toString(),
                                    status: fee.status || 'Unpaid',
                                    items: fee.breakdown && fee.breakdown.length > 0 ? fee.breakdown : [{ category: 'Monthly Fee', amount: Number(fee.amount_due) }]
                                  });
                                  setIsFeeModalOpen(true);
                                }}
                              className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between group hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer"
                            >
                              <div>
                                <p className="text-sm font-black text-slate-900 mb-1">{fee.month}</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-xs font-black text-slate-400">PKR {Number(fee.amount_due).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${fee.status?.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600' : fee.status?.toLowerCase() === 'partial' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                  {fee.status}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {/* Current Year Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Session (Grade {selectedStudent.classes?.grade})</h4>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <div className="space-y-3">
                        {(academicResults as any).current?.map((result: any) => (
                          <div key={result.subject_id} className="bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${result.status === 'pass' ? 'bg-emerald-50 text-emerald-600' :
                                    result.status === 'fail' ? 'bg-rose-50 text-rose-600' :
                                      'bg-slate-50 text-slate-400'
                                  }`}>
                                  {result.subjects?.name?.[0]}
                                </div>
                                <p className="text-sm font-black text-slate-900">{result.subjects?.name}</p>
                              </div>
                              <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${result.status === 'pass' ? 'bg-emerald-100 text-emerald-700' :
                                  result.status === 'fail' ? 'bg-rose-100 text-rose-700' :
                                    'bg-slate-100 text-slate-500'
                                }`}>
                                {result.status}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateResult(result, 'pass')}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${result.status === 'pass' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                              >
                                <CheckCircle2 className="h-3 w-3" /> Pass
                              </button>
                              <button
                                onClick={() => handleUpdateResult(result, 'fail')}
                                className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${result.status === 'fail' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600'}`}
                              >
                                <XCircle className="h-3 w-3" /> Fail
                              </button>
                            </div>
                          </div>
                        ))}
                        {(academicResults as any).current?.length === 0 && (
                          <div className="py-12 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No current courses</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Historical Session Section */}
                    {(academicResults as any).past?.length > 0 && (
                      <div className="space-y-6 pt-8 border-t border-slate-100">
                        <div className="flex items-center gap-2 px-2">
                          <History className="h-4 w-4 text-slate-400" />
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Academic Transcript Archives</h4>
                        </div>

                        <div className="space-y-6">
                          {(academicResults as any).past?.map((session: any) => {
                            const percentage = session.totalMarks > 0 ? Math.round((session.obtainedMarks / session.totalMarks) * 100) : 0;
                            return (
                              <div key={session.label} className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                                {/* Session Header */}
                                <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                                  <div>
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">{session.label}</p>
                                    <h5 className="text-sm font-black text-slate-900">Historical Performance</h5>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xl font-black text-slate-900 leading-none">{percentage}%</p>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Aggregate</p>
                                  </div>
                                </div>

                                {/* Subject List */}
                                <div className="p-6 space-y-4">
                                  <div className="grid grid-cols-1 gap-3">
                                    {session.results?.map((r: any) => (
                                      <div key={r.id} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                        <div className="flex items-center gap-3">
                                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${r.status === 'pass' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                            {r.subjects?.name?.[0]}
                                          </div>
                                          <div>
                                            <p className="text-xs font-black text-slate-900">{r.subjects?.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.exam_type || 'Annual Examination'}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-black text-slate-900">{r.marks_obtained}/{r.total_marks || 100}</p>
                                          <div className={`text-[8px] font-black uppercase tracking-[0.1em] mt-0.5 ${r.status === 'pass' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {r.status}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="pt-2 flex items-center justify-between px-2">
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <div key={s} className={`h-1.5 w-6 rounded-full ${s <= (percentage / 20) ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                                      ))}
                                    </div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                      Grade Standing: <span className="text-indigo-600">{percentage >= 80 ? 'Excellent' : percentage >= 60 ? 'Satisfactory' : 'Requires Improv.'}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ==================== PREMIUM MODALS ==================== */}

      {/* Enhanced Registration Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl p-6 sm:p-12 animate-in zoom-in-95 duration-300 my-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-10">
              <div className="flex gap-5">
                <div className="h-16 w-16 bg-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{studentForm.id ? 'Modify Profile' : 'Student Enrollment'}</h2>
                  <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">Secure Data Collection</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-4 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all self-end sm:self-auto">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpsertStudent} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                {/* Left Column: Student Details */}
                <div className="space-y-8">
                  <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">Student Information</h3>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Student Name</label>
                    <input
                      required
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold"
                      placeholder="e.g. Abdullah Khan"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Grade</label>
                    <div className="relative group">
                      <select
                        required
                        value={studentForm.class_id}
                        onChange={(e) => setStudentForm({ ...studentForm, class_id: e.target.value })}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold cursor-pointer"
                      >
                        <option value="">Select Grade</option>
                        {classes.filter(c => grades.includes(parseInt(c.grade))).map(c => (
                          <option key={c.id} value={c.id}>Grade {c.grade} - {c.section}</option>
                        ))}
                      </select>
                      <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none rotate-90" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Registration Roll No</label>
                    <input
                      required
                      value={studentForm.roll_no}
                      onChange={(e) => setStudentForm({ ...studentForm, roll_no: e.target.value })}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold"
                      placeholder="e.g. REG-2024-001"
                    />
                  </div>
                </div>

                {/* Right Column: Parent Details */}
                <div className="space-y-8">
                  <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">Parent / Guardian Portal</h3>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Father / Guardian Name</label>
                    <input
                      required
                      value={studentForm.father_name}
                      onChange={(e) => setStudentForm({ ...studentForm, father_name: e.target.value })}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold"
                      placeholder="e.g. Javed Khan"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Parent's CNIC (13 Digits)</label>
                    <input
                      required
                      value={studentForm.parent_cnic}
                      onChange={(e) => setStudentForm({ ...studentForm, parent_cnic: e.target.value })}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold tracking-widest"
                      placeholder="e.g. 3520212345678"
                      maxLength={13}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Student's CNIC / B-Form (13 Digits)</label>
                    <input
                      required
                      value={studentForm.cnic}
                      onChange={(e) => setStudentForm({ ...studentForm, cnic: e.target.value })}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold tracking-widest"
                      placeholder="1234512345123"
                      maxLength={13}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">{studentForm.id ? "Change Parent Password (Optional)" : "Set Parent Password"}</label>
                    <input
                      required={!studentForm.id}
                      type="text"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold"
                      placeholder={studentForm.id ? "Leave blank to keep existing password" : "e.g. Password123"}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl hover:bg-emerald-600 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? 'Processing Registry...' : studentForm.id ? 'Save Profile Changes' : 'Confirm New Enrollment'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-10 py-6 bg-slate-100 text-slate-500 font-black rounded-3xl hover:bg-slate-200 transition-all"
                >
                  Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fee Issue Modal remains similar but styled more robust */}
      {isFeeModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsFeeModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-10">
              <div className="flex gap-4">
                <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">Fee Bill</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedStudent.name}</p>
                </div>
              </div>
              <button onClick={() => setIsFeeModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-xl">
                <X className="h-5 w-5 text-slate-300" />
              </button>
            </div>

            <form onSubmit={handleIssueFee} className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Billing Cycle</label>
                <select
                  value={feeForm.month}
                  onChange={(e) => setFeeForm({ ...feeForm, month: e.target.value })}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none font-bold"
                >
                  {months.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-4 max-h-[250px] overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="flex justify-between items-center mb-2 px-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Bill Breakdown</label>
                  <button 
                    type="button" 
                    onClick={() => setFeeForm({ ...feeForm, items: [...feeForm.items, { category: '', amount: 0 }] })}
                    className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1 hover:underline"
                  >
                    <Plus className="h-3 w-3" /> Add Item
                  </button>
                </div>
                {feeForm.items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                    <input
                      placeholder="Category (e.g. Lab Fee)"
                      value={item.category}
                      onChange={(e) => {
                        const newItems = [...feeForm.items];
                        newItems[idx].category = e.target.value;
                        setFeeForm({ ...feeForm, items: newItems });
                      }}
                      className="flex-1 p-3 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold"
                    />
                    <input
                      type="number"
                      placeholder="Amount"
                      value={item.amount}
                      onChange={(e) => {
                        const newItems = [...feeForm.items];
                        newItems[idx].amount = parseFloat(e.target.value) || 0;
                        setFeeForm({ ...feeForm, items: newItems });
                      }}
                      className="w-24 p-3 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold"
                    />
                    {feeForm.items.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setFeeForm({ ...feeForm, items: feeForm.items.filter((_, i) => i !== idx) })}
                        className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-2xl p-4 flex flex-col justify-center">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Total Payable</p>
                  <p className="text-xl font-black text-white">Rs. {totalFeeAmount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Initial Payment</label>
                  <input
                    type="number"
                    value={feeForm.amount_paid}
                    onChange={(e) => setFeeForm({ ...feeForm, amount_paid: e.target.value })}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Payment Status</label>
                <div className="flex gap-2">
                  {['unpaid', 'partial', 'paid'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFeeForm({ ...feeForm, status: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() })}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${feeForm.status?.toLowerCase() === s.toLowerCase()
                          ? s === 'paid' ? 'bg-emerald-600 text-white' : s === 'partial' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                          : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-slate-900 text-white font-black rounded-[1.5rem] shadow-xl hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
              >
                Notify & Save Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
