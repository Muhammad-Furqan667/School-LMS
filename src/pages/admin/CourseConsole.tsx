import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  ChevronRight, 
  X, 
  Layers, 
  Search,
  Book,
  ArrowLeft
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { toast } from 'sonner';

export const CourseConsole: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  useEffect(() => {
    if (selectedGrade) {
      fetchCourses();
    }
  }, [selectedGrade]);

  const fetchCourses = async () => {
    if (!selectedGrade) return;
    setLoading(true);
    try {
      const data = await SchoolService.getSubjectsByGrade(selectedGrade);
      setCourses(data || []);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrade || !newCourseName.trim()) return;

    try {
      await SchoolService.createSubject(newCourseName, selectedGrade);
      toast.success('Course added successfully');
      setNewCourseName('');
      setIsAddModalOpen(false);
      fetchCourses();
    } catch (error) {
      toast.error('Failed to add course');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to remove this course? This will also remove all student results linked to it.')) return;
    try {
      await SchoolService.deleteSubject(id);
      toast.success('Course removed');
      fetchCourses();
    } catch (error) {
      toast.error('Removal failed');
    }
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedGrade) {
    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-4">Course Registry</h1>
          <p className="text-slate-500 font-medium md:text-lg">Select an academic grade to manage its curriculum and courses.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
          {grades.map((grade) => (
            <button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              className="group bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-500 flex flex-col items-center justify-center gap-6 relative overflow-hidden"
            >
              <div className="h-20 w-20 bg-emerald-50 rounded-[1.75rem] flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
                <Book className="h-10 w-10" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Standard</p>
                <h3 className="text-3xl font-black text-slate-900">Grade {grade}</h3>
              </div>
              <div className="h-2 w-full bg-emerald-50 rounded-full overflow-hidden mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-full bg-emerald-500 w-full animate-in slide-in-from-left duration-1000" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Detail Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setSelectedGrade(null)}
            className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="h-6 w-6 text-slate-900" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">Active Curriculum</span>
               <span className="text-slate-300">/</span>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Grade {selectedGrade}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Management Hub</h1>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 hover:bg-slate-800 active:scale-95 transition-all w-full lg:w-auto"
        >
          <Plus className="h-5 w-5" />
          Add New Course
        </button>
      </div>

      {/* Internal Search */}
      <div className="relative group max-w-2xl px-1">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${courses.length} Grade ${selectedGrade} courses...`}
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-3xl shadow-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all font-medium"
        />
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <div 
            key={course.id}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                <BookOpen className="h-7 w-7" />
              </div>
              <button 
                onClick={() => handleDeleteCourse(course.id)}
                className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Standard Subject</p>
              <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">{course.name}</h3>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Status</span>
               </div>
               <ChevronRight className="h-4 w-4 text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
            
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] rotate-12 group-hover:scale-110 transition-transform duration-700">
                <BookOpen className="h-24 w-24" />
            </div>
          </div>
        ))}

        {loading && (
          <div className="col-span-full py-20 flex flex-col items-center gap-4">
             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Syncing Syllabus Data...</p>
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6">
             <div className="h-20 w-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                <Layers className="h-10 w-10" />
             </div>
             <div className="text-center">
                <p className="text-slate-900 font-extrabold text-xl">No courses defined</p>
                <p className="text-slate-400 text-sm font-medium mt-1">Start by adding the first course for Grade {selectedGrade}.</p>
             </div>
             <button 
               onClick={() => setIsAddModalOpen(true)}
               className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
             >
               Configure First Course
             </button>
          </div>
        )}
      </div>

      {/* Add Course Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                    <Plus className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">New Subject Entry</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Assigning to Grade {selectedGrade}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  <X className="h-6 w-6 text-slate-300" />
                </button>
              </div>

              <form onSubmit={handleAddCourse} className="space-y-8">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Official Course Title</label>
                  <input 
                    autoFocus
                    required
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all font-black text-slate-900 placeholder:text-slate-300" 
                    placeholder="e.g. Theoretical Physics" 
                  />
                </div>

                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                   <div className="flex gap-4">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                         <BookOpen className="h-5 w-5" />
                      </div>
                      <p className="text-[10px] font-bold text-emerald-800 leading-relaxed uppercase tracking-wider">
                        Adding this course will make it the standard curriculum for all Grade {selectedGrade} students. You will then be able to record results for this course across the registry.
                      </p>
                   </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-emerald-600 text-white font-black rounded-[2rem] shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  Confirm & Deploy Course
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
