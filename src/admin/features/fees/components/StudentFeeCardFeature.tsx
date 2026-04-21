import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Clock, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useFeeHistory } from '../hooks/useFeeHistory';
import { FeeCardHeader } from './FeeCardHeader';
import { FeeStatsBar } from './FeeStatsBar';
import { FeeLedgerTable } from './FeeLedgerTable';

export const StudentFeeCardFeature: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { student, fees, loading, stats } = useFeeHistory(id);

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

  if (!student) return null;

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
          <FeeCardHeader student={student} />
          <FeeStatsBar totalDue={stats.totalDue} totalPaid={stats.totalPaid} pending={stats.pending} />

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
                       <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${stats.pending > 0 ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30'}`}>
                         {stats.pending > 0 ? <AlertCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                       </div>
                       <div>
                         <p className="text-xs font-black text-slate-900">{stats.pending > 0 ? 'Account Flagged' : 'Account Good Standing'}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Automated Risk Audit</p>
                       </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed italic">
                      "This student {stats.pending > 0 ? `has pending dues of PKR ${stats.pending.toLocaleString()}. Payment is expected immediately to avoid institutional lock.` : 'is current with all institutional fee obligations as of today.'}"
                    </p>
                 </div>
              </section>
            </div>

            <FeeLedgerTable fees={fees} totalDue={stats.totalDue} totalPaid={stats.totalPaid} />

            {/* Footer Institutional Stamps */}
            <div className="pt-20 border-t border-slate-100 flex flex-col md:flex-row justify-between items-end gap-10">
               <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center">
                     <TrendingUp className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Institutional Health Index</h5>
                    <p className="text-xl font-black text-slate-900">{stats.totalDue > 0 ? Math.round((stats.totalPaid / stats.totalDue) * 100) : 100}% Recovery Rate</p>
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
