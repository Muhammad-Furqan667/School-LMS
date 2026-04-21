import React from 'react';
import { User, CheckCircle2 } from 'lucide-react';

interface FeeCardHeaderProps {
  student: any;
}

export const FeeCardHeader: React.FC<FeeCardHeaderProps> = ({ student }) => {
  return (
    <div className="p-8 md:p-12 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="h-32 w-32 bg-white/10 rounded-[2.5rem] border border-white/10 flex items-center justify-center font-black text-5xl backdrop-blur-xl text-white">
          {student.name ? student.name[0] : '?'}
        </div>
        <div>
          <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-3">Official Institutional Record</p>
          <h1 className="text-4xl font-black tracking-tight mb-4">{student.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-bold text-white/60 uppercase tracking-widest">
            <span className="flex items-center gap-2"><User className="h-4 w-4" /> S/O {student.father_name || 'Not Listed'}</span>
            <span className="text-white/20">|</span>
            <span className="flex items-center gap-2">Roll No: {student.roll_no}</span>
          </div>
        </div>
      </div>
      <div className="hidden md:block text-right">
        <div className="h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center ml-auto mb-4 shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-white" />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-white/40">Verified On</p>
        <p className="text-lg font-black">{new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};
