import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  User, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2 
} from 'lucide-react';

interface ParentOverviewProps {
  isLocked: boolean;
  fees: any[];
  timetable: any[];
  diary: any[];
  results: any[];
  activeChild: any;
  parentData: any;
}

export const ParentOverview: React.FC<ParentOverviewProps> = ({ 
  isLocked, fees, timetable, diary, results, activeChild, parentData 
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Version 2.1 Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 leading-none">
            Parent Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">Verified Identity: {parentData?.full_name || 'Loading...'}</p>
        </div>
        
        <div className="shrink-0">
          <div className="flex items-center gap-4 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="h-10 w-10 bg-emerald-600/10 rounded-xl flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Authenticated Student</p>
              <p className="font-bold text-slate-900 leading-none">{activeChild?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Stats Column */}
        <div className="space-y-6">
           {/* Fee Quick Status */}
           <div className={`p-8 rounded-[2.5rem] relative overflow-hidden shadow-sm ${isLocked ? 'bg-red-50 border border-red-100' : 'bg-emerald-50 border border-emerald-100'}`}>
              <div className="flex justify-between items-start mb-6">
                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isLocked ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                    <CreditCard className="h-6 w-6" />
                 </div>
                 <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isLocked ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {isLocked ? 'Payment Overdue' : 'Account Clear'}
                 </div>
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">
                 Rs. {Array.isArray(fees) ? fees.reduce((acc, f) => f.status === 'unpaid' ? acc + (f.amount_due || 0) : acc, 0).toLocaleString() : '0'}
              </p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Total Dues</p>
              <button 
                onClick={() => navigate('/parent/fees')}
                className="w-full mt-8 py-4 bg-white hover:bg-slate-50 text-slate-900 font-bold rounded-2xl border border-slate-200 shadow-sm transition-all"
              >
                 View Invoices
              </button>
           </div>

           {/* Timetable Snap */}
           <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-600" />
                    Today's Schedule
                 </h3>
              </div>
              <div className="space-y-3">
                 {timetable.slice(0, 3).map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <span className="text-xs font-black text-emerald-600 text-center w-6">{idx + 1}</span>
                       <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">{slot.assignment?.subject?.name || 'Academic Session'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{slot.start_time || 'Schedule TBD'}</p>
                       </div>
                    </div>
                 ))}
                 {timetable.length === 0 && <p className="text-center text-slate-400 text-xs py-4 italic">No schedule set</p>}
              </div>
           </div>
        </div>

        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-8">
           <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                   <BookOpen className="h-6 w-6 text-emerald-600" />
                   Recent Announcements
                </h2>
                <button onClick={() => navigate('/parent/diary')} className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                 {diary.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 hover:border-emerald-600/30 transition-all group">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                             <ShieldCheck className="h-5 w-5 text-emerald-600 group-hover:text-white" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 leading-none mb-1">{entry.assignment?.subject?.name || 'Class Update'}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.assignment?.teacher?.full_name || 'Faculty Member'}</p>
                          </div>
                       </div>
                       <p className="text-slate-600 text-sm leading-relaxed">{entry.content}</p>
                       <p className="mt-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(entry.date).toLocaleDateString()}</p>
                    </div>
                 ))}
                 {diary.length === 0 && (
                   <div className="p-12 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-center">
                      <p className="text-slate-400 text-sm italic">No entries for today yet.</p>
                   </div>
                 )}
              </div>
           </section>

           {/* Quick Stats Dashboard */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div onClick={() => navigate('/parent/academics')} className="p-8 bg-indigo-900 rounded-[2.5rem] text-white relative overflow-hidden cursor-pointer group shadow-xl">
                 <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Academic Success</p>
                 <h3 className="text-3xl font-black mb-6">Result Analysis</h3>
                 <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold leading-none">
                    <TrendingUp className="h-4 w-4" />
                    {results.length} Recorded Exams
                 </div>
                 <div className="absolute -right-6 -bottom-6 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
              </div>

              <div onClick={() => navigate('/parent/profile')} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] relative overflow-hidden cursor-pointer group shadow-sm hover:border-emerald-600/30">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Identity Details</p>
                 <h3 className="text-3xl font-black text-slate-900 mb-6">My Profile</h3>
                 <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <User className="h-6 w-6 text-slate-400 group-hover:text-white" />
                 </div>
                 <div className="absolute -right-6 -bottom-6 h-24 w-24 bg-slate-100 rounded-full blur-2xl group-hover:bg-emerald-600/10 transition-all" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
