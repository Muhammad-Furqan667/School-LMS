import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Printer, 
  Clock, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Plus,
  MinusCircle,
  X
} from 'lucide-react';
import { useFeeHistory } from '../hooks/useFeeHistory';
import { FeeCardHeader } from './FeeCardHeader';
import { FeeStatsBar } from './FeeStatsBar';
import { FeeLedgerTable } from './FeeLedgerTable';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';

export const StudentFeeCardFeature: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { student, fees, loading, stats, fetchStudentData } = useFeeHistory(id);
  
  // Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [adjustment, setAdjustment] = useState({ category: '', amount: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateStatus = async (feeId: string, amount: number) => {
    try {
      await SchoolService.updateFeeStatus(feeId, 'Paid', amount);
      toast.success('Fee marked as paid');
      if (id) fetchStudentData(id);
    } catch (error) {
      toast.error('Failed to update fee status');
    }
  };

  const handleAdjustFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || !adjustment.category || !adjustment.amount) return;
    
    setIsSubmitting(true);
    try {
      await SchoolService.addFeeAdjustment(
        selectedFee.id, 
        adjustment.category, 
        Number(adjustment.amount)
      );
      toast.success('Fee adjusted successfully');
      setIsAdjustModalOpen(false);
      setAdjustment({ category: '', amount: '' });
      if (id) fetchStudentData(id);
    } catch (error) {
      toast.error('Failed to adjust fee');
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen bg-slate-50 p-4 md:p-10 animate-in fade-in duration-700">
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
          </div>
        </div>

        {/* The Actual Fee Card Container */}
        <div id="fee-card-printable" className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden print:overflow-visible printable-area">
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

            <FeeLedgerTable 
              fees={fees} 
              totalDue={stats.totalDue} 
              totalPaid={stats.totalPaid} 
              onUpdateStatus={handleUpdateStatus}
              onAdjust={(fee) => {
                setSelectedFee(fee);
                setIsAdjustModalOpen(true);
              }}
            />

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

      {/* Fee Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAdjustModalOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-8">
               <div>
                  <h2 className="text-2xl font-black">Fee Adjustment</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Add charges or deductions for {selectedFee?.month}</p>
               </div>
               <button onClick={() => setIsAdjustModalOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-5 w-5" />
               </button>
             </div>
             
             <form onSubmit={handleAdjustFee} className="space-y-6">
                <div>
                   <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Adjustment Category</label>
                   <div className="flex flex-wrap gap-2 mb-4">
                      {['Kinship Off', 'Orphan Off', 'Scholarship', 'Fine', 'Late Fee', 'Library Fine'].map(cat => (
                        <button 
                          key={cat}
                          type="button"
                          onClick={() => setAdjustment({...adjustment, category: cat})}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all border ${
                            adjustment.category === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                   </div>
                   <input 
                     required
                     value={adjustment.category}
                     onChange={(e) => setAdjustment({...adjustment, category: e.target.value})}
                     className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all"
                     placeholder="Or type custom category..."
                   />
                </div>

                <div>
                   <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Amount (PKR)</label>
                   <div className="relative">
                      <input 
                        required
                        type="number"
                        value={adjustment.amount}
                        onChange={(e) => setAdjustment({...adjustment, amount: e.target.value})}
                        className={`w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black focus:ring-4 transition-all ${
                          Number(adjustment.amount) < 0 ? 'text-red-600 focus:ring-red-500/5' : 'text-slate-900 focus:ring-indigo-500/5'
                        }`}
                        placeholder="0"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                         {Number(adjustment.amount) < 0 ? <MinusCircle className="h-5 w-5 text-red-500" /> : <Plus className="h-5 w-5 text-slate-400" />}
                      </div>
                   </div>
                   <p className="mt-2 text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
                     * Enter a negative value (e.g. -500) for deductions/discounts.
                   </p>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200"
                >
                   {isSubmitting ? 'Processing...' : 'Apply Adjustment'}
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
