import React from 'react';
import { CreditCard, Edit3, User, TrendingUp, ShieldAlert, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { SchoolService } from '../../../../../../services/schoolService';
import type { Class, Student, FeeFormState } from '../../../types/student.types';
import { PromoteStudentModal } from '../PromoteStudentModal';

interface ProfileTabProps {
  selectedStudent: Student;
  studentFees: any[];
  loadingFees: boolean;
  setFeeForm: React.Dispatch<React.SetStateAction<FeeFormState>>;
  setIsFeeModalOpen: (val: boolean) => void;
  handleOpenEditModal: (student?: Student) => void;
  closeDetail: () => void;
  fetchAll: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  selectedStudent,
  studentFees,
  loadingFees,
  setFeeForm,
  setIsFeeModalOpen,
  handleOpenEditModal,
  closeDetail,
  fetchAll,
}) => {
  const [isPromoteModalOpen, setIsPromoteModalOpen] = React.useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to={`/admin/students/${selectedStudent.id}/fee-card`}
          className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
        >
          <CreditCard className="h-4 w-4" /> Management Fee Card
        </Link>
        <button
          onClick={() => handleOpenEditModal(selectedStudent)}
          className="px-8 py-5 bg-slate-100 text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
        >
          <Edit3 className="h-4 w-4" /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <User className="h-3 w-3" /> Father / Guardian
          </p>
          <p className="text-base font-black text-slate-900">{selectedStudent.father_name || 'Not Provided'}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <TrendingUp className="h-3 w-3" /> Grade Sync
          </p>
          <button
            onClick={() => setIsPromoteModalOpen(true)}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="h-4 w-4" /> Promote / Transfer Batch
          </button>
        </div>
      </div>

      {isPromoteModalOpen && (
        <PromoteStudentModal
          student={selectedStudent}
          onClose={() => setIsPromoteModalOpen(false)}
          onSuccess={() => {
            fetchAll();
            closeDetail();
          }}
        />
      )}

      <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
        <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4" /> Verification & Access
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200/60 transition-all hover:border-indigo-200">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">National Identity CNIC</p>
              <p className="text-sm font-black text-slate-900 tracking-widest">{selectedStudent.cnic || '---'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Parent Identity</p>
              <p className="text-sm font-black text-slate-900 tracking-widest">{selectedStudent.parent_cnic || '---'}</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border ${selectedStudent.parents?.profile_id ? 'bg-emerald-50/30 border-emerald-100' : 'bg-amber-50/30 border-amber-100'}`}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Parent Portal Access</p>
              <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${selectedStudent.parents?.profile_id ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
                {selectedStudent.parents?.profile_id ? 'ACCESS ENABLED' : 'PENDING ACTIVATION'}
              </span>
            </div>
            {!selectedStudent.parents?.profile_id ? (
              <button
                onClick={async () => {
                  toast.promise(SchoolService.createStudentAccess(selectedStudent.id, selectedStudent.roll_no, 'Password123!'), {
                    loading: 'Preparing Portal...',
                    success: 'Portal Access Ready!',
                    error: 'Failed to create access'
                  });
                  fetchAll();
                  closeDetail();
                }}
                className="w-full py-4 bg-amber-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/20"
              >
                Activate Portal Access
              </button>
            ) : (
              <div className="flex items-center justify-between bg-white/60 p-4 rounded-xl border border-white">
                <div className="flex flex-col gap-1">
                   <p className="text-[8px] font-bold text-slate-400 uppercase leading-none">Login Identity</p>
                   <p className="text-xs font-black text-slate-900 uppercase">{selectedStudent.parents?.profiles?.username || selectedStudent.roll_no}</p>
                </div>
                <button onClick={() => toast.info('Contact system admin for manual reset')} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">Reset Passkey</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Ledger</h3>
          <button
            onClick={() => {
              setFeeForm({ id: undefined, month: 'January', amount_paid: '0', status: 'Unpaid', items: [{ category: 'Monthly Fee', amount: 1200 }] });
              setIsFeeModalOpen(true);
            }}
            className="px-4 py-2 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Issue New Bill
          </button>
        </div>

        {loadingFees ? (
          <div className="py-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : studentFees.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-slate-100 p-10 text-center">
            <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-7 w-7 text-slate-200" />
            </div>
            <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">No Active Ledger</p>
          </div>
        ) : (
          <div className="space-y-3">
            {studentFees.slice(0, 4).map((fee) => (
              <div
                key={fee.id}
                onClick={() => {
                  setFeeForm({
                    id: fee.id,
                    month: fee.month,
                    amount_paid: fee.amount_paid.toString(),
                    status: fee.status || 'Unpaid',
                    items: (fee.breakdown && fee.breakdown.length > 0) ? fee.breakdown : (fee.items && fee.items.length > 0) ? fee.items : [{ category: 'Monthly Fee', amount: Number(fee.amount_due) }]
                  });
                  setIsFeeModalOpen(true);
                }}
                className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between group hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer"
              >
                <div>
                  <p className="text-sm font-black text-slate-900 mb-1">{fee.month}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-black text-slate-400">PKR {Number(fee.amount_due).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${fee.status?.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-600' : fee.status?.toLowerCase() === 'partial' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                    {fee.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
