import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface FeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onSuccess: () => void;
}

export const FeeModal: React.FC<FeeModalProps> = ({ isOpen, onClose, student, onSuccess }) => {
  const [amountDue, setAmountDue] = useState('');
  const [month, setMonth] = useState('August');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      // Find latest unpaid fee or set default
      setAmountDue('1200'); // Default professional fee
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: years } = await supabase.from('academic_years').select('id').eq('is_current', true).single();
      
      const { error } = await supabase
        .from('fees')
        .upsert({
          student_id: student.id,
          month,
          amount_due: parseFloat(amountDue),
          amount_paid: 0,
          status: 'unpaid',
          year_id: years?.id
        });

      if (error) throw error;
      
      toast.success(`Fee voucher updated for ${student.name}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to update fee records');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Fee Warden</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           <div className="bg-emerald-50 p-4 rounded-2xl mb-4 border border-emerald-100">
             <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Target Student</p>
             <p className="font-bold text-slate-900">{student.name}</p>
             <p className="text-[10px] text-slate-400 font-bold uppercase">{student.roll_no}</p>
           </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Month</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none outline-none"
              >
                {['August', 'September', 'October', 'November', 'December', 'January'].map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Amount Due ($)</label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="number"
                required
                value={amountDue}
                onChange={(e) => setAmountDue(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Issue Fee Voucher'}
          </button>
        </form>
      </div>
    </div>
  );
};
