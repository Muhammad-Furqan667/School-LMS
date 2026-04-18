import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  BookOpen, 
  DollarSign, 
  History, 
  Calendar,
  Lock,
  Unlock,
  ShieldAlert
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface ProfileSlideOverProps {
  userId: string | null;
  role: 'student' | 'teacher' | 'admin';
  onClose: () => void;
  onUpdate: () => void;
}

export const ProfileSlideOver: React.FC<ProfileSlideOverProps> = ({ userId, role, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (userId) {
      fetchFullProfile();
    }
  }, [userId]);

  const fetchFullProfile = async () => {
    setLoading(true);
    try {
      if (role === 'student') {
        const { data: student } = await supabase
          .from('students')
          .select('*, classes(*), parents(*)')
          .eq('id', userId)
          .single();
        
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('*, subjects(*)')
          .eq('student_id', userId);

        setProfileData({ ...student, enrollments });
      } else if (role === 'teacher') {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('*, profiles(*)')
          .eq('profile_id', userId) // userId is profile_id
          .single();
        
        const statsData = await SchoolService.getTeacherStats(userId!);
        setProfileData(teacher);
        setStats(statsData);
      }
    } catch (error) {
      toast.error('Identity fetch failed');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-center font-black text-slate-300 text-xl">
                 {(profileData?.name || profileData?.full_name || 'U')[0]}
              </div>
              <div>
                 <h2 className="text-xl font-black text-slate-900">{profileData?.name || profileData?.full_name}</h2>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{role} profile</p>
              </div>
           </div>
           <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-colors border border-slate-200">
             <X className="h-5 w-5 text-slate-400" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
           {loading ? (
             <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
           ) : (
             <>
               {/* Contact & Bio Info */}
               <section className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">General Information</h3>
                  <div className="grid grid-cols-1 gap-3">
                     <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <Mail className="h-5 w-5 text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">{profileData?.parents?.email || 'N/A'}</span>
                     </div>
                     <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <Phone className="h-5 w-5 text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">{profileData?.roll_no || 'Internal ID: ' + profileData?.id.slice(0, 8)}</span>
                     </div>
                  </div>
               </section>

               {/* Role Specific Stats */}
               {role === 'student' && (
                 <section className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Enrolled Subjects</h3>
                    <div className="space-y-3">
                       {profileData?.enrollments?.map((en: any) => (
                         <div key={en.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 bg-indigo-50 rounded-xl flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-indigo-600" />
                               </div>
                               <p className="text-sm font-black text-slate-900">{en.subjects?.name}</p>
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase bg-emerald-50 px-2 py-1 rounded-lg">
                               {en.payment_status}
                            </span>
                         </div>
                       ))}
                       {(!profileData?.enrollments || profileData.enrollments.length === 0) && (
                         <p className="text-slate-400 italic text-xs py-4 text-center border-2 border-dashed border-slate-100 rounded-2xl">No active enrollments found.</p>
                       )}
                    </div>
                 </section>
               )}

               {role === 'teacher' && (
                 <section className="space-y-4">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Teacher Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                          <p className="text-[10px] font-bold text-white/40 uppercase">Total Revenue</p>
                          <p className="text-xl font-black mt-1">Rs. {stats?.revenue?.toLocaleString() || 0}</p>
                       </div>
                       <div className="p-6 bg-emerald-600 rounded-[2rem] text-white">
                          <p className="text-[10px] font-bold text-white/40 uppercase">Students</p>
                          <p className="text-xl font-black mt-1">{stats?.totalStudents || 0}</p>
                       </div>
                    </div>
                 </section>
               )}

               {/* Admin Controls */}
               <section className="pt-8 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Access Management</h3>
                  <div className="grid grid-cols-1 gap-3">
                     <button className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-amber-500 transition-all group">
                        <div className="flex items-center gap-3">
                           <Key className="h-5 w-5 text-amber-500" />
                           <span className="text-sm font-bold text-slate-900">Push Reset Password</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase">Override</span>
                     </button>
                     <button className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-red-500 transition-all group">
                        <div className="flex items-center gap-3 text-red-600">
                           <ShieldAlert className="h-5 w-5" />
                           <span className="text-sm font-bold">Freeze Identity</span>
                        </div>
                     </button>
                  </div>
               </section>
             </>
           )}
        </div>
      </div>
    </div>
  );
};
