import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Printer, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const FinanceConsoleFeature: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState(false);
  
  // Drill-down State
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [loadingFees, setLoadingFees] = useState(false);

  // Bulk Fee Form
  const [targetClass, setTargetClass] = useState('');
  const [targetMonth, setTargetMonth] = useState(MONTHS[new Date().getMonth()]);
  const [feeItems, setFeeItems] = useState([{ category: 'Tuition Fee', amount: 1500 }]);

  // Filters
  const [filterClass, setFilterClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Financial Stats
  const [allFees, setAllFees] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalExpected: 0,
    totalCollected: 0,
    totalRemaining: 0,
    monthlyExpected: 0,
    monthlyCollected: 0,
    monthlyRemaining: 0
  });

  useEffect(() => {
    fetchMetadata();
    fetchStudents();
    fetchAllFees();
  }, [filterClass]);

  const fetchAllFees = async () => {
    try {
      const data = await SchoolService.getFinancialReport();
      setAllFees(data || []);
      calculateStats(data);
    } catch (error) {
      console.error('Failed to load financial report', error);
    }
  };

  const calculateStats = (fees: any[]) => {
    const currentMonth = MONTHS[new Date().getMonth()];
    
    // Filter by class if applicable
    const filteredFees = filterClass 
      ? fees.filter(f => f.student?.class_id === filterClass)
      : fees;

    const totalExpected = filteredFees.reduce((acc, f) => acc + (f.amount_due || 0), 0);
    const totalCollected = filteredFees.reduce((acc, f) => acc + (f.amount_paid || 0), 0);
    
    const monthlyFees = filteredFees.filter(f => f.month === currentMonth);
    const monthlyExpected = monthlyFees.reduce((acc, f) => acc + (f.amount_due || 0), 0);
    const monthlyCollected = monthlyFees.reduce((acc, f) => acc + (f.amount_paid || 0), 0);

    setStats({
      totalExpected,
      totalCollected,
      totalRemaining: totalExpected - totalCollected,
      monthlyExpected,
      monthlyCollected,
      monthlyRemaining: monthlyExpected - monthlyCollected
    });
  };

  const fetchMetadata = async () => {
    const [cls, years] = await Promise.all([
        SchoolService.getClasses(),
        SchoolService.getAcademicYears()
    ]);
    setClasses(cls);
    setAcademicYears(years);
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await SchoolService.getStudents(filterClass || undefined);
      setStudents(data);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = async (student: any) => {
    setSelectedStudent(student);
    setLoadingFees(true);
    try {
      const fees = await SchoolService.getStudentFees(student.id);
      setStudentFees(fees || []);
    } catch (error) {
      toast.error('Failed to load fee history');
    } finally {
      setLoadingFees(false);
    }
  };

  const handleUpdateFeeStatus = async (feeId: string, status: string, amount: number) => {
    try {
      const fee = studentFees.find(f => f.id === feeId);
      let finalAmount = amount;
      
      if (status === 'Paid') finalAmount = fee?.amount_due || amount;
      if (status === 'Unpaid') finalAmount = 0;

      await SchoolService.updateFeeStatus(feeId, status, finalAmount);
      toast.success('Fee record updated');
      
      // Refresh all data
      if (selectedStudent) {
        const updatedFees = await SchoolService.getStudentFees(selectedStudent.id);
        setStudentFees(updatedFees || []);
      }
      fetchAllFees();
      fetchStudents(); 
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const addItem = () => setFeeItems([...feeItems, { category: '', amount: 0 }]);
  const removeItem = (index: number) => setFeeItems(feeItems.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...feeItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setFeeItems(newItems);
  };

  const handleBulkIssue = async () => {
    if (!targetClass) return toast.error('Select a class');
    if (feeItems.some(i => !i.category || i.amount <= 0)) return toast.error('Valid category and amount required');

    try {
      setIssuing(true);
      
      let currentYear = academicYears.find(y => y.is_current);
      if (!currentYear) {
        const freshYears = await SchoolService.getAcademicYears();
        currentYear = freshYears.find(y => y.is_current) || freshYears[0];
        if (currentYear) setAcademicYears(freshYears);
      }

      if (!currentYear) return toast.error('No active session found.');

      const targetStudents = await SchoolService.getStudents(targetClass);
      if (targetStudents.length === 0) return toast.error('No students found in this class');

      const totalDue = feeItems.reduce((acc, i) => acc + Number(i.amount), 0);
      
      await SchoolService.issueBulkFees(
        targetStudents.map(s => s.id),
        {
          month: targetMonth,
          amount_due: totalDue,
          items: feeItems,
          academic_year_id: currentYear.id
        }
      );

      toast.success(`Invoices generated for ${targetStudents.length} students`);
      fetchStudents();
    } catch (error) {
      toast.error('Bulk generation failed');
    } finally {
      setIssuing(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = !searchTerm || 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_no?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm overflow-hidden relative no-print">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-slate-900/20">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Finance Intelligence</h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Management & Recovery Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
            <div className="px-6 py-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Session</p>
              <p className="text-sm font-black text-slate-900">
                {academicYears.find(y => y.is_current)?.year_label || 'Not Active'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cumulative Revenue</p>
            <h3 className="text-3xl font-black mb-6">PKR {stats.totalCollected.toLocaleString()}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Target: PKR {stats.totalExpected.toLocaleString()}</span>
                <span>{stats.totalExpected > 0 ? Math.round((stats.totalCollected / stats.totalExpected) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${stats.totalExpected > 0 ? (stats.totalCollected / stats.totalExpected) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest pt-2">
                Remaining: PKR {stats.totalRemaining.toLocaleString()}
              </p>
            </div>
          </div>
          <CreditCard className="absolute -right-8 -bottom-8 h-32 w-32 text-white/5 rotate-12 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm group">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{MONTHS[new Date().getMonth()]} Insights</p>
          <h3 className="text-3xl font-black text-slate-900 mb-6">PKR {stats.monthlyCollected.toLocaleString()}</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span>Target: PKR {stats.monthlyExpected.toLocaleString()}</span>
              <span>{stats.monthlyExpected > 0 ? Math.round((stats.monthlyCollected / stats.monthlyExpected) * 100) : 0}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-1000" 
                style={{ width: `${stats.monthlyExpected > 0 ? (stats.monthlyCollected / stats.monthlyExpected) * 100 : 0}%` }}
              />
            </div>
            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest pt-2">
              Outstanding: PKR {stats.monthlyRemaining.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100 flex flex-col justify-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-10 w-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Recovery Success</p>
              <p className="text-2xl font-black text-slate-900">
                {stats.totalExpected > 0 ? Math.round((stats.totalCollected / stats.totalExpected) * 100) : 100}%
              </p>
            </div>
          </div>
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
            "Institutional financial health is currently stable based on session targets."
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sidebar: Bulk Issuance */}
        <div className="xl:col-span-1 no-print">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 sticky top-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Issue Bulk Fees</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">Generate monthly invoices for a class</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Class</label>
                  <select 
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>Grade {c.grade} - {c.section}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Month</label>
                  <select 
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 appearance-none cursor-pointer"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Categories</label>
                    <button onClick={addItem} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                        <Plus className="h-3 w-3" /> Add
                    </button>
                  </div>
                  
                  {feeItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                        <input 
                            value={item.category}
                            onChange={(e) => updateItem(idx, 'category', e.target.value)}
                            placeholder="Category"
                            className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold"
                        />
                        <input 
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                            placeholder="Amount"
                            className="w-24 p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-bold"
                        />
                        {feeItems.length > 1 && (
                            <button onClick={() => removeItem(idx)} className="p-4 text-rose-400">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={handleBulkIssue}
                  disabled={issuing}
                  className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {issuing ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Confirm & Issue'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Section: Student List or Drill-down */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
            {/* Context Switcher / Breadcrumb */}
            {selectedStudent && (
              <div className="p-8 border-b border-slate-100 bg-indigo-50/50 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:text-indigo-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to All Students
                </button>
                <div className="text-right">
                  <p className="font-black text-slate-900">{selectedStudent.name}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Roll No: {selectedStudent.roll_no}</p>
                </div>
              </div>
            )}

            {/* List Mode Filters */}
            {!selectedStudent && (
              <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <input 
                          placeholder="Search student name..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none text-sm font-bold"
                      />
                  </div>
                  <div className="flex gap-2">
                      <select 
                          value={filterClass}
                          onChange={(e) => setFilterClass(e.target.value)}
                          className="px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
                      >
                          <option value="">All Classes</option>
                          {classes.map(c => <option key={c.id} value={c.id}>Grade {c.grade}</option>)}
                      </select>
                  </div>
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {!selectedStudent ? (
                /* Student Summary List */
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="px-10 py-6">Student Name</th>
                      <th className="px-6 py-6">Roll No</th>
                      <th className="px-6 py-6">Class</th>
                      <th className="px-6 py-6">Balance</th>
                      <th className="px-6 py-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr><td colSpan={5} className="p-20 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">Loading Students...</td></tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr><td colSpan={5} className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">No students found</td></tr>
                    ) : (
                      filteredStudents.map(s => {
                        const studentBalance = allFees
                          .filter(f => f.student_id === s.id)
                          .reduce((acc, f) => acc + (f.amount_due - (f.amount_paid || 0)), 0);

                        return (
                          <tr 
                            key={s.id} 
                            onClick={() => handleStudentClick(s)}
                            className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                          >
                            <td className="px-10 py-6 font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{s.name}</td>
                            <td className="px-6 py-6 text-xs font-bold text-slate-500">{s.roll_no}</td>
                            <td className="px-6 py-6 text-xs font-black text-slate-400 uppercase">Grade {s.classes?.grade}</td>
                            <td className="px-6 py-6">
                              <span className={`text-xs font-black ${studentBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                PKR {studentBalance.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-6 text-right">
                              <ChevronRight className="h-5 w-5 text-slate-200 group-hover:text-indigo-400 inline transition-colors" />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              ) : (
                /* Student Fee Drill-down */
                <div className="p-10 space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Financial History</h2>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Itemized ledger for current session</p>
                    </div>
                  </div>

                  {loadingFees ? (
                    <div className="p-20 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">Analyzing Ledger...</div>
                  ) : studentFees.length === 0 ? (
                    <div className="p-20 text-center font-black text-slate-300 uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-[2.5rem]">No Fee Records for this student</div>
                  ) : (
                    <div className="grid gap-6">
                      {studentFees.map(fee => (
                        <div key={fee.id} className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 hover:border-indigo-200 transition-all group">
                          <div className="flex flex-col lg:flex-row justify-between gap-6">
                            <div className="space-y-4 flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{fee.month}</span>
                                <span className="text-[9px] font-black text-indigo-400 bg-white px-3 py-1 rounded-lg border border-slate-200 uppercase tracking-widest">{fee.academic_years?.year_label}</span>
                              </div>
                              
                              <div className="flex flex-wrap gap-2">
                                {(fee.items || fee.breakdown || []).map((item: any, idx: number) => (
                                  <div key={idx} className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.category}</p>
                                    <p className="text-xs font-black text-slate-900">PKR {item.amount.toLocaleString()}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-8 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                              <div className="text-center px-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Bill</p>
                                <p className="text-lg font-black text-slate-900">PKR {fee.amount_due.toLocaleString()}</p>
                              </div>
                              
                              <div className="h-10 w-[2px] bg-slate-100" />

                              <div className="space-y-3 min-w-[150px]">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Payment Control</p>
                                <div className="flex gap-2">
                                  <select 
                                    value={fee.status}
                                    onChange={(e) => handleUpdateFeeStatus(fee.id, e.target.value, e.target.value === 'Paid' ? fee.amount_due : fee.amount_paid)}
                                    className={`w-full px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border appearance-none cursor-pointer outline-none transition-all ${
                                      fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                      fee.status === 'Partial' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}
                                  >
                                    <option value="Unpaid">Unpaid</option>
                                    <option value="Partial">Partial</option>
                                    <option value="Paid">Paid</option>
                                  </select>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Paid:</span>
                                    <span className="text-emerald-600">PKR {fee.amount_paid?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400">Balance:</span>
                                    <span className="text-rose-600">PKR {(fee.amount_due - (fee.amount_paid || 0)).toLocaleString()}</span>
                                  </div>
                                </div>

                                {fee.status === 'Partial' && (
                                  <div className="relative">
                                    <input 
                                      type="number"
                                      defaultValue={fee.amount_paid}
                                      onBlur={(e) => handleUpdateFeeStatus(fee.id, 'Partial', Number(e.target.value))}
                                      className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-center outline-none focus:border-indigo-300 transition-all"
                                      placeholder="Update Paid Amount"
                                    />
                                    <p className="text-[8px] text-slate-400 font-bold uppercase mt-1 text-center">Press Tab/Click out to Save</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
