import React from 'react';
import { CreditCard } from 'lucide-react';
import { CheckCircle2 } from 'lucide-react';
import { Users } from 'lucide-react';

interface ParentFeesViewProps {
  fees: any[];
  childName: string;
  parentName: string;
}

export const ParentFeesView: React.FC<ParentFeesViewProps> = ({ fees, childName, parentName }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
           Financial Ledger
        </h1>
        <p className="text-slate-500 font-medium mt-1">Verified Identity: {parentName}</p>
      </div>
    </div>

    <section className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm">
       <div className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 leading-none">Invoices & Fees</h2>
          <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs uppercase tracking-widest shadow-lg">Payment History</button>
       </div>

       <div className="space-y-4">
          {fees.map((fee) => (
            <div key={fee.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-200 transition-all">
               <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${fee.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                     <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                     <p className="text-lg font-black text-slate-900 leading-none mb-1">{fee.month}</p>
                     <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{fee.academic_years?.year_label}</p>
                  </div>
               </div>

               <div className="flex items-center gap-8">
                  <div className="text-right">
                     <p className="text-xl font-black text-slate-900 leading-none mb-1">Rs. {fee.amount_due?.toLocaleString()}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">Amount Due</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${fee.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-100'}`}>
                     {fee.status}
                  </div>
               </div>
            </div>
          ))}
          {fees.length === 0 && (
             <div className="text-center py-10 bg-slate-50 border border-slate-200 border-dashed rounded-3xl">
               <p className="text-slate-400 font-bold">No ledgers found</p>
             </div>
          )}
       </div>
    </section>
  </div>
);
