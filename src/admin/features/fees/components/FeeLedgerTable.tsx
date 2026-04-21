import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface FeeLedgerTableProps {
  fees: any[];
  totalDue: number;
  totalPaid: number;
}

export const FeeLedgerTable: React.FC<FeeLedgerTableProps> = ({ fees, totalDue, totalPaid }) => {
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
              fees.map((f) => (
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
  );
};
