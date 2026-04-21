import React from 'react';
import { Briefcase, Users, ChevronRight, RefreshCcw } from 'lucide-react';

interface AuditLogTableProps {
  teachers: any[];
  students: any[];
  loading: boolean;
  onRefresh: () => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ teachers, students, loading, onRefresh }) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/10 backdrop-blur-sm">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Affected Registry Items</h3>
        <RefreshCcw 
           onClick={onRefresh}
           className={`h-4 w-4 text-slate-300 cursor-pointer hover:text-slate-600 transition-colors ${loading ? 'animate-spin' : ''}`} 
        />
      </div>
      <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar">
        {teachers.map((t: any) => (
          <div key={t.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{t.full_name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Faculty Member</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black rounded-md border border-red-100 uppercase">No Login</span>
               <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
            </div>
          </div>
        ))}

        {students.map((s: any) => (
          <div key={s.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{s.name}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                  ID: {s.roll_no}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[8px] font-black rounded-md border border-amber-100 uppercase">Pending Link</span>
               <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-slate-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
