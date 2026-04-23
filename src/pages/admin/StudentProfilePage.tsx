import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  GraduationCap, 
  Calendar, 
  ShieldCheck, 
  FileText,
  Clock,
  TrendingUp,
  MapPin,
  Phone,
  Briefcase
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { toast } from 'sonner';

const StudentProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'fees' | 'academic' | 'history'>('overview');

  useEffect(() => {
    if (id) fetchStudentData();
  }, [id]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [sData, fData, rData, hist] = await Promise.all([
        SchoolService.getStudentById(id!),
        SchoolService.getStudentFees(id!),
        SchoolService.getResults(id!),
        SchoolService.getStudentHistory(id!)
      ]);
      setStudent(sData);
      setFees(fData);
      setResults(rData);
      setHistory(hist);
    } catch (error) {
      toast.error('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retrieving Comprehensive Identity...</p>
    </div>
  );

  if (!student) return <div className="p-20 text-center text-slate-400 font-bold">Student not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Back Button & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 font-black text-xs hover:bg-slate-50 transition-all w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Registry
        </button>
        <div className="flex gap-2">
            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${student.is_locked ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                {student.is_locked ? 'Account Locked' : 'Verified Student'}
            </span>
        </div>
      </div>

      {/* Profile Cover Card */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="h-32 bg-slate-900 w-full relative">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        <div className="px-12 pb-12 -mt-12 relative z-10 flex flex-col md:flex-row items-end gap-8">
            <div className="h-40 w-40 bg-white rounded-[2.5rem] p-2 shadow-2xl shadow-slate-200 flex items-center justify-center border border-slate-100 overflow-hidden">
                <div className="h-full w-full bg-slate-50 rounded-[2rem] flex items-center justify-center text-5xl font-black text-slate-200 group-hover:scale-110 transition-transform">
                    {student.name[0]}
                </div>
            </div>
            <div className="flex-1 pb-2">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-1">{student.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-slate-400">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <GraduationCap className="h-4 w-4" />
                        Grade {student.classes?.grade || 'N/A'} - {student.classes?.section || 'N/A'}
                    </div>
                    <div className="h-1 w-1 bg-slate-200 rounded-full" />
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <Clock className="h-4 w-4" />
                        Roll: {student.roll_no}
                    </div>
                </div>
            </div>
            <div className="flex gap-3 pb-2">
                <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all active:scale-95">
                    Modify Profile
                </button>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 w-fit rounded-[1.8rem]">
        {[
          { id: 'overview', label: 'Identity Hub', icon: User },
          { id: 'fees', label: 'Financial Ledger', icon: CreditCard },
          { id: 'academic', label: 'Academic Merit', icon: GraduationCap },
          { id: 'history', label: 'Class History', icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-500">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-y-10 gap-x-12">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</p>
                                <p className="font-bold text-slate-900">{student.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Father's Name</p>
                                <p className="font-bold text-slate-900">{student.father_name || 'Not Recorded'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Student CNIC/B-Form</p>
                                <p className="font-mono font-bold text-slate-900 tracking-widest">{student.cnic || 'Unset'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Parent/Guardian CNIC</p>
                                <p className="font-mono font-bold text-slate-900 tracking-widest">{student.parent_cnic || 'Unset'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-8">
                <div className="bg-slate-900 p-10 rounded-[3rem] text-white overflow-hidden relative">
                    <h3 className="text-lg font-black tracking-tight mb-8 relative z-10">Quick Status</h3>
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Enrollment</span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase">Active</span>
                        </div>
                        <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Attendance</span>
                            </div>
                            <span className="text-[10px] font-black text-indigo-400 uppercase">92%</span>
                        </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-emerald-500/10 blur-[60px] rounded-full" />
                </div>
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">Billing History</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Complete financial audit log</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Outstanding</p>
                        <p className="text-xl font-black text-rose-600">
                            PKR {fees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + (f.amount_due - f.amount_paid), 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
                            <th className="px-10 py-6">Billing Period</th>
                            <th className="px-10 py-6">Amount Due</th>
                            <th className="px-10 py-6">Amount Paid</th>
                            <th className="px-10 py-6">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {fees.map((fee) => (
                            <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-10 py-6 font-black text-slate-900">{fee.month}</td>
                                <td className="px-10 py-6 font-black text-slate-600">PKR {fee.amount_due.toLocaleString()}</td>
                                <td className="px-10 py-6 font-black text-slate-600">PKR {fee.amount_paid.toLocaleString()}</td>
                                <td className="px-10 py-6">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                        {fee.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {fees.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs">No records found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
                <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10">Exam Performances</h3>
                <div className="space-y-6">
                    {results.map((r, i) => (
                        <div key={i} className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{r.exam_type}</p>
                                <h4 className="font-black text-slate-900 text-lg">PKR {r.marks_obtained} / {r.total_marks}</h4>
                            </div>
                            <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${r.status === 'pass' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {r.status}
                            </div>
                        </div>
                    ))}
                    {results.length === 0 && (
                        <div className="p-10 text-center text-slate-300 italic">No academic results recorded for this session</div>
                    )}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10">Promotion Timeline</h3>
            <div className="space-y-8">
                {history.map((h, i) => (
                    <div key={i} className="flex gap-8 relative">
                        {i !== history.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-100" />}
                        <div className="h-12 w-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0 z-10 shadow-lg shadow-emerald-500/20">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div className="pb-8">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(h.promoted_at).toLocaleDateString()}</p>
                            <h4 className="text-lg font-black text-slate-900">Promoted to Grade {h.class?.grade} - {h.class?.section}</h4>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Session: {h.academic_year?.year_label}</p>
                        </div>
                    </div>
                ))}
                {history.length === 0 && (
                    <div className="text-center text-slate-300 italic p-10">No class transition history found</div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfilePage;
