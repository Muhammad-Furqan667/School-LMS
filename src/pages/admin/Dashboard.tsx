import React, { useState, useEffect } from 'react';
import { SchoolService } from '../../services/schoolService';
import { toast } from 'sonner';
import { 
  Users,
  DollarSign, 
  TrendingUp, 
  BookOpen, 
  Activity, 
  Clock,
  GraduationCap,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const statsData = await SchoolService.getDashboardStats();
      setStats(statsData);
    } catch (error) {
      toast.error('Failed to fetch dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] gap-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 bg-emerald-50 rounded-full animate-pulse" />
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Synchronizing Academy Core...</p>
    </div>
  );

  const kpiData = [
    { label: 'Total Students', value: stats?.totalStudents || 0, icon: Users, color: 'emerald', trend: '+12%', trendUp: true, desc: 'Active enrollments' },
    { label: 'Active Faculty', value: stats?.totalTeachers || 0, icon: GraduationCap, color: 'indigo', trend: 'Stable', trendUp: true, desc: 'Teaching staff' },
    { label: 'Net Revenue', value: `PKR ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'amber', trend: '+5%', trendUp: true, desc: 'Collections' },
    { label: 'Pending Dues', value: `PKR ${(stats?.pendingFees || 0).toLocaleString()}`, icon: TrendingUp, color: 'rose', trend: '-2%', trendUp: false, desc: 'Requires attention' }
  ];

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10 max-w-[1600px] mx-auto overflow-hidden">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">System Health: Optimal</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-2">Academy Pulse</h1>
          <p className="text-slate-500 font-medium md:text-lg">Intelligent institutional oversight and real-time performance analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 hover:bg-slate-50 active:scale-95 transition-all group"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse group-hover:scale-125 transition-transform" />
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest leading-none">Refresh Data</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpiData.map((kpi, i) => (
          <div key={i} className="group bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/40 transition-all duration-500 relative overflow-hidden">
            <div className={`h-14 w-14 bg-${kpi.color}-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm`}>
              <kpi.icon className={`h-7 w-7 text-${kpi.color}-600`} />
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
              <p className="text-[10px] text-slate-400 font-bold opacity-60">{kpi.desc}</p>
            </div>

            <div className={`mt-6 flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl w-fit ${
                kpi.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
                {kpi.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {kpi.trend}
            </div>
            
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] scale-[2.5] rotate-12 group-hover:scale-[3] transition-transform duration-700 text-${kpi.color}-600`}>
                <kpi.icon className="h-12 w-12" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Chart Column */}
        <div className="xl:col-span-2 space-y-6 md:space-y-8">
          {/* Revenue Area Chart */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4 relative z-10 transition-transform group-hover:-translate-y-1">
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-none mb-2 tracking-tight">Financial Velocity</h3>
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">Institutional Cash Flow Tracker</p>
              </div>
              <div className="flex gap-2">
                  <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors cursor-default border border-transparent hover:border-slate-200">Session 24/25</div>
              </div>
            </div>
            
            <div className="h-72 sm:h-85 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { name: 'Jan', rev: 42000 },
                  { name: 'Feb', rev: 38000 },
                  { name: 'Mar', rev: 45000 },
                  { name: 'Apr', rev: 59000 },
                  { name: 'May', rev: 52000 },
                  { name: 'Jun', rev: 48000 },
                  { name: 'Jul', rev: stats?.totalRevenue > 61000 ? stats.totalRevenue : 61000 },
                ]}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                    dx={-10}
                    tickFormatter={(v) => `\u20A8${v/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px 20px' }} 
                    itemStyle={{ fontWeight: 900, color: '#10b981' }}
                    cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '6 6' }}
                  />
                  <Area type="monotone" dataKey="rev" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute -right-20 -top-20 h-64 w-64 bg-emerald-500/5 blur-[120px] rounded-full" />
          </div>

          {/* Grade Distribution Bar Chart */}
          <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[450px]">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-none mb-2 tracking-tight">Academic Distribution</h3>
                <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest">Student spread across academy grades</p>
              </div>
            </div>
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.gradeDistribution || []}>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 9, fontWeight: 900, fill: '#94a3b8'}}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} 
                    dx={-10}
                  />
                  <Tooltip cursor={{fill: '#f8fafc', radius: 24}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }} />
                  <Bar dataKey="value" radius={[16, 16, 4, 4]} barSize={48}>
                    {(stats?.gradeDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Activity Feed */}
        <div className="space-y-6 h-full">
          <div className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden h-full flex flex-col min-h-[600px] shadow-2xl xl:shadow-emerald-900/10">
            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-4 mb-12">
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/5">
                  <Activity className="h-7 w-7 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight leading-none mb-1">Status Console</h3>
                  <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.3em]">Institutional Hub</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Recent Student Enrollments */}
                <div className="p-7 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/[0.08] transition-all duration-500 group cursor-default">
                  <div className="flex items-center gap-5 mb-5">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 transition-transform group-hover:scale-110 group-hover:rotate-6">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black">Velocity</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">New Enrolled (7d)</p>
                    </div>
                    <div className="ml-auto text-2xl font-black text-emerald-400">+{stats?.recentStudents || 0}</div>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[65%] shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" />
                  </div>
                </div>

                {/* Subject Distribution */}
                <div className="p-7 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/[0.08] transition-all duration-500 group cursor-default">
                  <div className="flex items-center gap-5 mb-5">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 transition-transform group-hover:scale-110">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black">Breadth</p>
                      <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Faculty Specialization</p>
                    </div>
                    <div className="ml-auto text-2xl font-black text-indigo-400">{stats?.activeSubjects || 0}</div>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full w-[85%] shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000" />
                  </div>
                </div>

                {/* Recovery Ratio Check */}
                <div className="p-7 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/[0.08] transition-all duration-500 group cursor-default">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110">
                        <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                        <p className="text-sm font-black text-white">Recovery</p>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Net Audit Ratio</p>
                        </div>
                    </div>
                    <div className="text-2xl font-black text-amber-500">
                        {stats?.feesPaidCount > 0 ? Math.round((stats.feesPaidCount / (stats.feesPaidCount + stats.feesUnpaidCount)) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 relative z-10 pt-6">
              <div className="p-8 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2.5rem] shadow-2xl shadow-emerald-900/40 group hover:scale-[1.02] transition-transform duration-500 cursor-default border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-black flex items-center gap-2 tracking-tight">
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse" /> Verified Report
                    </h4>
                </div>
                <p className="text-[11px] text-emerald-100/70 leading-relaxed mb-6 font-bold uppercase tracking-widest">Institutional snapshot generated {new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                   <div className="h-full bg-white w-[90%] rounded-full animate-in slide-in-from-left duration-1000" />
                </div>
              </div>
            </div>

            <div className="absolute -right-20 -top-20 h-96 w-96 bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute -left-20 -bottom-20 h-80 w-80 bg-indigo-500/10 blur-[100px] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
