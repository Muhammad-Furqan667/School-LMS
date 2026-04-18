import React, { useState } from 'react';
import { X, User, Key, Shield } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, password: string) => Promise<void>;
  role: 'teacher' | 'parent';
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onConfirm, role }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onConfirm(id, password);
      onClose();
      setId('');
      setPassword('');
    } catch (error) {
      // Error handled by parent toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${role === 'teacher' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Add {role.charAt(0).toUpperCase() + role.slice(1)}</h3>
              <p className="text-xs text-slate-500">Generate secure school credentials</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="h-3 w-3" />
              School ID / Username
            </label>
            <input
              required
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder={role === 'teacher' ? 'TEACH_01 or email' : 'PARENT_01 or email'}
              className="w-full h-[48px] px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Key className="h-3 w-3" />
              Password
            </label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full h-[48px] px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[44px] font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className={`flex-1 h-[44px] font-bold text-white rounded-xl transition-all shadow-lg ${
                role === 'teacher' 
                  ? 'bg-[#059669] hover:bg-emerald-700 shadow-emerald-500/20' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
              } disabled:opacity-50`}
            >
              {loading ? 'Creating...' : 'Generate Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
