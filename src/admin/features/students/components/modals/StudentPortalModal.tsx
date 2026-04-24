import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Class, Student, FeeFormState, AcademicResults } from '../../types/student.types';
import { ProfileTab } from './portal/ProfileTab';
import { AcademicsTab } from './portal/AcademicsTab';
import { AttendanceTab } from './portal/AttendanceTab';

interface StudentPortalModalProps {
  selectedStudent: Student;
  closeDetail: () => void;
  // Profile Props
  classes: Class[];
  studentFees: any[];
  loadingFees: boolean;
  setFeeForm: React.Dispatch<React.SetStateAction<FeeFormState>>;
  setIsFeeModalOpen: (val: boolean) => void;
  handleOpenEditModal: (student?: Student) => void;
  fetchAll: () => void;
  // Academics Props
  academicResults: AcademicResults;
  fetchAcademicResults: (student: Student) => void;
  handleUpdateResult: (result: any, status: 'pass' | 'fail' | 'pending', student: Student) => Promise<void>;
}

export const StudentPortalModal: React.FC<StudentPortalModalProps> = ({
  selectedStudent,
  closeDetail,
  studentFees,
  loadingFees,
  setFeeForm,
  setIsFeeModalOpen,
  handleOpenEditModal,
  fetchAll,
  academicResults,
  fetchAcademicResults,
  handleUpdateResult,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'academics' | 'attendance'>('profile');

  useEffect(() => {
    if (activeTab === 'academics') {
      fetchAcademicResults(selectedStudent);
    }
  }, [selectedStudent, activeTab, fetchAcademicResults]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md" onClick={closeDetail} />
      <div className="relative bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300 h-[90vh] md:h-auto md:max-h-[85vh]">
        
        {/* Sidebar */}
        <div className="w-full md:w-80 bg-slate-900 p-8 text-white flex flex-col relative overflow-y-auto min-h-[300px] md:min-h-0">
          <button onClick={closeDetail} className="absolute right-6 top-6 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-colors">
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center mt-6">
            <div className="h-24 w-24 bg-white/10 rounded-[2.5rem] border border-white/10 flex items-center justify-center font-black text-4xl mb-6 backdrop-blur-xl shadow-2xl">
              {selectedStudent.name?.[0] || '?'}
            </div>

            <h2 className="text-2xl font-black tracking-tight">{selectedStudent.name}</h2>
            <div className="flex flex-wrap justify-center items-center gap-3 mt-3">
              <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-400 border border-emerald-400/20">
                {selectedStudent.roll_no}
              </span>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                Grade: {selectedStudent.classes?.grade || 'N/A'}
              </span>
              {(selectedStudent.parents as any)?.profiles?.username && (
                <span className="w-full mt-2 px-3 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/5">
                  Login ID: {(selectedStudent.parents as any).profiles.username}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-auto pt-10">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              Profile Hub
            </button>
            <button
              onClick={() => setActiveTab('academics')}
              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'academics' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              Academics
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              Attendance
            </button>
          </div>
        </div>

        {/* Modal Content Area */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-8 bg-white custom-scrollbar">
          {activeTab === 'profile' && (
            <ProfileTab
              selectedStudent={selectedStudent}
              studentFees={studentFees}
              loadingFees={loadingFees}
              setFeeForm={setFeeForm}
              setIsFeeModalOpen={setIsFeeModalOpen}
              handleOpenEditModal={handleOpenEditModal}
              closeDetail={closeDetail}
              fetchAll={fetchAll}
            />
          )}
          {activeTab === 'academics' && (
            <AcademicsTab
              selectedStudent={selectedStudent}
              academicResults={academicResults}
              handleUpdateResult={handleUpdateResult}
            />
          )}
          {activeTab === 'attendance' && (
            <AttendanceTab
              selectedStudent={selectedStudent}
            />
          )}
        </div>
      </div>
    </div>
  );
};
