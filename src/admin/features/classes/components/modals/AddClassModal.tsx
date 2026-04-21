import React from 'react';
import { X } from 'lucide-react';
import type { ClassFormState } from '../../types/class.types';

interface AddClassModalProps {
  classForm: ClassFormState;
  setClassForm: React.Dispatch<React.SetStateAction<ClassFormState>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export const AddClassModal: React.FC<AddClassModalProps> = ({
  classForm,
  setClassForm,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
         <div className="flex justify-between items-start mb-10">
           <div>
              <h2 className="text-2xl font-black">Add Class</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Define new structural grade</p>
           </div>
           <button onClick={onClose} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X className="h-5 w-5"/></button>
         </div>
         <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Grade Value</label>
              <input 
                required 
                value={classForm.grade} 
                onChange={(e) => setClassForm({...classForm, grade: e.target.value})} 
                className="w-full p-5 bg-slate-50 border rounded-2xl outline-none font-bold" 
                placeholder="e.g. 10" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Section Indicator</label>
              <input 
                required 
                value={classForm.section} 
                onChange={(e) => setClassForm({...classForm, section: e.target.value.toUpperCase()})} 
                className="w-full p-5 bg-slate-50 border rounded-2xl outline-none font-bold" 
                placeholder="e.g. A" 
              />
            </div>
            <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all">Publish Class</button>
         </form>
      </div>
    </div>
  );
};
