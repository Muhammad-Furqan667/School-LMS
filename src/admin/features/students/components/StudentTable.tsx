import React from 'react';
import { Users, Edit3, Trash2 } from 'lucide-react';
import type { Student } from '../types/student.types';

interface StudentTableProps {
  filteredStudents: Student[];
  selectedStudent: Student | null;
  loading: boolean;
  openStudentDetail: (student: Student) => void;
  handleOpenEditModal: (student?: Student) => void;
  handleDeleteStudent: (id: string, callback?: () => void) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  filteredStudents,
  selectedStudent,
  loading,
  openStudentDetail,
  handleOpenEditModal,
  handleDeleteStudent,
}) => {
  return (
    <div className={`bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all ${selectedStudent ? 'xl:flex-1' : 'w-full'}`}>
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="bg-[#f8fafc] border-b border-slate-100">
            <tr>
              <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Student / Father</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Grade</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Roll No</th>
              <th className="px-6 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                className={`hover:bg-slate-50/80 transition-all group cursor-pointer ${selectedStudent?.id === student.id ? 'bg-emerald-50/50' : ''}`}
                onClick={() => openStudentDetail(student)}
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-400 text-lg shadow-sm group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300">
                      {student.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-base leading-tight group-hover:text-emerald-700 transition-colors">{student.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">S/O: {student.father_name || 'Not Recorded'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <span className="px-4 py-1.5 bg-slate-100 rounded-xl text-xs font-black text-slate-600">
                    {student.classes ? student.classes.grade : 'Unassigned'}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col items-center">
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${student.is_locked
                        ? 'bg-red-50 text-red-600 border-red-100'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                      {student.is_locked ? 'Fees Pending' : 'Verified'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="font-mono text-xs font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">
                    {student.roll_no}
                  </span>
                </td>
                <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-all">
                    <button
                      onClick={() => handleOpenEditModal(student)}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-300 shadow-sm transition-all"
                      title="Edit Profile"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 shadow-sm transition-all"
                      title="Expel Student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && (
        <div className="p-20 flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Syncing Registry...</p>
        </div>
      )}

      {!loading && filteredStudents.length === 0 && (
        <div className="p-20 text-center">
          <div className="h-20 w-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-slate-200" />
          </div>
          <p className="text-slate-400 font-bold mb-1">No students found</p>
          <p className="text-xs text-slate-300 font-medium">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
};
