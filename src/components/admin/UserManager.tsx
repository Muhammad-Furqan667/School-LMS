import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Ban, 
  CheckCircle2, 
  Mail, 
  Key,
  Download,
  Upload
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { BulkImportModal } from '../../components/admin/BulkImportModal';
import { ProfileSlideOver } from './ProfileSlideOver';

export const UserManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'admins'>('students');
  const [useData, setUserData] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchClasses();
  }, [activeTab]);

  const fetchClasses = async () => {
    const data = await SchoolService.getClasses();
    setClasses(data);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let data: any[] = [];
      if (activeTab === 'students') {
        data = await SchoolService.getStudents();
      } else {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', activeTab === 'teachers' ? 'teacher' : 'admin');
        data = profiles || [];
      }
      setUserData(data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await SchoolService.toggleUserStatus(userId, !currentStatus);
      toast.success(`User ${!currentStatus ? 'Activated' : 'Suspended'}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredUsers = useData.filter(user => 
    (user.name || user.username || user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
          {[
            { id: 'students', label: 'Students', icon: Users },
            { id: 'teachers', label: 'Teachers', icon: ShieldCheck },
            { id: 'admins', label: 'Management', icon: UserPlus }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input 
               type="text"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search by name or ID..."
               className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 w-64"
             />
           </div>
           <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">
             <Filter className="h-4 w-4" />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="p-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Detail</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setIsProfileOpen(true);
                  }}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 text-xs">
                        {(user.name || user.username || user.full_name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none">{user.name || user.username || user.full_name}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">{user.role || (activeTab === 'students' ? 'student' : '')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-mono text-slate-500">
                    {user.roll_no || user.id.slice(0, 8)}
                  </td>
                  <td className="px-8 py-5">
                     <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.is_active !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {user.is_active !== false ? <CheckCircle2 className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                        {user.is_active !== false ? 'Active' : 'Suspended'}
                     </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                        onClick={() => toggleStatus(user.id, user.is_active !== false)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title={user.is_active !== false ? 'Suspend Account' : 'Reactivate Account'}
                       >
                         {user.is_active !== false ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                       </button>
                       <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg transition-all">
                         <Mail className="h-4 w-4" />
                       </button>
                       <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                         <Key className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="p-20 text-center">
            <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No results matching your filter</p>
          </div>
        )}
      </div>

      {activeTab === 'students' && (
        <div className="flex items-center justify-between gap-4 p-8 bg-slate-900 rounded-[2.5rem] text-white">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                 <Upload className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                 <h3 className="font-black text-xl">Batch Operations</h3>
                 <p className="text-white/40 text-xs">Import entire grade registries from CSV</p>
              </div>
           </div>
           <div className="flex gap-3">
              <button className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-bold flex items-center gap-2 transition-all">
                 <Download className="h-4 w-4" />
                 Template
              </button>
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-black flex items-center gap-2 transition-all shadow-xl shadow-emerald-900/40"
              >
                 <Plus className="h-4 w-4" />
                 Launch Bulk Import
              </button>
           </div>
        </div>
      )}

      <BulkImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchUsers}
        classes={classes}
      />

      <ProfileSlideOver 
        userId={selectedUserId}
        role={activeTab === 'students' ? 'student' : activeTab === 'teachers' ? 'teacher' : 'admin'}
        onClose={() => setIsProfileOpen(false)}
        onUpdate={fetchUsers}
      />
    </div>
  );
};
