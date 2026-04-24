import React, { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, ArrowRight, User } from 'lucide-react';
import { SchoolService } from '../../services/schoolService';
import { toast } from 'sonner';

interface MyStudentsProps {
  teacher: any;
  assignments: any[];
}

export const MyStudents: React.FC<MyStudentsProps> = ({ teacher, assignments }) => {
  const [loading, setLoading] = useState(true);
  const [classWiseStudents, setClassWiseStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, [assignments]);

  const fetchStudents = async () => {
    if (!assignments || assignments.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get unique classes from assignments
      const uniqueClassIds = Array.from(new Set(assignments.map(a => a.class_id))).filter(Boolean);
      
      const studentsPromises = uniqueClassIds.map(async (classId) => {
        const students = await SchoolService.getStudentsByClass(classId);
        const classData = assignments.find(a => a.class_id === classId)?.class;
        return {
          classId,
          classLabel: `Grade ${classData?.grade}${classData?.section}`,
          session: classData?.academic_years?.year_label,
          isCurrentSession: classData?.academic_years?.is_current,
          students: students || [],
          grade: classData?.grade,
          section: classData?.section
        };
      });

  const results = await Promise.all(studentsPromises);
      setClassWiseStudents(results);
    } catch (error) {
      toast.error('Failed to load student registry');
    } finally {
      setLoading(false);
    }
  };

  // Group classes by session
  const sessions = Array.from(new Set(classWiseStudents.map(cw => cw.session))).sort().reverse();
  const groupedBySession = sessions.map(session => ({
    session,
    isCurrent: classWiseStudents.find(cw => cw.session === session)?.isCurrentSession,
    classes: classWiseStudents.filter(cw => cw.session === session)
  }));

  const currentClass = classWiseStudents.find(cw => cw.classId === selectedClass);
  const filteredStudents = currentClass?.students.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            {selectedClass && (
              <button 
                onClick={() => setSelectedClass(null)}
                className="h-10 w-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center transition-all"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </button>
            )}
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {selectedClass ? currentClass?.classLabel : 'Student Registry'}
            </h1>
          </div>
          <p className="text-slate-500 font-medium">
            {selectedClass 
              ? `Manage students for ${currentClass?.classLabel}` 
              : 'Explore and manage your student directory by session and class.'}
          </p>
        </div>
        
        {selectedClass && (
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border-2 border-slate-100 rounded-3xl outline-none focus:border-indigo-600/30 focus:ring-4 focus:ring-indigo-500/5 transition-all font-medium text-slate-600"
            />
          </div>
        )}
      </div>

      {!selectedClass ? (
        <div className="space-y-12">
          {groupedBySession.map((group) => (
            <div key={group.session} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`h-2.5 w-2.5 rounded-full shadow-lg ${
                  group.isCurrent 
                    ? 'bg-emerald-500 shadow-emerald-200 animate-pulse ring-4 ring-emerald-50' 
                    : 'bg-white border-2 border-slate-100 shadow-sm'
                }`} />
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  {group.session} Academic Session
                  {group.isCurrent && <span className="ml-4 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase tracking-widest">Live Cycle</span>}
                </h2>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.classes.map((cw) => (
                  <button 
                    key={cw.classId}
                    onClick={() => setSelectedClass(cw.classId)}
                    className={`bg-white border-2 rounded-[2.5rem] p-8 text-left shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${
                      group.isCurrent ? 'border-emerald-50/50 hover:border-emerald-200' : 'border-slate-50 hover:border-slate-200'
                    }`}
                  >
                    {group.isCurrent && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-150" />
                    )}
                    <div className="flex items-start justify-between mb-8">
                      <div className={`h-16 w-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                        group.isCurrent 
                          ? 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white shadow-emerald-100' 
                          : 'bg-slate-50 text-slate-400 group-hover:bg-slate-600 group-hover:text-white'
                      }`}>
                        <GraduationCap className="h-8 w-8" />
                      </div>
                      {group.isCurrent && (
                        <div className="px-3 py-1 bg-emerald-600 text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">Current</div>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{cw.classLabel}</h3>
                    <p className="text-slate-500 font-medium mb-8">Total enrollment: {cw.students.length} students</p>
                    
                    <div className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${group.isCurrent ? 'text-emerald-600' : 'text-slate-400'}`}>
                      Explore Directory <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {classWiseStudents.length === 0 && (
             <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-slate-200" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No Classes Assigned</h3>
               <p className="text-slate-400 max-w-xs mx-auto">Contact the administrator to check your current teaching schedule.</p>
             </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
               <p className="text-slate-400 font-medium">No students found matching your search in this class.</p>
            </div>
          ) : (
            filteredStudents.map((student: any) => (
              <div key={student.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
                <div className="flex items-start justify-between mb-6">
                   <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-500">
                      <User className="h-7 w-7 text-slate-300 group-hover:text-white" />
                   </div>
                   <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">
                      #{student.roll_no}
                   </span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{student.name}</h3>
                <p className="text-sm font-medium text-slate-400 mb-6 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500" />
                   Active Student
                </p>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Contact Info
                      <p className="text-slate-900 mt-0.5 normal-case tracking-normal font-bold">Guardian Access Enabled</p>
                   </div>
                   <div className="h-8 w-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                      <ArrowRight className="h-4 w-4" />
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
