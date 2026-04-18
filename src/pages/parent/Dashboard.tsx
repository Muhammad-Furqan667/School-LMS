/**
 * PARENT DASHBOARD - VERSION 2.0 (MODERN SIDEBAR EDITION)
 * This component handles sub-routing for Diary, Academics, Fees, and Profile.
 * IMPORTANT: It consumes routes nested under /parent/*
 */
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { SchoolService } from '../../services/schoolService';
import { supabase } from '../../lib/supabase';
import { useStudentLockStatus } from '../../hooks/useSchoolEvents';
import { toast } from 'sonner';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CreditCard, 
  AlertOctagon,
  ChevronDown,
  LayoutDashboard,
  CalendarCheck2,
  User,
  ShieldCheck,
  TrendingUp,
  History,
  Info
} from 'lucide-react';
import { AcademicHub } from '../../components/parent/AcademicHub';
import { ParentProfile } from '../../components/parent/ParentProfile';

const ParentDashboard: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [activeChild, setActiveChild] = useState<any | null>(null);
  const [parentData, setParentData] = useState<any | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSwitcher, setShowSwitcher] = useState(false);
  
  const [diary, setDiary] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Monitor the active student's lock status in real-time
  useStudentLockStatus(activeChild?.id, (locked) => {
    setIsLocked(locked);
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeChild) {
      fetchChildDetails();
    }
  }, [activeChild]);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const parentData = await SchoolService.getParentData(user.id);
      setParentData(parentData);

      const students = await SchoolService.getStudents(undefined, parentData.id);
      setChildren(students);
      
      if (students.length > 0) {
        setActiveChild(students[0]);
        setIsLocked(students[0].is_locked || false);
      }
    } catch (error) {
      toast.error('Failed to load student profiles');
    } finally {
      setLoading(false);
    }
  };

  const fetchChildDetails = async () => {
    if (!activeChild) return;
    try {
      const [diaryData, timetableData, feeData, resultsData, attendanceData] = await Promise.all([
        SchoolService.getDiaryForParent(activeChild.class_id || ''),
        SchoolService.getTimetable(activeChild.class_id || ''),
        SchoolService.getStudentFees(activeChild.id),
        SchoolService.getResults(activeChild.id),
        SchoolService.getAttendanceStats(activeChild.id)
      ]);
      setDiary(diaryData);
      setTimetable(timetableData);
      setFees(feeData);
      setResults(resultsData);
      setAttendanceStats(attendanceData);
    } catch (error) {
      console.error('Failed to fetch details:', error);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  const ChildHeader = () => (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
           <ShieldCheck className="h-8 w-8 text-primary" />
           Parent Dashboard
        </h1>
        <p className="text-slate-500 font-medium">Verified Identity: {parentData?.full_name}</p>
      </div>
      
      <div className="relative shrink-0">
        <button 
          onClick={() => setShowSwitcher(!showSwitcher)}
          className="flex items-center gap-4 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-primary/50 transition-all active:scale-[0.98]"
        >
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Active Student</p>
            <p className="font-bold text-slate-900 leading-none">{activeChild?.name}</p>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-300 transition-transform ${showSwitcher ? 'rotate-180' : ''}`} />
        </button>

        {showSwitcher && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="text-[10px] font-black text-slate-400 uppercase p-3 tracking-widest leading-none">Your Children</p>
            <div className="space-y-1">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => {
                    setActiveChild(child);
                    setIsLocked(child.is_locked || false);
                    setShowSwitcher(false);
                  }}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${
                    activeChild?.id === child.id ? 'bg-primary/5 text-primary' : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${activeChild?.id === child.id ? 'bg-primary text-white' : 'bg-slate-100'}`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold">{child.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const Overview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ChildHeader />

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
                 Rs. {fees.reduce((acc, f) => f.status === 'unpaid' ? acc + f.amount_due : acc, 0).toLocaleString()}
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
                    <Calendar className="h-5 w-5 text-primary" />
                    Today's Schedule
                 </h3>
              </div>
              <div className="space-y-3">
                 {timetable.slice(0, 3).map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                       <span className="text-xs font-black text-primary text-center w-6">{idx + 1}</span>
                       <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900 leading-none mb-1">{slot.assignment.subject.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{slot.start_time}</p>
                       </div>
                    </div>
                 ))}
                 {timetable.length === 0 && <p className="text-center text-slate-400 text-xs py-4 italic">No schedule set</p>}
              </div>
           </div>
        </div>

        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-8">
           <section className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                   <BookOpen className="h-6 w-6 text-primary" />
                   Recent Announcements
                </h2>
                <button onClick={() => navigate('/parent/diary')} className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All</button>
              </div>

              <div className="space-y-4">
                 {diary.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 hover:border-primary/30 transition-all group">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                             <ShieldCheck className="h-5 w-5 text-primary group-hover:text-white" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900 leading-none mb-1">{entry.assignment.subject.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.assignment.teacher.full_name}</p>
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

              <div onClick={() => navigate('/parent/profile')} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] relative overflow-hidden cursor-pointer group shadow-sm hover:border-primary/30">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Identity Details</p>
                 <h3 className="text-3xl font-black text-slate-900 mb-6">My Profile</h3>
                 <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <User className="h-6 w-6 text-slate-400 group-hover:text-white" />
                 </div>
                 <div className="absolute -right-6 -bottom-6 h-24 w-24 bg-slate-100 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const DiaryView = () => (
     <div className="space-y-8 animate-in fade-in duration-500">
        <ChildHeader />
        <section className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm">
           <h2 className="text-2xl font-black text-slate-900 mb-8">Daily Classroom Log</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {diary.map((entry) => (
                <div key={entry.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                         <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                         <p className="font-black text-slate-900 text-sm uppercase">{entry.assignment.subject.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.assignment.teacher.full_name}</p>
                      </div>
                   </div>
                   <p className="text-slate-600 text-sm leading-relaxed">{entry.content}</p>
                   <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-tighter">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
              ))}
           </div>
        </section>
     </div>
  );

  const FeesView = () => (
     <div className="space-y-8 animate-in fade-in duration-500">
        <ChildHeader />
        <section className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm">
           <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 leading-none">Invoices & Fees</h2>
              <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-2xl text-xs uppercase tracking-widest shadow-lg">Payment History</button>
           </div>

           <div className="space-y-4">
              {fees.map((fee) => (
                <div key={fee.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-indigo-200 transition-all">
                   <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${fee.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                         <CreditCard className="h-6 w-6" />
                      </div>
                      <div>
                         <p className="text-lg font-black text-slate-900 leading-none mb-1">{fee.month}</p>
                         <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{fee.academic_years.year_label}</p>
                      </div>
                   </div>

                   <div className="flex items-center gap-8">
                      <div className="text-right">
                         <p className="text-xl font-black text-slate-900 leading-none mb-1">Rs. {fee.amount_due.toLocaleString()}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Amount Due</p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${fee.status === 'paid' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white shadow-lg shadow-red-100'}`}>
                         {fee.status}
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>
     </div>
  );

  return (
    <div className="min-h-full">
      {/* "Big Red" Lock Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-500">
          <div className="h-32 w-32 bg-red-500 rounded-full flex items-center justify-center mb-8 animate-bounce shadow-[0_0_50px_rgba(239,68,68,0.5)]">
            <AlertOctagon className="h-16 w-16 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase">ACCOUNT RESTRICTED</h1>
          <p className="text-white/60 text-xl font-medium max-w-md leading-relaxed">
            Personal data access is restricted due to fee arrears for <span className="text-white font-black underline">{activeChild?.name}</span>.
          </p>
          <div className="mt-12 flex gap-4">
             <button onClick={() => navigate('/parent/fees')} className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">Clear Dues Now</button>
             <button onClick={() => SchoolService.signOut()} className="px-8 py-4 bg-white/10 text-white/60 font-black rounded-2xl hover:bg-white/20 transition-all uppercase tracking-widest text-xs">Sign Out</button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/academics" element={<AcademicHub results={results} attendanceStats={attendanceStats} activeChild={activeChild} />} />
        <Route path="/fees" element={<FeesView />} />
        <Route path="/diary" element={<DiaryView />} />
        <Route path="/profile" element={<ParentProfile parent={parentData} childrenData={children} />} />
        <Route path="*" element={<Overview />} />
      </Routes>
    </div>
  );
};

export default ParentDashboard;
