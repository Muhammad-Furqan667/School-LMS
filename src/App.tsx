import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './pages/Login';
import Layout from './components/Layout';
import { SchoolService } from './services/schoolService';
import { useEffect, useState } from 'react';

import type { Tables } from './types/database';

import { AdminLayout } from './pages/admin/AdminLayout';
import { StudentConsole } from './pages/admin/StudentConsole';
import { TeacherConsole } from './pages/admin/TeacherConsole';
import AdminDashboard from './pages/admin/Dashboard';
import { CourseConsole } from './pages/admin/CourseConsole';
import { ClassConsole } from './pages/admin/ClassConsole';
import { AttendanceConsole } from './pages/admin/AttendanceConsole';
import { SystemAudit } from './pages/admin/SystemAudit';
import StudentFeeCard from './pages/admin/StudentFeeCard';
import PromotionConsole from './pages/admin/PromotionConsole';
import StudentProfilePage from './pages/admin/StudentProfilePage';
import FinanceConsole from './pages/admin/FinanceConsole';
import TeacherDashboard from './pages/teacher/Dashboard';
import ParentDashboard from './pages/parent/Dashboard';

function App() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const customUserId = localStorage.getItem('custom_user_id');
    
    if (customUserId) {
      setSession(true); // Dummy session
      fetchProfile(customUserId);
    } else {
      setSession(null);
      setProfile(null);
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);
      const data = await SchoolService.getProfile(userId);
      setProfile(data);
      if (data?.role === 'admin') {
        await SchoolService.ensureCurrentSession();
      }
      setError(null);
    } catch (error: any) {
      console.error('Profile fetch failed:', error);
      setError(error.message || 'Identity verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-slate">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" expand={false} richColors />
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        
        <Route element={session ? <Layout profile={profile} /> : <Navigate to="/login" />}>
          {/* Main Dashboard Redirection Logic below */}
          <Route path="/" element={
            !profile && session ? (
              <div className="min-h-screen flex flex-col items-center justify-center bg-bg-slate p-6 text-center">
                {error ? (
                  <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-red-100 shadow-xl animate-in zoom-in-95 duration-300">
                    <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <div className="h-10 w-10 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                      We found your account, but your **Admin Profile** has not been initialized yet.
                    </p>
                    <div className="space-y-4">
                      <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl"
                      >
                        Try Again
                      </button>
                      <button 
                        onClick={() => {
                          SchoolService.signOut();
                          window.location.href = '/login';
                        }}
                        className="w-full bg-slate-50 text-slate-500 font-bold py-4 rounded-2xl"
                      >
                        Sign Out & Reset
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                )}
              </div>
            ) : profile?.role === 'admin' ? <Navigate to="/admin" /> :
            profile?.role === 'teacher' ? <Navigate to="/teacher" /> :
            profile?.role === 'parent' ? <Navigate to="/parent" /> :
            <Navigate to="/login" />
          } />
          
          {/* End of Layout nested routes */}

          {/* Teacher Routes */}
          {profile?.role === 'teacher' && (
            <Route path="/teacher/*" element={<TeacherDashboard />} />
          )}

          {/* Parent Routes */}
          {profile?.role === 'parent' && (
            <Route path="/parent/*" element={<ParentDashboard />} />
          )}
        </Route>

        {/* Admin Managed Hubs (Standalone Layout) */}
        {profile?.role === 'admin' && (
          <Route path="/admin" element={session ? <AdminLayout /> : <Navigate to="/login" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="finance" element={<FinanceConsole />} />
            <Route path="attendance" element={<AttendanceConsole />} />
            <Route path="students" element={<StudentConsole />} />
            <Route path="students/:id" element={<StudentProfilePage />} />
            <Route path="students/:id/fee-card" element={<StudentFeeCard />} />
            <Route path="classes" element={<ClassConsole />} />
            <Route path="promotions" element={<PromotionConsole />} />
            <Route path="courses" element={<CourseConsole />} />
            <Route path="teachers" element={<TeacherConsole />} />
            <Route path="audit" element={<SystemAudit />} />
          </Route>
        )}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
