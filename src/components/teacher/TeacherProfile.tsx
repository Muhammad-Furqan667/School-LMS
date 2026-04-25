import React from 'react';
import { User, Mail, Phone, MapPin, Calendar, Award, ShieldCheck } from 'lucide-react';

interface TeacherProfileProps {
  teacher: any;
  profile: any;
}

export const TeacherProfile: React.FC<TeacherProfileProps> = ({ teacher, profile }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="relative">
         <div className="h-48 w-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-[2.5rem] shadow-lg" />
         <div className="absolute -bottom-12 left-12 flex items-end gap-6">
            <div className="h-32 w-32 bg-white rounded-[2rem] p-2 shadow-2xl border border-slate-100">
               <div className="h-full w-full bg-slate-50 rounded-[1.5rem] flex items-center justify-center overflow-hidden">
                  {teacher?.profile_picture_url ? (
                    <img src={teacher.profile_picture_url} alt={teacher.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 text-indigo-200" />
                  )}
               </div>
            </div>
            <div className="pb-4">
               <h1 className="text-3xl font-black text-slate-900">{teacher?.full_name || 'Faculty Member'}</h1>
               <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase text-[10px] tracking-widest mt-1">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Faculty Member
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-20">
         {/* Identity Card */}
         <section className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm h-fit">
            <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2">
               <User className="h-5 w-5 text-indigo-600" />
               Basic Information
            </h3>
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                     <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">School Email</p>
                     <p className="text-sm font-bold text-slate-700">{profile?.username?.toLowerCase() || 'faculty'}@schooling.app</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                     <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Joined Date</p>
                     <p className="text-sm font-bold text-slate-700">{teacher?.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
                     <Award className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase">Employee ID</p>
                     <p className="text-sm font-bold text-slate-700">#EMP-{teacher?.id ? teacher.id.slice(0, 8).toUpperCase() : '00000000'}</p>
                  </div>
               </div>
            </div>
         </section>

         {/* Extended Details */}
         <section className="lg:col-span-2 space-y-8">
            <div className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm">
               <h3 className="font-bold text-slate-900 text-lg mb-6">About Me</h3>
               <p className="text-slate-500 leading-relaxed">
                  Dedicated educator committed to fostering a positive learning environment. Currently managing multiple subjects and coordinating with parents to ensure student success.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                  <h4 className="font-bold text-indigo-900 mb-4">Contact Details</h4>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3 text-sm font-medium text-indigo-700">
                        <Phone className="h-4 w-4" />
                        Not Provided
                     </div>
                     <div className="flex items-center gap-3 text-sm font-medium text-indigo-700">
                        <MapPin className="h-4 w-4" />
                        Campus Staff Quarters
                     </div>
                  </div>
               </div>
               
               <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                  <h4 className="font-bold mb-1">Administrative Status</h4>
                  <p className="text-xs text-white/40 mb-6 uppercase tracking-widest">Global Permissions</p>
                  <div className="flex items-center gap-3">
                     <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
                     <span className="text-sm font-bold">Active Service</span>
                  </div>
                  <div className="absolute -right-4 -bottom-4 h-20 w-20 bg-white/10 rounded-full blur-2xl" />
               </div>
            </div>
         </section>
      </div>
    </div>
  );
};
