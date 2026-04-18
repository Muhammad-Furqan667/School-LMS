import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Plus, 
  ExternalLink, 
  Trash2, 
  Monitor, 
  BookOpen,
  Filter,
  X,
  Layers,
  Link as LinkIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export const LectureConsole: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [lectures, setLectures] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newLecture, setNewLecture] = useState({
    title: '',
    content_url: '',
    subject_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjectsData, lecturesData] = await Promise.all([
        supabase.from('subjects').select('*'),
        supabase.from('lectures').select('*, subjects(name)')
      ]);
      setSubjects(subjectsData.data || []);
      setLectures(lecturesData.data || []);
    } catch (error) {
      toast.error('Failed to sync syllabus data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLecture.subject_id || !newLecture.title) return;

    try {
      const { error } = await supabase.from('lectures').insert([newLecture]);
      if (error) throw error;
      toast.success('Lecture deployed successfully');
      setIsAddModalOpen(false);
      setNewLecture({ title: '', content_url: '', subject_id: '' });
      fetchData();
    } catch (error) {
      toast.error('Deployment failed');
    }
  };

  const filteredLectures = selectedSubjectId 
    ? lectures.filter(l => l.subject_id === selectedSubjectId)
    : lectures;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Lecture Hub</h1>
            <p className="text-slate-500 font-medium">Coordinate video content and resources for individual subjects.</p>
         </div>
         <button 
           onClick={() => setIsAddModalOpen(true)}
           className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
         >
            <Plus className="h-5 w-5" />
            Upload New Lecture
         </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-4 overflow-hidden">
        <div className="flex items-center gap-3 p-6 border-b border-slate-50 mb-4">
           <Filter className="h-4 w-4 text-slate-400" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Subject</p>
           <select 
             value={selectedSubjectId}
             onChange={(e) => setSelectedSubjectId(e.target.value)}
             className="ml-4 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none"
           >
              <option value="">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name} (Grade {s.grade_level})</option>
              ))}
           </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
           {filteredLectures.map((lecture) => (
             <div key={lecture.id} className="bg-[#f8fafc] border border-slate-100 rounded-[2rem] p-8 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative">
                <div className="flex items-start justify-between mb-6">
                   <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-[1.25rem] flex items-center justify-center shadow-sm">
                      <PlayCircle className="h-6 w-6" />
                   </div>
                   <button className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                   </button>
                </div>

                <div className="space-y-1 mb-6">
                   <h3 className="font-black text-slate-900 leading-snug h-12 line-clamp-2">{lecture.title}</h3>
                   <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{lecture.subjects?.name}</p>
                </div>

                <a 
                  href={lecture.content_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-xs font-black text-slate-600 hover:text-emerald-600 hover:border-emerald-600 transition-all shadow-sm"
                >
                   <ExternalLink className="h-4 w-4" />
                   Review Stream Link
                </a>
             </div>
           ))}
        </div>

        {loading && (
          <div className="p-20 flex justify-center w-full">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          </div>
        )}

        {!loading && filteredLectures.length === 0 && (
          <div className="p-20 text-center">
             <Monitor className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-bold">No lectures found for this criteria.</p>
          </div>
        )}
      </div>

      {/* Add Lecture Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
           <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl p-10 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 font-outfit">Deploy New Lecture</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Connect video infrastructure</p>
                 </div>
                 <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                   <X className="h-6 w-6 text-slate-400" />
                 </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Selection</label>
                    <div className="relative">
                       <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <select 
                         required
                         value={newLecture.subject_id}
                         onChange={(e) => setNewLecture({ ...newLecture, subject_id: e.target.value })}
                         className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none"
                       >
                          <option value="">Select Target Subject</option>
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name} (Grade {s.grade_level})</option>
                          ))}
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Lecture Title</label>
                    <div className="relative">
                       <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <input 
                         required
                         type="text"
                         value={newLecture.title}
                         onChange={(e) => setNewLecture({ ...newLecture, title: e.target.value })}
                         className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" 
                         placeholder="e.g. Introduction to Fractions"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Stream / Resource URL</label>
                    <div className="relative">
                       <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                       <input 
                         required
                         type="url"
                         value={newLecture.content_url}
                         onChange={(e) => setNewLecture({ ...newLecture, content_url: e.target.value })}
                         className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none border-b-2 border-b-emerald-500/10" 
                         placeholder="https://youtube.com/..."
                       />
                    </div>
                 </div>

                 <button 
                   type="submit"
                   className="w-full py-5 bg-slate-900 text-white font-black rounded-[1.5rem] shadow-xl shadow-slate-200 active:scale-95 transition-all text-sm tracking-wide"
                 >
                    Push to Student Dashboards
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
