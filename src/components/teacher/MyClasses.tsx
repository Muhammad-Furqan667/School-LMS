import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Target, 
  BookOpen, 
  Plus, 
  ChevronRight, 
  CheckCircle2, 
  LayoutGrid,
  FileText,
  User
} from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { toast } from 'sonner';

interface MyClassesProps {
  teacher: any;
  assignments: any[];
}

export const MyClasses: React.FC<MyClassesProps> = ({ teacher, assignments }) => {
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<Record<string, string>>({});
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [classHistory, setClassHistory] = useState<any[]>([]);
  
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    total_marks: '100',
    passing_marks: '40',
    date: new Date().toISOString().split('T')[0]
  });

  // Group assignments by Session
  const groupedClasses = assignments.reduce((acc: any, asgn) => {
    const session = asgn.class?.academic_years?.year_label || 'Legacy Session';
    if (!acc[session]) acc[session] = [];
    acc[session].push(asgn);
    return acc;
  }, {});

  const isSessionActive = selectedClass?.class?.academic_years?.is_current;

  const handleSelectClass = async (asgn: any) => {
    setSelectedClass(asgn);
    setSelectedAssessment(null);
    try {
      // For moderated classes, the ID starts with MOD-. We should use the actual assignment_id for diary.
      const diaryAssignmentId = asgn.isModeratorAssignment ? asgn.assignment_id : asgn.id;

      const [assessData, studentData, historyData] = await Promise.all([
        SchoolService.getAssessments(teacher.id, asgn.class_id, asgn.subject_id),
        SchoolService.getStudents(asgn.class_id),
        diaryAssignmentId ? SchoolService.getDiaryEntries(diaryAssignmentId) : Promise.resolve([])
      ]);
      setAssessments(assessData);
      setClassStudents(studentData);
      setClassHistory(historyData);
    } catch (error: any) {
      console.error('Class details fetch error:', error);
      toast.error(`Failed to load class details: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    
    try {
      await SchoolService.createAssessment({
        teacher_id: teacher.id,
        class_id: selectedClass.class_id,
        subject_id: selectedClass.subject_id,
        title: newAssessment.title,
        total_marks: Number(newAssessment.total_marks),
        passing_marks: Number(newAssessment.passing_marks),
        date: newAssessment.date
      });
      
      toast.success('Assessment category created!');
      setIsAssessmentModalOpen(false);
      setNewAssessment({ 
        title: '', 
        total_marks: '100', 
        passing_marks: '40',
        date: new Date().toISOString().split('T')[0] 
      });
      
      // Refresh
      const assessData = await SchoolService.getAssessments(teacher.id, selectedClass.class_id, selectedClass.subject_id);
      setAssessments(assessData);
    } catch (error) {
      toast.error('Failed to create assessment');
    }
  };

  const handleSelectAssessment = async (assess: any) => {
    setSelectedAssessment(assess);
    try {
      const results = await SchoolService.getAssessmentResults(assess.id);
      const marksMap: Record<string, string> = {};
      results.forEach((r: any) => {
        marksMap[r.student_id] = r.marks_obtained?.toString() || '';
      });
      setMarksData(marksMap);
    } catch (error) {
      toast.error('Failed to load assessment results');
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedAssessment) return;
    
    const results = classStudents.map(student => {
      const obtained = Number(marksData[student.id] || 0);
      const passMarks = Number(selectedAssessment.passing_marks || selectedAssessment.total_marks * 0.4);
      
      return {
        student_id: student.id,
        assessment_id: selectedAssessment.id,
        subject_id: selectedClass.subject_id,
        marks_obtained: obtained,
        total_marks: selectedAssessment.total_marks,
        grade: calculateGrade(obtained, selectedAssessment.total_marks),
        status: obtained >= passMarks ? 'pass' : 'fail',
        academic_year_id: selectedClass.class?.academic_year_id,
        exam_type: 'quiz'
      };
    });

    try {
      await SchoolService.bulkUpsertResults(results);
      toast.success('Marks updated successfully!');
      setSelectedAssessment(null);
    } catch (error) {
      toast.error('Failed to save marks');
    }
  };

  const calculateGrade = (obtained: number, total: number) => {
    const percentage = (obtained / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Classes</h1>
          <p className="text-slate-500">Select a structural batch to manage academics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Classes Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          {Object.keys(groupedClasses).sort().reverse().map((session) => {
            const sessionClasses = groupedClasses[session];
            const isCurrent = sessionClasses.some((asgn: any) => asgn.class?.academic_years?.is_current);
            
            return (
              <div key={session} className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                   <div className={`h-2 w-2 rounded-full shadow-lg ${
                     isCurrent 
                       ? 'bg-emerald-500 shadow-emerald-200 animate-pulse ring-2 ring-emerald-50' 
                       : 'bg-white border border-slate-200'
                   }`} />
                   <p className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {session}
                      {isCurrent && <span className="ml-2 text-[8px] opacity-60">Active Cycle</span>}
                   </p>
                   <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="space-y-3">
                  {sessionClasses.map((asgn: any) => (
                    <button
                      key={asgn.id}
                      onClick={() => handleSelectClass(asgn)}
                      className={`w-full p-6 rounded-[2rem] border-2 text-left transition-all group overflow-hidden relative ${
                        selectedClass?.id === asgn.id 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                          : 'bg-white border-slate-50 hover:border-indigo-100 hover:shadow-lg'
                      }`}
                    >
                      {selectedClass?.id === asgn.id && isCurrent && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                      )}
                      <div className="flex justify-between items-start relative z-10">
                        <div>
                          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                            selectedClass?.id === asgn.id ? 'text-indigo-400' : 'text-slate-400'
                          }`}>
                            {asgn.subject?.name}
                          </p>
                          <h3 className="text-xl font-black leading-none">Grade {asgn.class?.grade}{asgn.class?.section}</h3>
                        </div>
                        <ChevronRight className={`h-5 w-5 transition-transform ${selectedClass?.id === asgn.id ? 'translate-x-1' : 'text-slate-300'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detail View */}
        <div className="lg:col-span-8">
          {!selectedClass ? (
            <div className="h-full flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
               <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <LayoutGrid className="h-10 w-10 text-slate-200" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Select a Batch</h3>
               <p className="text-slate-400 max-w-xs mx-auto">Pick one of your assigned classes from the sidebar to view academic progress.</p>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              {/* Header Info */}
              <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                      <span className="px-4 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                         {selectedClass.class?.academic_years?.year_label}
                      </span>
                      {isSessionActive ? (
                        <span className="px-4 py-1 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                           Active Cycle
                        </span>
                      ) : (
                        <span className="px-4 py-1 bg-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                           Archived / Locked
                        </span>
                      )}
                   </div>
                   <h2 className="text-5xl font-black mb-2">Grade {selectedClass.class?.grade}{selectedClass.class?.section}</h2>
                   <p className="text-indigo-200 text-lg font-bold">{selectedClass.subject?.name} Academic Record</p>
                   {!isSessionActive && (
                     <div className="mt-6 flex items-center gap-2 text-amber-300 bg-amber-900/30 w-fit px-6 py-2 rounded-2xl border border-amber-500/30 backdrop-blur-sm animate-pulse">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Historical Session: Data is Read-Only</span>
                     </div>
                   )}
                </div>
                <Users className="absolute -right-8 -bottom-8 h-64 w-64 text-white opacity-[0.03] pointer-events-none" />
              </div>

              {/* Tabs / Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Academic History */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <BookOpen className="h-4 w-4" /> Weekly Coverage
                       </h3>
                    </div>
                    <div className="space-y-4">
                       {classHistory.slice(0, 3).map(entry => (
                         <div key={entry.id} className="p-6 bg-white border border-slate-100 rounded-3xl">
                            <p className="text-slate-600 text-sm italic mb-4 leading-relaxed">"{entry.content}"</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                               {new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                            </p>
                         </div>
                       ))}
                       {classHistory.length === 0 && (
                          <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No diary entries found</p>
                          </div>
                       )}
                    </div>
                 </div>

                 {/* Assessment Categories */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                          <Target className="h-4 w-4" /> Assessment HUB
                       </h3>
                       {isSessionActive && (
                         <button 
                           onClick={() => setIsAssessmentModalOpen(true)}
                           className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                         >
                            <Plus className="h-4 w-4" />
                         </button>
                       )}
                    </div>
                    
                    <div className="space-y-3">
                       {assessments.map(assess => (
                         <button
                           key={assess.id}
                           onClick={() => handleSelectAssessment(assess)}
                           className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${
                             selectedAssessment?.id === assess.id 
                               ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                               : 'bg-white border-slate-50 hover:border-slate-100'
                           }`}
                         >
                            <div className="flex items-center gap-4">
                               <div className="h-12 w-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center shadow-sm">
                                  <FileText className="h-6 w-6 text-indigo-600" />
                               </div>
                               <div className="text-left">
                                  <h4 className="font-black text-slate-900 text-sm">{assess.title}</h4>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{assess.total_marks} Marks • {new Date(assess.date).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <ChevronRight className={`h-4 w-4 transition-transform ${selectedAssessment?.id === assess.id ? 'translate-x-1 text-indigo-600' : 'text-slate-300'}`} />
                         </button>
                       ))}
                       {assessments.length === 0 && (
                         <div className="p-10 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Create your first assessment</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>

              {/* Marks Entry View */}
              {selectedAssessment && (
                 <div className="bg-white border-2 border-indigo-100 rounded-[3rem] p-10 animate-in zoom-in-95 duration-300 shadow-2xl shadow-indigo-500/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                       <div>
                          <div className="flex items-center gap-2 mb-2">
                             <Target className="h-5 w-5 text-indigo-600" />
                             <h3 className="text-2xl font-black text-slate-900">{selectedAssessment.title}</h3>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             Recording results for Grade {selectedClass.class?.grade}{selectedClass.class?.section} • {selectedClass.subject?.name}
                          </p>
                       </div>
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={() => setSelectedAssessment(null)}
                            className="px-6 py-3 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all text-xs uppercase"
                          >
                             Cancel
                          </button>
                          <button 
                            onClick={handleSaveMarks}
                            disabled={!isSessionActive}
                            className={`px-8 py-3 font-black rounded-2xl transition-all text-xs uppercase shadow-xl flex items-center gap-2 ${
                              isSessionActive 
                                ? 'bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-200' 
                                : 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed'
                            }`}
                          >
                             <CheckCircle2 className="h-4 w-4" /> {isSessionActive ? 'Publish Results' : 'Results Locked'}
                          </button>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="grid grid-cols-12 px-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <div className="col-span-2">Roll No</div>
                          <div className="col-span-7">Student Identity</div>
                          <div className="col-span-3 text-right">Obtained / {selectedAssessment.total_marks}</div>
                       </div>
                       <div className="space-y-2 max-h-[400px] overflow-auto pr-2 custom-scrollbar">
                          {classStudents.map(student => (
                             <div key={student.id} className="grid grid-cols-12 items-center px-6 py-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 transition-all">
                                <div className="col-span-2">
                                   <span className="font-black text-slate-400">#{student.roll_no}</span>
                                </div>
                                <div className="col-span-7 flex items-center gap-3">
                                   <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center">
                                      <User className="h-4 w-4 text-slate-400" />
                                   </div>
                                   <span className="font-bold text-slate-900">{student.name}</span>
                                </div>
                                <div className="col-span-3">
                                   <input 
                                     type="number"
                                     value={marksData[student.id] || ''}
                                     onChange={(e) => setMarksData({...marksData, [student.id]: e.target.value})}
                                     className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-right font-black focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                                     placeholder="0"
                                     max={selectedAssessment.total_marks}
                                   />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Assessment Modal */}
      {isAssessmentModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsAssessmentModalOpen(false)} />
          <div className="relative bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-10">
               <div>
                  <h2 className="text-2xl font-black">Create Assessment</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Define new grading criteria</p>
               </div>
               <button onClick={() => setIsAssessmentModalOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                  <Plus className="h-5 w-5 transform rotate-45"/>
               </button>
             </div>
             <form onSubmit={handleCreateAssessment} className="space-y-6">
                <div>
                   <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Assessment Title</label>
                   <input 
                     required
                     value={newAssessment.title}
                     onChange={(e) => setNewAssessment({...newAssessment, title: e.target.value})}
                     className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all"
                     placeholder="e.g. Mid-Term Test #1"
                   />
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Total Marks</label>
                      <input 
                        required
                        type="number"
                        value={newAssessment.total_marks}
                        onChange={(e) => setNewAssessment({...newAssessment, total_marks: e.target.value})}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all"
                        placeholder="100"
                      />
                   </div>
                   <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Pass Marks</label>
                      <input 
                        required
                        type="number"
                        value={newAssessment.passing_marks}
                        onChange={(e) => setNewAssessment({...newAssessment, passing_marks: e.target.value})}
                        className="w-full p-5 bg-emerald-50 border border-emerald-100 rounded-2xl outline-none font-black text-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                        placeholder="40"
                      />
                   </div>
                   <div>
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Test Date</label>
                      <input 
                        required
                        type="date"
                        value={newAssessment.date}
                        onChange={(e) => setNewAssessment({...newAssessment, date: e.target.value})}
                        className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all"
                      />
                   </div>
                </div>
                <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200">
                   Initialize Assessment Category
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
