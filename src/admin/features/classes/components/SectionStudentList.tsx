import React, { useEffect, useState } from 'react';
import { X, Search, User, CreditCard, ChevronRight } from 'lucide-react';
import { SchoolService } from '../../../../services/schoolService';
import type { Class } from '../types/class.types';

interface SectionStudentListProps {
  selectedClass: Class;
  onClose: () => void;
  onSelectStudent: (student: any) => void;
}

export const SectionStudentList: React.FC<SectionStudentListProps> = ({
  selectedClass,
  onClose,
  onSelectStudent
}) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        // Using a custom query or getStudents filtered by class
        const data = await SchoolService.getStudents(selectedClass.id);
        setStudents(data || []);
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass.id]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.father_name && s.father_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 h-[85vh]">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Grade {selectedClass.grade}{selectedClass.section} · Registry
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
              {selectedClass.academic_years?.year_label} Session · {students.length} Enrolled
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.print()}
              className="hidden md:flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
            >
              Print Registry
            </button>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search by name, roll or father..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all w-full md:w-64"
              />
            </div>
            <button onClick={onClose} className="p-4 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Class Data...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="h-20 w-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                <User className="h-10 w-10 text-slate-200" />
              </div>
              <p className="text-slate-900 font-black">No students found</p>
              <p className="text-xs text-slate-400 font-medium">Try a different search term or check enrollment.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="grid grid-cols-12 px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <div className="col-span-4">Student Info</div>
                <div className="col-span-3">Father Name</div>
                <div className="col-span-2 text-center">Reg ID</div>
                <div className="col-span-2 text-center">Status / Fees</div>
                <div className="col-span-1"></div>
              </div>
              {filteredStudents.map((student) => {
                const hasDues = (student.fees || []).some((f: any) => f.status?.toLowerCase() !== 'paid');
                return (
                  <div 
                    key={student.id}
                    onClick={() => onSelectStudent(student)}
                    className="grid grid-cols-12 items-center px-6 py-5 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all cursor-pointer group"
                  >
                    <div className="col-span-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        {student.name[0]}
                      </div>
                      <span className="font-black text-slate-900">{student.name}</span>
                    </div>
                    <div className="col-span-3 text-slate-500 font-bold text-xs">
                      {student.father_name || '---'}
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="px-3 py-1 bg-slate-50 rounded-lg font-mono text-[10px] font-black text-slate-400">
                        {student.roll_no}
                      </span>
                    </div>
                    <div className="col-span-2 flex flex-col items-center gap-1">
                      <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                        student.status?.toLowerCase() === 'active' || !student.status ? 'bg-emerald-50 text-emerald-600' :
                        student.status?.toLowerCase() === 'suspended' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {student.status || 'Active'}
                      </span>
                      <span className={`flex items-center gap-1 text-[8px] font-black uppercase tracking-widest ${hasDues ? 'text-red-500' : 'text-emerald-500'}`}>
                        <CreditCard className="h-3 w-3" />
                        {hasDues ? 'Dues' : 'Cleared'}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
