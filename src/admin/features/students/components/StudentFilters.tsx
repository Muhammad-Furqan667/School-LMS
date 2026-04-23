import React from 'react';
import { Search, Filter, ChevronRight, ShieldAlert } from 'lucide-react';
import type { Class } from '../../classes/types/class.types';

interface StudentFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterClass: string;
  setFilterClass: (val: string) => void;
  showOnlyDues: boolean;
  setShowOnlyDues: (val: boolean) => void;
  classes: Class[];
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterClass,
  setFilterClass,
  showOnlyDues,
  setShowOnlyDues,
  classes,
}) => {


  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4">
      <div className="relative flex-1 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, roll, or father's name..."
          className="w-full pl-12 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/20 transition-all font-medium"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full sm:w-auto pl-11 pr-10 py-4 bg-slate-50/50 border border-slate-100 rounded-[1.25rem] outline-none appearance-none font-bold text-sm text-slate-600 min-w-[160px] cursor-pointer hover:bg-white transition-colors"
          >
            <option value="">All Grades</option>
            {classes
              .sort((a, b) => {
                const numA = parseInt(a.grade);
                const numB = parseInt(b.grade);
                if (!isNaN(numA) && !isNaN(numB)) {
                  if (numA !== numB) return numA - numB;
                  return a.section.localeCompare(b.section);
                }
                return a.grade.localeCompare(b.grade);
              })
              .map(c => (
                <option key={c.id} value={c.id}>Grade {c.grade} - {c.section}</option>
              ))}
          </select>
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none rotate-90" />
        </div>

        <button
          onClick={() => setShowOnlyDues(!showOnlyDues)}
          className={`flex items-center justify-center gap-2 px-6 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest transition-all border ${showOnlyDues
              ? 'bg-red-50 text-red-600 border-red-200 shadow-lg shadow-red-500/10'
              : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
            }`}
        >
          <ShieldAlert className={`h-4 w-4 ${showOnlyDues ? 'animate-pulse' : ''}`} />
          {showOnlyDues ? 'Viewing Dues Only' : 'Filter Dues'}
        </button>
      </div>
    </div>
  );
};
