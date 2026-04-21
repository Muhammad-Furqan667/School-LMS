import React from 'react';
import { BookOpen } from 'lucide-react';

interface ParentDiaryViewProps {
  diary: any[];
  childName: string;
  parentName: string;
}

export const ParentDiaryView: React.FC<ParentDiaryViewProps> = ({ diary, childName, parentName }) => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
           Classroom Diary
        </h1>
        <p className="text-slate-500 font-medium mt-1">Verified Identity: {parentName}</p>
      </div>
    </div>
    
    <section className="bg-surface rounded-3xl border border-slate-200 p-8 shadow-sm">
       <h2 className="text-2xl font-black text-slate-900 mb-8">Daily Classroom Log</h2>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diary.map((entry) => (
            <div key={entry.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200">
               <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                     <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                     <p className="font-black text-slate-900 text-sm uppercase">{entry.assignment?.subject?.name || 'Class Update'}</p>
                     <p className="text-[10px] text-slate-400 font-bold uppercase">{entry.assignment?.teacher?.full_name || 'Faculty Member'}</p>
                  </div>
               </div>
               <p className="text-slate-600 text-sm leading-relaxed">{entry.content}</p>
               <p className="text-[10px] text-slate-400 font-black mt-4 uppercase tracking-tighter">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
            </div>
          ))}
       </div>
    </section>
  </div>
);
