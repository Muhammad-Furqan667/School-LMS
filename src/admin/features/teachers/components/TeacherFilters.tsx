import React from 'react';
import { Search } from 'lucide-react';

interface TeacherFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  subjects: any[];
  classes: any[];
  filters: {
    subjectId: string;
    grade: string;
    isHeadTeacher: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    subjectId: string;
    grade: string;
    isHeadTeacher: boolean;
  }>>;
}

export const TeacherFilters: React.FC<TeacherFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  subjects = [],
  classes = [],
  filters,
  setFilters,
}) => {
  // Get unique grades
  const uniqueGrades = Array.from(new Set((classes || []).map(c => c.grade))).filter(Boolean).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="flex flex-col xl:flex-row gap-4 px-1">
      <div className="relative group flex-1">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter faculty by name..."
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-3xl shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={filters.subjectId}
            onChange={(e) => setFilters(f => ({ ...f, subjectId: e.target.value }))}
            className="pl-5 pr-10 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none font-bold text-xs appearance-none cursor-pointer"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select
            value={filters.grade}
            onChange={(e) => setFilters(f => ({ ...f, grade: e.target.value }))}
            className="pl-5 pr-10 py-5 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none font-bold text-xs appearance-none cursor-pointer"
          >
            <option value="">All Grades</option>
            {uniqueGrades.map(g => (
              <option key={g} value={g}>Grade {g}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setFilters(f => ({ ...f, isHeadTeacher: !f.isHeadTeacher }))}
          className={`px-6 py-5 rounded-2xl font-bold text-xs transition-all border ${
            filters.isHeadTeacher 
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-200' 
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
          }`}
        >
          {filters.isHeadTeacher ? 'Moderators Only' : 'Show All Staff'}
        </button>
      </div>
    </div>
  );
};
