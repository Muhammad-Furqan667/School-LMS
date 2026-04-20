import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Calendar, 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Clock,
  MapPin
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { toast } from 'sonner';

const StudentFeeCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchStudentData(id);
  }, [id]);

  const fetchStudentData = async (studentId: string) => {
    try {
      setLoading(true);
      // Fetch student info
      const studentData = await SchoolService.getStudents();
      const target = studentData.find((s: any) => s.id === studentId);
      
      if (!target) {
        toast.error('Student not found');
        navigate('/admin/students');
        return;
      }
      
      setStudent(target);
      
      // Fetch fee history
      const feeData = await SchoolService.getStudentFees(studentId);
      setFees(feeData || []);
    } catch (error) {
      toast.error('Failed to load fee card data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generating Fee Ledger...</p>
      </div>
    );
  }

  const totalDue = fees.reduce((sum, f) => sum + Number(f.amount_due), 0);
  const totalPaid = fees.reduce((sum, f) => sum + Number(f.amount_paid), 0);
  const pending = totalDue - totalPaid;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header - Non-Printable */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <Link 
            to="/admin/students"
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors group"
          >
            <div className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:bg-slate-50 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </div>
            Back to Registry
          </Link>
          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              <Printer className="h-4 w-4" />
              Print Card
            </button>
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-50 transition-all shadow-sm">
              <Download className="h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* The Actual Fee Card Container */}
        <div id="fee-card-printable" className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden print:border-0 print:shadow-none print:m-0">
          {/* Top Banner */}
          <div className="p-8 md:p-12 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="h-32 w-32 bg-white/10 rounded-[2.5rem] border border-white/10 flex items-center justify-center font-black text-5xl backdrop-blur-xl">
                 {student.name[0]}
               </div>
               <div>
                 <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-3">Official Institutional Record</p>
                 <h1 className="text-4xl font-black tracking-tight mb-4">{student.name}</h1>
                 <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-bold text-white/60 uppercase tracking-widest">
                   <span className="flex items-center gap-2"><User className="h-4 w-4" /> S/O {student.father_name || 'Not Listed'}</span>
                   <span className="text-white/20">|</span>
                   <span className="flex items-center gap-2">Roll No: {student.roll_no}</span>
                 </div>
               </div>
            </div>
            <div className="hidden md:block text-right">
              <div className="h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center ml-auto mb-4 shadow-2xl shadow-emerald-500/20">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-white/40">Verified On</p>
              <p className="text-lg font-black">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-[#f8fafc] border-b border-slate-100">
            <div className="p-8 text-center group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 leading-none">Total Receivable</p>
              <h4 className="text-2xl font-black text-slate-900">PKR {totalDue.toLocaleString()}</h4>
              <div className="mt-4 h-1 w-12 bg-slate-200 mx-auto rounded-full" />
            </div>
            <div className="p-8 text-center group">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 leading-none">Total Recovered</p>
              <h4 className="text-2xl font-black text-emerald-600">PKR {totalPaid.toLocaleString()}</h4>
              <div className="mt-4 h-1 w-12 bg-emerald-500/30 mx-auto rounded-full" />
            </div>
            <div className="p-8 text-center group">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-3 leading-none">Total Arrears</p>
              <h4 className="text-2xl font-black text-rose-600">PKR {pending.toLocaleString()}</h4>
              <div className="mt-4 h-1 w-12 bg-rose-500/30 mx-auto rounded-full" />
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {/* Student & Parent Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                   <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                     <Clock className="h-4 w-4" />
                   </div>
                   Profile Metadata
                 </h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-slate-50">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrollment Status</span>
                       <span className="text-sm font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-lg">Active Institutional</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-slate-50">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Grade</span>
                       <span className="text-sm font-black text-slate-900">{student.classes ? `Grade ${student.classes.grade}` : 'General Entry'}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-slate-50">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Father's Identification</span>
                       <span className="text-sm font-black text-slate-900">{student.cnic || 'Not Submitted'}</span>
                    </div>
                 </div>
              </section>

              <section>
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    Financial Health
                 </h3>
                 <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="flex items-center gap-4 mb-6">
                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${pending > 0 ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30'}`}>
                         {pending > 0 ? <AlertCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                       </div>
                       <div>
                         <p className="text-xs font-black text-slate-900">{pending > 0 ? 'Account Flagged' : 'Account Good Standing'}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Automated Risk Audit</p>
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      "This student {pending > 0 ? `has pending dues of PKR ${pending.toLocaleString()}. Payment is expected immediately to avoid institutional lock.` : 'is current with all institutional fee obligations as of today.'}"
                    </p>
                 </div>
              </section>
            </div>

            {/* Detailed Ledger History */}
            <section>
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
                  <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  Full Ledger Records
               </h3>
               <div className="overflow-hidden border border-slate-100 rounded-[2.5rem]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#f8fafc] border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Cycle</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bill</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Date</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Recovery</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {fees.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                            <p className="text-sm font-black text-slate-300 uppercase tracking-widest italic">No Institutional Ledger Entries</p>
                          </td>
                        </tr>
                      ) : (
                        fees.map((f, i) => (
                          <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5 font-black text-slate-900">{f.month}</td>
                            <td className="px-8 py-5 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">PKR {Number(f.amount_due).toLocaleString()}</td>
                             <td className="px-8 py-5 text-xs text-slate-400 font-bold uppercase tracking-widest">
                                {f.status?.toLowerCase() === 'paid' ? (
                                   <span className="flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                                     <Clock className="h-3.5 w-3.5" />
                                     {new Date(f.created_at).toLocaleDateString()}
                                   </span>
                                ) : 'Pending Collection'}
                             </td>
                             <td className="px-8 py-5 text-center">
                                <div className={`mx-auto w-fit px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                  f.status?.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                                  f.status?.toLowerCase() === 'partial' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                  {f.status}
                                </div>
                             </td>
                            <td className="px-8 py-5 text-right font-black text-slate-900">
                               PKR {Number(f.amount_paid).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-[#f8fafc] border-t-2 border-slate-100">
                      <tr>
                        <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Total</td>
                        <td className="px-8 py-6 font-black text-slate-400 italic">PKR {totalDue.toLocaleString()}</td>
                        <td className="px-8 py-6"></td>
                        <td className="px-8 py-6"></td>
                        <td className="px-8 py-6 text-right text-lg font-black text-emerald-600">PKR {totalPaid.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
               </div>
            </section>

            {/* Footer Institutional Stamps */}
            <div className="pt-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-end gap-10">
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center">
                     <TrendingUp className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Institutional Health Index</h5>
                    <p className="text-xl font-black text-slate-900">{totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 100}% Recovery Rate</p>
                  </div>
               </div>
               
               <div className="w-full md:w-64 space-y-4">
                  <div className="h-[2px] w-full bg-slate-100" />
                  <div className="flex justify-between items-center pr-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Registrar</p>
                     <div className="h-10 w-10 border-2 border-emerald-500/20 rounded-full flex items-center justify-center rotate-12">
                        <MapPin className="h-5 w-5 text-emerald-500/40" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Print Terms - Printable Only */}
        <div className="hidden print:block mt-10 text-[10px] text-slate-400 font-medium italic border-t border-slate-100 pt-6">
           This document is a computer-generated institutional record and does not require a physical signature for digital verification.
           EDU-LINK SMS v4.2 · Internal ID: {id}
        </div>
      </div>
    </div>
  );
};

export default StudentFeeCard;
