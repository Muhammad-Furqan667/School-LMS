import React from 'react';
import { BookOpen, Trash2 } from 'lucide-react';
import type { Subject } from '../types/curriculum.types';

interface CourseGridProps {
  courses: Subject[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export const CourseGrid: React.FC<CourseGridProps> = ({ courses, loading, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
        <BookOpen className="h-10 w-10 mx-auto mb-4 text-slate-300" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No assigned curriculum found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-lg">
              {course.name[0]}
            </div>
            <div>
              <p className="font-black text-slate-900 tracking-tight">{course.name}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Academic Domain</p>
            </div>
          </div>
          <button 
            onClick={() => onDelete(course.id)}
            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
