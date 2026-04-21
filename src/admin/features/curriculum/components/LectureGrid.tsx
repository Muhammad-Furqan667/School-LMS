import React from 'react';
import { Monitor, Trash2, ExternalLink } from 'lucide-react';
import type { Lecture } from '../types/curriculum.types';

interface LectureGridProps {
  lectures: Lecture[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export const LectureGrid: React.FC<LectureGridProps> = ({ lectures, loading, onDelete }) => {
  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-slate-200 border-t-indigo-600 rounded-full" />
      </div>
    );
  }

  if (lectures.length === 0) {
    return (
      <div className="text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
        <Monitor className="h-10 w-10 mx-auto mb-4 text-slate-300" />
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No digital lectures found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lectures.map((lecture) => (
        <div key={lecture.id} className="bg-white overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative">
          <div className="aspect-video bg-slate-900 flex items-center justify-center relative overflow-hidden group-hover:scale-95 transition-transform duration-500 rounded-b-[2rem]">
            <Monitor className="h-12 w-12 text-white opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-[0.2em]">Syllabus Resource</span>
            </div>
          </div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">{lecture.title}</h3>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{lecture.subjects?.name}</p>
              </div>
              <button 
                onClick={() => onDelete(lecture.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <a 
              href={lecture.content_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-6 w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-slate-600 hover:bg-slate-900 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              <ExternalLink className="h-4 w-4" /> Launch Resource
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};
