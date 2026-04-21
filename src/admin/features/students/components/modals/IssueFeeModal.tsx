import React from 'react';
import { CreditCard, X, Plus, XCircle } from 'lucide-react';
import type { FeeFormState, Student } from '../../types/student.types';

interface IssueFeeModalProps {
  selectedStudent: Student;
  feeForm: FeeFormState;
  setFeeForm: React.Dispatch<React.SetStateAction<FeeFormState>>;
  totalFeeAmount: number;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const IssueFeeModal: React.FC<IssueFeeModalProps> = ({
  selectedStudent,
  feeForm,
  setFeeForm,
  totalFeeAmount,
  onClose,
  onSubmit,
}) => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-4">
            <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">Fee Bill</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{selectedStudent.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-3 hover:bg-slate-50 rounded-xl">
            <X className="h-5 w-5 text-slate-300" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Billing Cycle</label>
            <select
              value={feeForm.month}
              onChange={(e) => setFeeForm({ ...feeForm, month: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none appearance-none font-bold"
            >
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-4 max-h-[250px] overflow-y-auto p-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="flex justify-between items-center mb-2 px-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Bill Breakdown</label>
              <button 
                type="button" 
                onClick={() => setFeeForm({ ...feeForm, items: [...feeForm.items, { category: '', amount: 0 }] })}
                className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1 hover:underline"
              >
                <Plus className="h-3 w-3" /> Add Item
              </button>
            </div>
            {feeForm.items.map((item, idx) => (
              <div key={idx} className="flex gap-2 animate-in slide-in-from-right-2 duration-200">
                <input
                  placeholder="Category (e.g. Lab Fee)"
                  value={item.category}
                  onChange={(e) => {
                    const newItems = [...feeForm.items];
                    newItems[idx].category = e.target.value;
                    setFeeForm({ ...feeForm, items: newItems });
                  }}
                  className="flex-1 p-3 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={item.amount}
                  onChange={(e) => {
                    const newItems = [...feeForm.items];
                    newItems[idx].amount = parseFloat(e.target.value) || 0;
                    setFeeForm({ ...feeForm, items: newItems });
                  }}
                  className="w-24 p-3 bg-white border border-slate-100 rounded-xl outline-none text-xs font-bold"
                />
                {feeForm.items.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => setFeeForm({ ...feeForm, items: feeForm.items.filter((_, i) => i !== idx) })}
                    className="p-3 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 rounded-2xl p-4 flex flex-col justify-center">
              <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Total Payable</p>
              <p className="text-xl font-black text-white">Rs. {totalFeeAmount.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Initial Payment</label>
              <input
                type="number"
                value={feeForm.amount_paid}
                onChange={(e) => setFeeForm({ ...feeForm, amount_paid: e.target.value })}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-sm"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Payment Status</label>
            <div className="flex gap-2">
              {['unpaid', 'partial', 'paid'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFeeForm({ ...feeForm, status: s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() })}
                  className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${feeForm.status?.toLowerCase() === s.toLowerCase()
                      ? s === 'paid' ? 'bg-emerald-600 text-white' : s === 'partial' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                      : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-slate-900 text-white font-black rounded-[1.5rem] shadow-xl hover:bg-emerald-600 hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
          >
            Notify & Save Entry
          </button>
        </form>
      </div>
    </div>
  );
};
