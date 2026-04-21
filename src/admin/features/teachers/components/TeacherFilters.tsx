import React from 'react';
import { Search } from 'lucide-react';

interface TeacherFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

export const TeacherFilters: React.FC<TeacherFiltersProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="relative group max-w-2xl px-1">
      <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Filter faculty by name..."
        className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-3xl shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
      />
    </div>
  );
};
