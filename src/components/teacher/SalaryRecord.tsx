import React from 'react';
import { Wallet, TrendingUp, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface SalaryRecordProps {
  teacher: any;
}

export const SalaryRecord: React.FC<SalaryRecordProps> = ({ teacher }) => {
  // Dummy history for visualization
  const salaryHistory = [
    { month: 'March 2026', amount: teacher.salary || 0, status: 'paid', date: '2026-04-05' },
    { month: 'February 2026', amount: teacher.salary || 0, status: 'paid', date: '2026-03-05' },
    { month: 'January 2026', amount: teacher.salary || 0, status: 'paid', date: '2026-02-05' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Salary Card */}
        <div className="md:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
          <div className="flex justify-between items-start mb-12">
            <div>
              <p className="text-indigo-300 text-xs font-black uppercase tracking-widest mb-1">Monthly Base Salary</p>
              <h2 className="text-5xl font-black tabular-nums">Rs. {(teacher.salary || 0).toLocaleString()}</h2>
            </div>
            <div className="h-14 w-14 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/10">
              <Wallet className="h-7 w-7 text-indigo-300" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-auto">
             <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <div>
                   <p className="text-[10px] font-black text-indigo-300/60 uppercase">Expected Bonus</p>
                   <p className="text-sm font-bold text-white">Rs. 0</p>
                </div>
             </div>
             <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
                <Calendar className="h-5 w-5 text-indigo-300" />
                <div>
                   <p className="text-[10px] font-black text-indigo-300/60 uppercase">Pay Day</p>
                   <p className="text-sm font-bold text-white">Next: May 5th</p>
                </div>
             </div>
          </div>

          {/* Decorative gradients */}
          <div className="absolute -right-20 -top-20 h-64 w-64 bg-indigo-500/20 rounded-full blur-[100px]" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>

        {/* Quick Stats Card */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 flex flex-col justify-between">
           <div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">Payment Status</h3>
              <p className="text-slate-500 text-sm mb-6 uppercase tracking-tighter font-medium">Session 2025-2026</p>
           </div>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">April Paid</span>
                 </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                 <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-600">May Pending</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* History Table */}
      <section className="bg-surface rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-xl">Earnings History</h2>
          <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Download PDF</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-4">Transaction Hub</th>
                <th className="px-8 py-4">Month</th>
                <th className="px-8 py-4 text-right">Amount</th>
                <th className="px-8 py-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {salaryHistory.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center shadow-sm">
                        <Wallet className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Monthly Remittance</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{rec.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-slate-600">{rec.month}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-black text-slate-900">Rs. {rec.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black uppercase">Cleared</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
