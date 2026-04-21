import React, { useState } from 'react';
import { BookOpen, Monitor, Plus, Filter, X, ChevronRight, Layers, ArrowLeft } from 'lucide-react';
import { useCourses } from '../hooks/useCourses';
import { useLectures } from '../hooks/useLectures';
import { CourseGrid } from './CourseGrid';
import { LectureGrid } from './LectureGrid';
import { SchoolService } from '../../../../services/schoolService';
import { AssignTaskModal } from '../../tasks/components/AssignTaskModal';
import { useTeacherTasks } from '../../tasks/hooks/useTeacherTasks';

interface CurriculumFeatureProps {
  defaultView?: 'selection' | 'courses' | 'lectures';
}

export const CurriculumFeature: React.FC<CurriculumFeatureProps> = ({ defaultView = 'selection' }) => {
  const [view, setView] = useState<'selection' | 'courses' | 'lectures' | 'tasks'>('selection');
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  
  const [isAddLectureModalOpen, setIsAddLectureModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);

  const [lectureForm, setLectureForm] = useState({
    title: '',
    content_url: '',
    subject_id: ''
  });

  const { 
    courses, 
    loading: coursesLoading, 
    handleAddCourse, 
    handleDeleteCourse 
  } = useCourses(selectedGrade);
  
  const { 
    subjects, 
    lectures, 
    loading: lecturesLoading, 
    handleCreateLecture, 
    handleDeleteLecture 
  } = useLectures();

  const {
    handleCreateTask,
  } = useTeacherTasks();

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  const fetchAssignmentsData = async () => {
    try {
      const data = await SchoolService.getAllTeacherAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    }
  };

  const onAddCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleAddCourse(newCourseName, () => {
      setIsAddCourseModalOpen(false);
      setNewCourseName('');
    });
  };

  const onAddLectureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleCreateLecture(lectureForm, () => {
      setIsAddLectureModalOpen(false);
      setLectureForm({ title: '', content_url: '', subject_id: '' });
    });
  };

  const onAssignTaskSubmit = async (task: any) => {
    await handleCreateTask(task, () => {
      setIsAssignTaskModalOpen(false);
    });
  };

  if (view === 'selection') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
        <div className="px-1">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Curriculum Hub</h1>
          <p className="text-slate-500 font-medium mt-2 md:text-lg">Select a domain to manage academic subjects or digital lecture resources.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button 
            onClick={() => setView('courses')}
            className="group relative bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <BookOpen className="h-40 w-40" />
            </div>
            <div className="h-20 w-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-indigo-500/20">
              <BookOpen className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2">Subject Directory</h3>
            <p className="text-slate-500 font-medium leading-relaxed max-w-xs transition-colors">Manage classroom courses across all grades and academic sessions.</p>
            <div className="mt-8 flex items-center gap-2 text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">
              Explore Library <ChevronRight className="h-4 w-4" />
            </div>
          </button>

          <button 
            onClick={() => setView('lectures')}
            className="group relative bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Monitor className="h-40 w-40" />
            </div>
            <div className="h-20 w-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-emerald-500/20">
              <Monitor className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2">Video Syllabus</h3>
            <p className="text-slate-500 font-medium leading-relaxed max-w-xs transition-colors">Digital lecture repository for distance learning and classroom support.</p>
            <div className="mt-8 flex items-center gap-2 text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px]">
              Manage Academy <ChevronRight className="h-4 w-4" />
            </div>
          </button>
          <button 
            onClick={() => {
              setView('tasks');
              fetchAssignmentsData();
            }}
            className="group relative bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Plus className="h-40 w-40" />
            </div>
            <div className="h-20 w-20 bg-amber-500 rounded-3xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform shadow-xl shadow-amber-500/20">
              <Plus className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2">Lesson Planner</h3>
            <p className="text-slate-500 font-medium leading-relaxed max-w-xs transition-colors">Assign specific teaching objectives and tasks to faculty members.</p>
            <div className="mt-8 flex items-center gap-2 text-amber-600 font-black uppercase tracking-[0.2em] text-[10px]">
              Direct Faculty <ChevronRight className="h-4 w-4" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'courses') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
          <div className="flex items-center gap-6">
            <button onClick={() => setView('selection')} className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">Subject Directory</h1>
              <p className="text-slate-500 font-medium mt-2">Managing courses for Grade {selectedGrade || '...'}</p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="relative group min-w-[140px]">
                <select 
                   value={selectedGrade || ''} 
                   onChange={(e) => setSelectedGrade(e.target.value)}
                   className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none appearance-none font-black text-xs uppercase tracking-widest cursor-pointer shadow-sm focus:ring-4 focus:ring-indigo-500/5 transition-all pr-10"
                >
                   <option value="">Select Grade</option>
                   {grades.map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
             </div>
             {selectedGrade && (
               <button 
                 onClick={() => setIsAddCourseModalOpen(true)}
                 className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 active:scale-95 transition-all"
               >
                 <Plus className="h-4 w-4" /> New Course
               </button>
             )}
          </div>
        </div>

        {!selectedGrade ? (
          <div className="py-32 flex flex-col items-center justify-center text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-sm border-dashed">
            <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6">
              <Layers className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Select an Academic Level</h3>
            <p className="text-slate-400 font-medium max-w-xs">Select a grade from the menu above to view or modify its assigned syllabus.</p>
          </div>
        ) : (
          <CourseGrid courses={courses} loading={coursesLoading} onDelete={handleDeleteCourse} />
        )}

        {isAddCourseModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAddCourseModalOpen(false)} />
            <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Define Subject</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Grade {selectedGrade} Academic Catalog</p>
                  </div>
                  <button onClick={() => setIsAddCourseModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
               </div>
               <form onSubmit={onAddCourseSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Nomenclature</label>
                    <input 
                      required 
                      value={newCourseName} 
                      onChange={(e) => setNewCourseName(e.target.value)} 
                      placeholder="e.g. Advanced Physics" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none focus:ring-4 focus:ring-indigo-500/5 font-bold text-slate-900 transition-all"
                    />
                  </div>
                  <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:shadow-xl hover:bg-indigo-600 transition-all active:scale-[0.98]">
                    Add to Grade {selectedGrade} Syllabus
                  </button>
               </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'tasks') {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-center">
         <div className="flex items-center gap-6 px-1 text-left">
            <button onClick={() => setView('selection')} className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">Lesson Planner</h1>
              <p className="text-slate-500 font-medium mt-2">Manage and assign new directives to your faculty.</p>
            </div>
         </div>

         <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[3.5rem] border border-slate-100 shadow-sm border-dashed">
            <div className="h-24 w-24 bg-amber-50 rounded-[2.5rem] flex items-center justify-center text-amber-500 mb-8 shadow-xl shadow-amber-500/10">
              <Plus className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Ready to Assign?</h3>
            <p className="text-slate-400 font-medium max-w-sm mb-12">
               Begin by creating a new directive. Lessons assigned here will automatically appear in the teacher's dashboard and profile record.
            </p>
            <button 
               onClick={() => setIsAssignTaskModalOpen(true)}
               className="flex items-center justify-center gap-3 px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-600 transition-all hover:scale-105 active:scale-95"
            >
               <Plus className="h-5 w-5" /> Issue New Directive
            </button>
         </div>

         {isAssignTaskModalOpen && (
           <AssignTaskModal 
              assignments={assignments}
              onClose={() => setIsAssignTaskModalOpen(false)}
              onSubmit={onAssignTaskSubmit}
           />
         )}
      </div>
    );
  }

  // Lecture View
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-6">
          <button onClick={() => setView('selection')} className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">Video Syllabus</h1>
            <p className="text-slate-500 font-medium mt-2">Digital academy resource repository.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddLectureModalOpen(true)}
          className="flex items-center justify-center gap-2 px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-600 hover:shadow-emerald-500/20 active:scale-95 transition-all w-full lg:w-auto"
        >
          <Plus className="h-4 w-4" /> Publish New Lecture
        </button>
      </div>

      <LectureGrid lectures={lectures} loading={lecturesLoading} onDelete={handleDeleteLecture} />

      {isAddLectureModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAddLectureModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-8">
                <div>
                   <h2 className="text-2xl font-black text-slate-900">Publish Resource</h2>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Digital Academy Content</p>
                </div>
                <button onClick={() => setIsAddLectureModalOpen(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-colors">
                   <X className="h-5 w-5" />
                </button>
             </div>
             <form onSubmit={onAddLectureSubmit} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Subject</label>
                   <select 
                     required 
                     value={lectureForm.subject_id} 
                     onChange={(e) => setLectureForm({...lectureForm, subject_id: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none font-bold text-slate-900 appearance-none"
                   >
                     <option value="">Choose Catalog...</option>
                     {subjects.map(s => <option key={s.id} value={s.id}>{s.name} (G-{s.grade_level})</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lecture Title</label>
                   <input 
                     required 
                     value={lectureForm.title} 
                     onChange={(e) => setLectureForm({...lectureForm, title: e.target.value})} 
                     placeholder="e.g. Intro to Mechanics" 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none font-bold text-slate-900"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource URL (Video Link)</label>
                   <input 
                     required 
                     value={lectureForm.content_url} 
                     onChange={(e) => setLectureForm({...lectureForm, content_url: e.target.value})} 
                     placeholder="e.g. youtube.com/..." 
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 outline-none font-bold text-slate-900"
                   />
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
                   Publish to Repository
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
