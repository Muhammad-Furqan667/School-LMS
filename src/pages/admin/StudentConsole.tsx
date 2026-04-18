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
  Calendar,
  CreditCard,
  ArrowLeft,
  Filter,
  Clock,
  BookOpen,
  User,
  ShieldAlert,
  Download,
  TrendingUp,
  Award,
  History,
  XCircle
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const StudentConsole: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showOnlyDues, setShowOnlyDues] = useState(false);
  
  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'academics'>('profile');
  const [academicResults, setAcademicResults] = useState<any[]>([]);
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
    id: '' as string | undefined
  });

  const [feeForm, setFeeForm] = useState({
    month: 'January',
    amount_due: '1200',
    amount_paid: '0',
    status: 'unpaid'
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [studentData, classData, subjectData] = await Promise.all([
        SchoolService.getStudents(),
        SchoolService.getClasses(),
        SchoolService.getSubjects()
      ]);
      setStudents(studentData || []);
      setClasses(classData || []);
      setSubjects(subjectData || []);
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
    setAcademicResults([]);
    setActiveTab('profile');
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.father_name && s.father_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesClass = !filterClass || s.class_id === filterClass;
    const matchesDues = !showOnlyDues || s.is_locked; // Assuming matches dues if is_locked is true (common logic in this app)
    
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
      const { data: resultsData, error } = await supabase
        .from('results')
        .select('*, subjects(*), academic_years(*)')
        .eq('student_id', selectedStudent.id);
      
      if (error) throw error;
      
      const requiredSubjects = await SchoolService.getSubjectsByGrade(selectedStudent.classes?.grade);
      
      // Construct current year's bucket
      const currentYearResults = requiredSubjects.map(sub => {
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
    try {
      setLoading(true);
      const payload: any = {
        name: studentForm.name,
        roll_no: studentForm.roll_no,
        class_id: studentForm.class_id || null,
        father_name: studentForm.father_name,
        cnic: studentForm.cnic
      };
      if (studentForm.id) payload.id = studentForm.id;
      
      await SchoolService.upsertStudent(payload);
      toast.success(studentForm.id ? 'Student updated' : 'Student enrolled');
      setIsEditModalOpen(false);
      setStudentForm({ name: '', roll_no: '', class_id: '', father_name: '', cnic: '', id: undefined });
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
        id: student.id
      });
    } else {
      setStudentForm({ name: '', roll_no: '', class_id: '', father_name: '', cnic: '', id: undefined });
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
        student_id: selectedStudent.id,
        month: feeForm.month,
        amount_due: parseFloat(feeForm.amount_due),
        amount_paid: parseFloat(feeForm.amount_paid),
        status: feeForm.status,
        year_id: years?.id
      });
      toast.success('Fee record saved');
      setIsFeeModalOpen(false);
      // Refresh fees
      const fees = await SchoolService.getStudentFees(selectedStudent.id);
      setStudentFees(fees || []);
      fetchAll();
    } catch {
      toast.error('Fee operation failed');
    }
  };

  const handleMarkPaid = async (fee: any) => {
    try {
      await SchoolService.updateFeeStatus(fee.id, 'paid', fee.amount_due);
      toast.success('Fee marked as paid');
      const fees = await SchoolService.getStudentFees(selectedStudent.id);
      setStudentFees(fees || []);
    } catch {
      toast.error('Failed to update fee');
    }
  };

  const handleToggleLock = async (student: any) => {
    try {
      await SchoolService.toggleStudentWarning(student.id, !student.is_locked);
      toast.success(student.is_locked ? 'Student unlocked' : 'Student locked');
      fetchAll();
      if (selectedStudent?.id === student.id) {
        setSelectedStudent({ ...student, is_locked: !student.is_locked });
      }
    } catch {
      toast.error('Toggle failed');
    }
  };

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
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
            className={`flex items-center justify-center gap-2 px-6 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all border ${
              showOnlyDues 
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
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          student.is_locked 
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

        {/* Improved Student Sidebar Details */}
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] scale-100 xl:relative xl:z-auto xl:w-[460px] bg-white xl:rounded-[2.5rem] border-0 xl:border border-slate-200 shadow-2xl xl:shadow-sm overflow-hidden flex flex-col animate-in slide-in-from-right-5 lg:slide-in-from-bottom-5 duration-300">
            {/* Mobile Header Collapse */}
            <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative flex flex-col items-center text-center">
              <div className="absolute right-6 top-6">
                <button onClick={closeDetail} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="h-24 w-24 bg-white/10 rounded-[2.5rem] border border-white/10 flex items-center justify-center font-black text-4xl mb-6 backdrop-blur-xl shadow-2xl transition-transform hover:scale-105">
                {selectedStudent.name[0]}
              </div>
              
              <h2 className="text-2xl font-black tracking-tight">{selectedStudent.name}</h2>
              <div className="flex items-center gap-3 mt-3">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/20">
                  {selectedStudent.roll_no}
                </span>
                <span className="text-white/20">·</span>
                <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                  {selectedStudent.classes ? `Grade: ${selectedStudent.classes.grade}` : 'General Registry'}
                </span>
              </div>

              {/* Tabs */}
              <div className="flex w-full px-10 border-b border-slate-100/50 pt-6">
                 <button 
                   onClick={() => setActiveTab('profile')}
                   className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/30 hover:text-white/60'}`}
                 >
                   Profile
                 </button>
                 <button 
                   onClick={() => setActiveTab('academics')}
                   className={`flex-1 py-4 text-xs font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === 'academics' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-white/30 hover:text-white/60'}`}
                 >
                   Academics
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {activeTab === 'profile' ? (
                <>
                  {/* ... Profile content ... */}
                  <div className="flex gap-3">
                    <Link 
                      to={`/admin/students/${selectedStudent.id}/fee-card`}
                      className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
                    >
                      <BookOpen className="h-4 w-4" /> Open Fee Card
                    </Link>
                  </div>

                  {/* Profile Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-none">
                        <User className="h-3 w-3" /> Father Name
                      </p>
                      <p className="text-sm font-black text-slate-800 truncate">{selectedStudent.father_name || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 leading-none">
                        <TrendingUp className="h-3 w-3" /> Academics & Upgrade
                      </p>
                      <button 
                        onClick={async () => {
                          try {
                            const result = await SchoolService.upgradeStudentGrade(selectedStudent.id, selectedStudent.classes.grade, classes);
                            if (result === 'graduated') {
                               toast.success('Congratulations!', { description: `${selectedStudent.name} has graduated from the Academy.` });
                               setSelectedStudent({...selectedStudent, classes: { grade: 'GRADUATED' }});
                            } else {
                               toast.success('Promotion Successful', { description: `Upgraded to Grade ${parseInt(selectedStudent.classes.grade) + 1}` });
                               fetchAll();
                               closeDetail();
                            }
                          } catch (err: any) {
                            toast.error(err.message, { duration: 5000 });
                          }
                        }}
                        className="w-full py-2 bg-emerald-100 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        {selectedStudent.classes?.grade === '10' ? 'Graduate Student' : `Upgrade to Grade ${parseInt(selectedStudent.classes?.grade) + 1}`}
                      </button>
                      <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase text-center">* All courses must be passed to upgrade.</p>
                    </div>
                  </div>

                  {/* Security Section */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <ShieldAlert className="h-3 w-3" /> Identification
                       </p>
                       <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/50">
                             <div>
                                <p className="text-xs font-black text-slate-900">CNIC / Bay-Form</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{selectedStudent.cnic || 'Missing Data'}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleToggleWarning(selectedStudent.id, !selectedStudent.is_locked)}
                        className={`flex-1 py-4 px-4 rounded-2xl border font-black text-[11px] uppercase tracking-widest transition-all ${
                          selectedStudent.is_locked 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                            : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                        }`}
                      >
                        {selectedStudent.is_locked ? 'Unlock Account' : 'Flag Account'}
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(selectedStudent)}
                        className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all border border-slate-900"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Ledger</h3>
                      <button 
                        onClick={() => {
                          setFeeForm({ month: 'January', amount_due: '1200', amount_paid: '0', status: 'unpaid' });
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
                          <div key={fee.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between group hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all">
                            <div>
                              <p className="text-sm font-black text-slate-900 mb-1">{fee.month}</p>
                              <div className="flex items-center gap-2">
                                 <p className="text-xs font-black text-slate-400">PKR {Number(fee.amount_due).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                fee.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : fee.status === 'partial' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {fee.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-8">
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
                                   <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                                      result.status === 'pass' ? 'bg-emerald-50 text-emerald-600' :
                                      result.status === 'fail' ? 'bg-rose-50 text-rose-600' :
                                      'bg-slate-50 text-slate-400'
                                   }`}>
                                      {result.subjects?.name?.[0]}
                                   </div>
                                   <p className="text-sm font-black text-slate-900">{result.subjects?.name}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                      result.status === 'pass' ? 'bg-emerald-100 text-emerald-700' :
                                      result.status === 'fail' ? 'bg-rose-100 text-rose-700' :
                                      'bg-slate-100 text-slate-500'
                                }`}>
                                   {result.status}
                                </div>
                             </div>

                             <div className="flex gap-2">
                                <button 
                                   onClick={() => handleUpdateResult(result, 'pass')}
                                   className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                      result.status === 'pass' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                                   }`}
                                >
                                   <CheckCircle2 className="h-3 w-3" /> Pass
                                </button>
                                <button 
                                   onClick={() => handleUpdateResult(result, 'fail')}
                                   className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                      result.status === 'fail' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
                                   }`}
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
                         {(academicResults as any).past.map((session: any) => {
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
                                    {session.results.map((r: any) => (
                                      <div key={r.id} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                        <div className="flex items-center gap-3">
                                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                                            r.status === 'pass' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                          }`}>
                                            {r.subjects?.name?.[0]}
                                          </div>
                                          <div>
                                            <p className="text-xs font-black text-slate-900">{r.subjects?.name}</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.exam_type || 'Annual Examination'}</p>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-black text-slate-900">{r.marks_obtained}/{r.total_marks || 100}</p>
                                          <div className={`text-[8px] font-black uppercase tracking-[0.1em] mt-0.5 ${
                                            r.status === 'pass' ? 'text-emerald-500' : 'text-rose-500'
                                          }`}>
                                            {r.status}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="pt-2 flex items-center justify-between px-2">
                                     <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                          <div key={s} className={`h-1.5 w-6 rounded-full ${s <= (percentage/20) ? 'bg-indigo-500' : 'bg-slate-200'}`} />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Student Name</label>
                  <input 
                    required
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold" 
                    placeholder="e.g. Abdullah Khan"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Father / Guardian Name</label>
                  <input 
                    required
                    value={studentForm.father_name}
                    onChange={(e) => setStudentForm({...studentForm, father_name: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold" 
                    placeholder="e.g. Javed Khan"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">CNIC / Bay-Form Number</label>
                  <input 
                    required
                    value={studentForm.cnic}
                    onChange={(e) => setStudentForm({...studentForm, cnic: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold" 
                    placeholder="e.g. 35201-XXXXXXXX-X"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Assigned Grade</label>
                  <div className="relative group">
                    <select 
                      required
                      value={studentForm.class_id}
                      onChange={(e) => setStudentForm({...studentForm, class_id: e.target.value})}
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
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Registration Roll No</label>
                  <input 
                    required
                    value={studentForm.roll_no}
                    onChange={(e) => setStudentForm({...studentForm, roll_no: e.target.value})}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-bold" 
                    placeholder="e.g. REG-2024-001"
                  />
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
                  onChange={(e) => setFeeForm({...feeForm, month: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none font-bold"
                >
                  {months.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Amount Payable</label>
                  <input 
                    type="number"
                    required
                    value={feeForm.amount_due}
                    onChange={(e) => setFeeForm({...feeForm, amount_due: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Initial Payment</label>
                  <input 
                    type="number"
                    value={feeForm.amount_paid}
                    onChange={(e) => setFeeForm({...feeForm, amount_paid: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black"
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
                      onClick={() => setFeeForm({...feeForm, status: s})}
                      className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        feeForm.status === s 
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
