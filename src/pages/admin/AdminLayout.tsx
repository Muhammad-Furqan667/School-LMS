import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap,
  LogOut,
  Menu,
  X,
  BookOpen,
  ShieldCheck,
  CalendarCheck2
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';

export const AdminLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck2 },
    { label: 'Classes', path: '/admin/classes', icon: GraduationCap },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Courses', path: '/admin/courses', icon: BookOpen },
    { label: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
    { label: 'System Audit', path: '/admin/audit', icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    await SchoolService.signOut();
  };

  const NavContent = () => (
    <>
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">EduLink</h1>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 rounded-[1.25rem] text-sm font-black transition-all group ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/20' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`
            }
          >
            <item.icon className={`h-5 w-5 ${item.end ? 'scale-110' : ''}`} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-6 py-4 text-slate-400 hover:text-red-600 font-black text-sm transition-colors rounded-2xl hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen bg-[#f8fafc] flex flex-col lg:flex-row overflow-hidden">
      {/* 
         Removed border-l-[12px] to fix width overflow issues 
         Added overflow-x-hidden to the root to prevent any layout shifts
      */}
      
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-[60] w-full">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-emerald-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">EduLink</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 z-40 flex-shrink-0 overflow-y-auto">
        <NavContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside className={`
        lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-[80] transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <NavContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex-1 overflow-auto p-4 md:p-10">
           <div className="max-w-[1600px] mx-auto">
             <Outlet />
           </div>
        </div>
      </main>
    </div>
  );
};
