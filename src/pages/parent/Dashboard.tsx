/**
 * PARENT DASHBOARD - VERSION 2.1 (MODERN SIDEBAR EDITION)
 * This component handles sub-routing for Diary, Academics, Fees, and Profile.
 * IMPORTANT: Consumes routes nested under /parent/*
 */
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { SchoolService } from '../../services/schoolService';
import { useStudentLockStatus } from '../../hooks/useSchoolEvents';
import { toast } from 'sonner';
import { 
  AlertOctagon,
} from 'lucide-react';
import { AcademicHub } from '../../components/parent/AcademicHub';
import { ParentProfile } from '../../components/parent/ParentProfile';
import { ParentOverview } from '../../components/parent/ParentOverview';
import { ParentDiaryView } from '../../components/parent/ParentDiaryView';
import { ParentFeesView } from '../../components/parent/ParentFeesView';

const ParentDashboard: React.FC = () => {
  const [children, setChildren] = useState<any[]>([]);
  const [activeChild, setActiveChild] = useState<any | null>(null);
  const [parentData, setParentData] = useState<any | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [diary, setDiary] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);

  const navigate = useNavigate();

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
      const customUserId = localStorage.getItem('custom_user_id');
      if (!customUserId) return;

      const parentData = await SchoolService.getParentData(customUserId);
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

  // Component Views have been extracted to components/parent to prevent re-render unmounting and maintain Senior-level code structure.

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
        <Route path="/" element={<ParentOverview isLocked={isLocked} fees={fees} timetable={timetable} diary={diary} results={results} activeChild={activeChild} parentData={parentData} />} />
        <Route path="/academics" element={<AcademicHub results={results} attendanceStats={attendanceStats} activeChild={activeChild} />} />
        <Route path="/fees" element={<ParentFeesView fees={fees} childName={activeChild?.name} parentName={parentData?.full_name} />} />
        <Route path="/diary" element={<ParentDiaryView diary={diary} childName={activeChild?.name} parentName={parentData?.full_name} />} />
        <Route path="/profile" element={<ParentProfile parent={parentData} childrenData={children} />} />
        <Route path="*" element={<ParentOverview isLocked={isLocked} fees={fees} timetable={timetable} diary={diary} results={results} activeChild={activeChild} parentData={parentData} />} />
      </Routes>
    </div>
  );
};

export default ParentDashboard;
