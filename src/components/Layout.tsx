import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { SchoolService } from '../services/schoolService';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Bell, 
  CreditCard, 
  LogOut,
  GraduationCap,
  Wallet,
  User,
  CalendarCheck2
} from 'lucide-react';
import type { Tables } from '../types/database';

interface LayoutProps {
  profile: Tables<'profiles'> | null;
}

const Layout: React.FC<LayoutProps> = ({ profile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await SchoolService.signOut();
    navigate('/login');
  };

  const roleTheme = (profile?.role === 'admin' || profile?.role === 'teacher' || profile?.role === 'parent') 
    ? {
        admin: { primary: 'emerald-600', bg: 'bg-emerald-50/50', text: 'text-emerald-700', border: 'border-emerald-100' },
        teacher: { primary: 'indigo-600', bg: 'bg-indigo-50/50', text: 'text-indigo-700', border: 'border-indigo-100' },
        parent: { primary: 'primary', bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary/10' }
      }[profile.role]
    : { primary: 'primary', bg: 'bg-primary/5', text: 'text-primary', border: 'border-primary/10' };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/', roles: ['admin', 'teacher', 'parent'] },
    { icon: Users, label: 'Student Registry', path: '/admin/students', roles: ['admin'] },
    { icon: GraduationCap, label: 'Class Repository', path: '/admin/classes', roles: ['admin'] },
    { icon: Bell, label: 'OTA Broadcast', path: '/admin/broadcast', roles: ['admin'] },
    
    // Teacher Optimized Hub
    { icon: CalendarCheck2, label: 'Attendance', path: '/teacher/attendance', roles: ['teacher'] },
    { icon: Users, label: 'My Classes', path: '/teacher/classes', roles: ['teacher'] },
    { icon: Wallet, label: 'Salary Record', path: '/teacher/salary', roles: ['teacher'] },
    { icon: User, label: 'My Profile', path: '/teacher/profile', roles: ['teacher'] },
    // Parent Optimized Hub
    { icon: BookOpen, label: 'Diary', path: '/parent/diary', roles: ['parent'] },
    { icon: CalendarCheck2, label: 'Academics', path: '/parent/academics', roles: ['parent'] },
    { icon: CreditCard, label: 'Fee History', path: '/parent/fees', roles: ['parent'] },
    { icon: User, label: 'My Profile', path: '/parent/profile', roles: ['parent'] },
  ].filter(item => profile && item.roles.includes(profile.role));

  return (
    <div className="flex h-screen bg-bg-slate overflow-hidden">
      {/* Sidebar */}
      <aside className={`hidden md:flex flex-col w-72 bg-surface border-r border-slate-200 transition-colors`}>
        <div className="p-6 flex items-center gap-3">
          <div className={`bg-${roleTheme.primary}/10 p-2 rounded-xl`}>
            <GraduationCap className={`h-6 w-6 text-${roleTheme.primary}`} />
          </div>
          <span className="font-black text-slate-900 text-xl tracking-tight uppercase">Schooling</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? `bg-${roleTheme.primary}/10 text-${roleTheme.primary} font-bold shadow-sm` 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className={`${roleTheme.bg} border ${roleTheme.border} rounded-2xl p-4 mb-4`}>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
            <p className="font-bold text-slate-900 truncate text-sm">{profile?.username}</p>
            <p className={`text-[10px] text-${roleTheme.primary} font-black uppercase tracking-tighter`}>{profile?.role} System</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-72 bg-surface p-6 shadow-2xl animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-slate-900 text-lg">Schooling</span>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-primary/10 text-primary font-semibold' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-slate-100">
               <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Hide default header for Parents on mobile as they have a custom UI */}
        {/* Mobile Header */}
        <header className={`h-16 bg-surface border-b border-slate-200 flex items-center justify-between px-6 md:hidden flex-shrink-0`}>
           <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <GraduationCap className={`h-6 w-6 text-${roleTheme.primary}`} />
            <span className="font-black text-slate-900 uppercase tracking-widest text-sm">Schooling</span>
          </div>
          <div className="w-10"></div>
        </header>
        
        <div className={`flex-1 overflow-auto ${profile?.role === 'parent' ? 'p-0' : 'p-4 md:p-10'}`}>
          <div className={`${profile?.role === 'parent' ? 'max-w-none' : 'max-w-7xl'} mx-auto`}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
