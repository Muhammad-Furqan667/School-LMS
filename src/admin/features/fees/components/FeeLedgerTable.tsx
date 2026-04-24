import React from 'react';
import { Calendar } from 'lucide-react';

interface FeeLedgerTableProps {
  fees: any[];
  totalDue: number;
  totalPaid: number;
  onUpdateStatus?: (feeId: string, amount: number) => void;
  onAdjust?: (fee: any) => void;
}

export const FeeLedgerTable: React.FC<FeeLedgerTableProps> = ({ fees, totalDue, totalPaid, onUpdateStatus, onAdjust }) => {
  return (
    <section>
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
        <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
          <Calendar className="h-4 w-4" />
        </div>
        Full Ledger Records
      </h3>
      <div className="overflow-hidden border border-slate-100 rounded-[2.5rem] bg-white">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#f8fafc] border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Cycle & Items</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Bill</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Recovery</th>
              <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center print:hidden">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(() => {
              const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];
              
              const currentMonthIndex = new Date().getMonth();
              
              const fullLedger = months.map((m, idx) => {
                const existing = fees.find(f => f.month === m);
                if (existing) return existing;
                
                // If it's a future month with no record, mark it clearly
                const isFuture = idx > currentMonthIndex;
                
                return {
                  id: m,
                  month: m,
                  amount_due: 0,
                  amount_paid: 0,
                  status: isFuture ? 'Upcoming' : 'No Bill',
                  items: [],
                  isPlaceholder: true,
                  isFuture
                };
              });

              return fullLedger.map((f) => (
                <tr key={f.id} className={`hover:bg-slate-50/50 transition-colors group ${f.isFuture && f.isPlaceholder ? 'print:hidden' : ''}`}>
                  <td className="px-8 py-5">
                    <p className="font-black text-slate-900 mb-1">{f.month}</p>
                    <div className="flex flex-wrap gap-1">
                      {(f.items || f.breakdown || []).map((item: any, idx: number) => (
                        <span key={idx} className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.category}: {item.amount}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-500 group-hover:text-slate-900 transition-colors">PKR {Number(f.amount_due).toLocaleString()}</td>
                  <td className="px-8 py-5 text-center">
                    <div className={`mx-auto w-fit px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      f.status?.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      f.status?.toLowerCase() === 'partial' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      f.status === 'Upcoming' || f.status === 'No Bill' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {f.status}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900">
                    PKR {Number(f.amount_paid).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-center flex items-center justify-center gap-2 print:hidden">
                    {onAdjust && !f.isPlaceholder && (
                      <button 
                        onClick={() => onAdjust(f)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm active:scale-95"
                      >
                        Adjust
                      </button>
                    )}
                    {f.status?.toLowerCase() !== 'paid' && !f.isPlaceholder && onUpdateStatus && (
                      <button 
                        onClick={() => onUpdateStatus(f.id, f.amount_due)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg active:scale-95"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ));
            })()}
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
  );
};
