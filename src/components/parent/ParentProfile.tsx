import React from 'react';
import { User, ShieldCheck, Mail, Phone, MapPin, Award, IdentificationIcon } from 'lucide-react';

interface ParentProfileProps {
  parent: any;
  childrenData: any[];
}

export const ParentProfile: React.FC<ParentProfileProps> = ({ parent, childrenData }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative">
         <div className="h-48 w-full bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2.5rem] shadow-lg" />
         <div className="absolute -bottom-12 left-12 flex items-end gap-6">
            <div className="h-32 w-32 bg-white rounded-[2rem] p-2 shadow-2xl border border-slate-100">
               <div className="h-full w-full bg-slate-50 rounded-[1.5rem] flex items-center justify-center">
                  <User className="h-16 w-16 text-slate-200" />
               </div>
            </div>
            <div className="pb-4">
               <h1 className="text-3xl font-black text-slate-900">{parent.full_name}</h1>
               <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase text-[10px] tracking-widest mt-1">
                  <ShieldCheck className="h-3 w-3" />
                  Primary Guardian Account
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
         {/* Identity Card */}
         <section className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm h-fit">
            <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
               <User className="h-5 w-5 text-primary" />
               Account Information
            </h3>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                     <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Registered Email</p>
                     <p className="text-sm font-bold text-slate-700">{parent.profiles?.username.toLowerCase()}@schooling.app</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                     <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Phone Number</p>
                     <p className="text-sm font-bold text-slate-700">{parent.profiles?.phone_number || 'N/A'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                     <Award className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">CNIC / ID Number</p>
                     <p className="text-sm font-bold text-slate-700 tracking-widest">{parent.cnic || '12345-XXXXXXX-X'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                     <MapPin className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Home Address</p>
                     <p className="text-sm font-bold text-slate-700">{parent.address || 'Campus Staff Quarters'}</p>
                  </div>
               </div>
            </div>
         </section>

         {/* Linked Students Details */}
         <section className="lg:col-span-2 space-y-8">
            <div className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm">
               <h3 className="font-bold text-slate-900 text-lg mb-6">Linked Students</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {childrenData.map((child) => (
                    <div key={child.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 relative overflow-hidden group hover:border-primary/30 transition-all">
                       <div className="flex items-start justify-between mb-8">
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Student</p>
                             <h4 className="text-xl font-black text-slate-900">{child.name}</h4>
                          </div>
                          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                             <Award className="h-5 w-5" />
                          </div>
                       </div>
                       
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <span className="text-xs font-bold text-slate-500 uppercase">Reg No</span>
                             <span className="text-xs font-black text-slate-900 tracking-wider">#{child.roll_no}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-xs font-bold text-slate-500 uppercase">Current Grade</span>
                             <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-primary uppercase">Grade {child.active_grade || child.classes?.grade}</span>
                          </div>
                       </div>

                       <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 bg-indigo-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
               <h4 className="text-xl font-bold mb-2">Guardian Dashboard Access</h4>
               <p className="text-white/60 text-sm mb-8 max-w-md">Your account allows you to monitor all academic and financial records for your children. All data is synchronized in real-time with the school administration.</p>
               <div className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">Verified Status</span>
                  <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Active Session</span>
               </div>
               <div className="absolute -right-10 -top-10 h-64 w-64 bg-white/5 rounded-full blur-[100px]" />
            </div>
         </section>
      </div>
    </div>
  );
};
