import React, { useState, useEffect } from 'react';
import { SchoolService } from '../../../../services/schoolService';
import { 
  User, 
  Search, 
  X, 
  CreditCard,
  ChevronRight,
  Printer
} from 'lucide-react';

interface SectionStudentListProps {
  selectedClass: any;
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.father_name && s.father_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 h-[85vh] printable-area">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Class Registry</h3>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                {selectedClass.grade} {selectedClass.section}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bold tracking-tight uppercase">Institutional Enrollment List · {students.length} Total</p>
          </div>
          
          <div className="flex items-center gap-4 no-print">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search name, roll no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all w-64"
              />
            </div>
            <button 
              onClick={() => window.print()}
              className="h-12 w-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button 
              onClick={onClose}
              className="h-12 w-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="h-12 w-12 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Compiling Records...</p>
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

              {/* Paginated List (Visible on Screen, Hidden on Print) */}
              <div className="space-y-3 print:hidden">
                {paginatedStudents.map((student) => (
                  <StudentRow key={student.id} student={student} onSelect={onSelectStudent} />
                ))}
              </div>

              {/* Full List (Hidden on Screen, Visible on Print) */}
              <div className="hidden print:block space-y-3">
                {filteredStudents.map((student) => (
                  <StudentRow key={student.id} student={student} onSelect={onSelectStudent} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-100 no-print">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing {paginatedStudents.length} of {filteredStudents.length} Students · Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50 transition-all"
                    >
                      Previous
                    </button>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentRow = ({ student, onSelect }: { student: any, onSelect: (s: any) => void }) => {
  const hasDues = (student.fees || []).some((f: any) => f.status?.toLowerCase() !== 'paid');
  return (
    <div 
      onClick={() => onSelect(student)}
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
      <div className="col-span-1 flex justify-end print:hidden">
        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
      </div>
    </div>
  );
};
