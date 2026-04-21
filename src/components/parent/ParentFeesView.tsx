import React, { useState } from 'react';
import { CreditCard, X, Receipt, Calculator } from 'lucide-react';

interface ParentFeesViewProps {
  fees: any[];
  parentName?: string;
}

export const ParentFeesView: React.FC<ParentFeesViewProps> = ({ fees, parentName }) => {
  const [selectedFee, setSelectedFee] = useState<any | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
             Financial Ledger
          </h1>
          <p className="text-slate-500 font-medium mt-1">Verified Identity: {parentName || 'Parent'}</p>
        </div>
      </div>

      <section className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm">
         <div className="flex justify-between items-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 leading-none">Invoices & Fees</h2>
            <div className="px-5 py-2 bg-slate-900 text-white font-bold rounded-2xl text-[10px] uppercase tracking-widest shadow-lg">Session 2026</div>
         </div>

         <div className="space-y-4">
            {fees.map((fee) => (
              <div 
                key={fee.id} 
                onClick={() => setSelectedFee(fee)}
                className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-600 transition-all cursor-pointer"
              >
                 <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${fee.status?.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                       <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                       <p className="text-lg font-black text-slate-900 leading-none mb-1">{fee.month}</p>
                       <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{fee.academic_years?.year_label || 'Current Session'}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-8">
                    <div className="text-right">
                       <p className="text-xl font-black text-slate-900 leading-none mb-1">Rs. {fee.amount_due?.toLocaleString()}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">Amount Due</p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${fee.status?.toLowerCase() === 'paid' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white shadow-lg'}`}>
                       {fee.status}
                    </div>
                 </div>
              </div>
            ))}
            {fees.length === 0 && (
               <div className="text-center py-20 bg-slate-50 border border-slate-200 border-dashed rounded-[3rem]">
                 <Receipt className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                 <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active ledger found for this billing cycle</p>
               </div>
            )}
         </div>
      </section>

      {/* Breakdown Popup Modal */}
      {selectedFee && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedFee(null)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-0 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">{selectedFee.month} Invoice</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Itemized Fee Breakdown</p>
              </div>
              <button onClick={() => setSelectedFee(null)} className="p-2 bg-slate-50 text-slate-300 hover:text-slate-900 rounded-xl transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
               <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                  <div className="space-y-4">
                    {selectedFee.breakdown && selectedFee.breakdown.length > 0 ? (
                      selectedFee.breakdown.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                           <span className="text-slate-500 font-bold">{item.category}</span>
                           <span className="text-slate-900 font-black">Rs. {parseFloat(item.amount).toLocaleString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 font-bold">Standard Tuition Fee</span>
                        <span className="text-slate-900 font-black">Rs. {selectedFee.amount_due?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center capitalize">
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Payable</span>
                     <span className="text-2xl font-black text-indigo-600">Rs. {selectedFee.amount_due?.toLocaleString()}</span>
                  </div>
               </div>

               <div className="p-6 bg-indigo-900 rounded-[2rem] text-white flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase mb-1">Current Status</p>
                    <p className="text-lg font-black">{selectedFee.status}</p>
                  </div>
                  <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-white/60" />
                  </div>
               </div>
            </div>
            
            <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
              <button 
                onClick={() => setSelectedFee(null)}
                className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-900 transition-all"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
