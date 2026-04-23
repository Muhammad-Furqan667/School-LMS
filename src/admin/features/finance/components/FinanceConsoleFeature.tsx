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
  Filter
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
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [issuing, setIssuing] = useState(false);
  
  // Bulk Fee Form
  const [targetClass, setTargetClass] = useState('');
  const [targetMonth, setTargetMonth] = useState(MONTHS[new Date().getMonth()]);
  const [feeItems, setFeeItems] = useState([{ category: 'Tuition Fee', amount: 1500 }]);

  // Filters
  const [filterClass, setFilterClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Unpaid' | 'Partial'>('All');

  useEffect(() => {
    fetchMetadata();
    fetchReport();
  }, []);

  const fetchMetadata = async () => {
    const [cls, years] = await Promise.all([
        SchoolService.getClasses(),
        SchoolService.getAcademicYears()
    ]);
    setClasses(cls);
    setAcademicYears(years);
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await SchoolService.getFinancialReport();
      setReportData(data);
    } catch (error) {
      toast.error('Failed to load financial records');
    } finally {
      setLoading(false);
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
      
      // If not found in state, try to fetch fresh
      if (!currentYear) {
        const freshYears = await SchoolService.getAcademicYears();
        currentYear = freshYears.find(y => y.is_current) || freshYears[0];
        if (currentYear) setAcademicYears(freshYears);
      }

      if (!currentYear) return toast.error('No sessions found. Please create an academic year first.');

      const students = await SchoolService.getStudents(targetClass);
      if (students.length === 0) return toast.error('No students found in this class');

      const totalDue = feeItems.reduce((acc, i) => acc + Number(i.amount), 0);
      
      await SchoolService.issueBulkFees(
        students.map(s => s.id),
        {
          month: targetMonth,
          amount_due: totalDue,
          items: feeItems,
          academic_year_id: currentYear.id
        }
      );

      toast.success(`Invoices generated for ${students.length} students`);
      fetchReport();
    } catch (error) {
      toast.error('Bulk generation failed');
    } finally {
      setIssuing(false);
    }
  };

  const filteredData = reportData.filter(record => {
    const student = record.student;
    const matchesClass = !filterClass || student?.class_id === filterClass;
    const matchesSearch = !searchTerm || 
      student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.roll_no?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    return matchesClass && matchesSearch && matchesStatus;
  });

  const handlePrint = (type: 'class' | 'defaulter' | 'school') => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-slate-900/20">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Intelligence Hub</h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-1">Institutional Billing & Revenue Control</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
            <div className="px-6 py-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Active Session</p>
              <div className="flex items-center gap-3">
                <p className="text-sm font-black text-slate-900">
                  {academicYears.find(y => y.is_current)?.year_label || 'Not Active'}
                </p>
                {!academicYears.find(y => y.is_current) && (
                  <button 
                    onClick={async () => {
                        await SchoolService.ensureCurrentSession();
                        fetchMetadata();
                        toast.success('Session Initialized');
                    }}
                    className="px-3 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-all"
                  >
                    Activate 2024-25
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -left-20 -top-20 h-64 w-64 bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Bulk Issuance Section */}
        <div className="xl:col-span-1">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 sticky top-8">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Bulk Class Invoice</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-8">Generate billing for entire sections</p>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Target Grade</label>
                  <select 
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 font-bold text-slate-900 appearance-none cursor-pointer"
                  >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>Grade {c.grade} - {c.section}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Billing Month</label>
                  <select 
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(e.target.value)}
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 font-bold text-slate-900 appearance-none cursor-pointer"
                  >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Charges</label>
                    <button onClick={addItem} className="text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                        <Plus className="h-3 w-3" /> Add Item
                    </button>
                  </div>
                  
                  {feeItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 animate-in slide-in-from-right-4">
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
                            <button onClick={() => removeItem(idx)} className="p-4 text-rose-400 hover:text-rose-600">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                  ))}
                  
                  <div className="p-6 bg-indigo-50 rounded-2xl flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Total Invoice</span>
                    <span className="text-lg font-black text-indigo-600">PKR {feeItems.reduce((acc, i) => acc + Number(i.amount || 0), 0).toLocaleString()}</span>
                  </div>
                </div>

                <button 
                  onClick={handleBulkIssue}
                  disabled={issuing}
                  className="w-full py-6 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {issuing ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Execute Bulk Issuance'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report / Defaulter Section */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
            {/* Filters */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/30 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <input 
                        placeholder="Search student..."
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
                        <option value="">All Grades</option>
                        {classes.map(c => <option key={c.id} value={c.id}>Grade {c.grade}</option>)}
                    </select>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
                    >
                        <option value="All">All Status</option>
                        <option value="Paid">Paid</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>
                </div>
            </div>

            {/* List Table */}
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left print-table">
                    <thead className="bg-slate-50/50">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-10 py-6">Student</th>
                            <th className="px-6 py-6 text-center">Grade</th>
                            <th className="px-6 py-6 text-center">Month</th>
                            <th className="px-6 py-6 text-right">Outstanding</th>
                            <th className="px-10 py-6 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-20 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">Compiling Records...</td></tr>
                        ) : filteredData.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center font-black text-slate-300 uppercase tracking-widest">No matching records</td></tr>
                        ) : (
                            filteredData.map(record => (
                                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-10 py-6">
                                        <p className="font-black text-slate-900">{record.student?.name}</p>
                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{record.student?.roll_no}</p>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className="text-xs font-black text-slate-500">
                                            {record.student?.classes?.grade}-{record.student?.classes?.section}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">{record.month}</span>
                                    </td>
                                    <td className="px-6 py-6 text-right font-mono font-black text-slate-900">
                                        PKR {(record.amount_due - record.amount_paid).toLocaleString()}
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            record.status === 'Paid' 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                : 'bg-rose-50 text-rose-600 border-rose-100'
                                        }`}>
                                            {record.status === 'Paid' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                                            {record.status}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Print Area Footer */}
            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center no-print">
                <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Showing {filteredData.length} records
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => handlePrint('class')}
                        className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <Printer className="h-4 w-4" />
                        Print Class List
                    </button>
                    <button 
                        onClick={() => handlePrint('defaulter')}
                        className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
                    >
                        <AlertCircle className="h-4 w-4" />
                        Print Defaulters
                    </button>
                </div>
            </div>
        </div>
        </div>
      </div>

      {/* Print-only CSS style block */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .bg-white { border: none !important; shadow: none !important; }
          .print-table { width: 100% !important; border-collapse: collapse !important; }
          .print-table th, .print-table td { border: 1px solid #e2e8f0 !important; padding: 12px !important; }
          @page { margin: 2cm; }
        }
      `}</style>
    </div>
  );
};
