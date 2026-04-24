import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { SchoolService } from '../../../../services/schoolService';
import { toast } from 'sonner';

import { useStudentsData } from '../hooks/useStudentsData';
import { useAcademicRecords } from '../hooks/useAcademicRecords';
import { useStudentFees } from '../hooks/useStudentFees';

import { StudentFilters } from './StudentFilters';
import { StudentTable } from './StudentTable';
import { EnrollStudentModal } from './modals/EnrollStudentModal';
import { IssueFeeModal } from './modals/IssueFeeModal';
import { StudentPortalModal } from './modals/StudentPortalModal';

import type { Student, StudentFormState, FeeFormState } from '../types/student.types';

export const StudentConsoleFeature: React.FC = () => {
  // Hooks
  const { students, classes, sessions, loading: dataLoading, fetchAll, handleDeleteStudent } = useStudentsData();
  const { academicResults, fetchAcademicResults, handleUpdateResult } = useAcademicRecords();
  const { studentFees, loadingFees, fetchStudentFees, handleIssueFee } = useStudentFees();

  // Local State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [showOnlyDues, setShowOnlyDues] = useState(false);

  // Local State for Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form states
  const [studentForm, setStudentForm] = useState<StudentFormState>({
    name: '',
    roll_no: '',
    class_id: '',
    father_name: '',
    cnic: '',
    parent_cnic: '',
    password: '',
    academic_year_id: '',
    status: 'Active',
    profile_picture_url: '',
    id: undefined
  });

  const [feeForm, setFeeForm] = useState<FeeFormState>({
    id: undefined,
    month: 'January',
    amount_paid: '0',
    status: 'Unpaid',
    items: [{ category: 'Monthly Fee', amount: 1200 }]
  });

  const totalFeeAmount = feeForm.items.reduce((acc, item) => acc + (parseFloat(item.amount.toString()) || 0), 0);
  const [formLoading, setFormLoading] = useState(false);

  // Deriving filtered students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.father_name && s.father_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesClass = !filterClass || s.class_id === filterClass;
    
    // Check if any fee is Not Paid
    const hasDues = (s.fees || []).some((f: any) => 
      f.status?.toLowerCase() === 'unpaid' || 
      f.status?.toLowerCase() === 'partial'
    );
    
    const matchesDues = !showOnlyDues || hasDues;

    return matchesSearch && matchesClass && matchesDues;
  });

  // Handlers
  const openStudentDetail = async (student: Student) => {
    setSelectedStudent(student);
    await fetchStudentFees(student.id);
  };

  const closeDetail = () => {
    setSelectedStudent(null);
  };

  const handleOpenEditModal = (student?: Student) => {
    closeDetail();
    if (student) {
      setStudentForm({
        name: student.name,
        roll_no: student.roll_no,
        class_id: student.class_id || '',
        father_name: student.father_name || '',
        cnic: student.cnic || '',
        parent_cnic: student.parent_cnic || '',
        password: '',
        admission_date: student.admission_date || new Date().toISOString().split('T')[0],
        academic_year_id: student.classes?.academic_year_id || '',
        status: student.status || 'Active',
        profile_picture_url: student.profile_picture_url || '',
        id: student.id
      });
    } else {
      setStudentForm({ 
        name: '', 
        roll_no: '', 
        class_id: '', 
        father_name: '', 
        cnic: '', 
        parent_cnic: '', 
        password: '', 
        admission_date: new Date().toISOString().split('T')[0],
        academic_year_id: '',
        status: 'Active',
        id: undefined 
      });
    }
    setIsEditModalOpen(true);
  };

  const onEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[A-Za-z\s]+$/.test(studentForm.name)) {
      toast.error("Student name must only contain letters.");
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(studentForm.father_name)) {
      toast.error("Parent name must only contain letters.");
      return;
    }
    if (!/^\d{13}$/.test(studentForm.cnic)) {
      toast.error("Student CNIC must be exactly 13 digits.");
      return;
    }
    if (!/^\d{13}$/.test(studentForm.parent_cnic)) {
      toast.error("Parent CNIC must be exactly 13 digits.");
      return;
    }
    if (!studentForm.id && !studentForm.password) {
      toast.error("Please provide an initial portal password.");
      return;
    }

    try {
      setFormLoading(true);
      const payload: any = {
        name: studentForm.name,
        roll_no: studentForm.roll_no,
        class_id: studentForm.class_id || null,
        father_name: studentForm.father_name,
        cnic: studentForm.cnic,
        parent_cnic: studentForm.parent_cnic,
        admission_date: studentForm.admission_date,
        status: studentForm.status || 'Active',
        profile_picture_url: studentForm.profile_picture_url || null
      };
      if (studentForm.id) payload.id = studentForm.id;

      const res = await SchoolService.upsertStudent(payload);

      if (studentForm.password) {
        await SchoolService.upsertStudentAccess(res.id, res.roll_no, studentForm.password);
      }

      toast.success(studentForm.id ? 'Student updated' : 'Student enrolled & portal initialized');
      setIsEditModalOpen(false);
      setStudentForm({ 
        name: '', 
        roll_no: '', 
        class_id: '', 
        father_name: '', 
        cnic: '', 
        parent_cnic: '', 
        password: '', 
        admission_date: new Date().toISOString().split('T')[0],
        academic_year_id: '',
        status: 'Active',
        id: undefined 
      });
      fetchAll();
    } catch (error) {
      toast.error('Failed to save student');
    } finally {
      setFormLoading(false);
    }
  };

  const onFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    await handleIssueFee(feeForm, selectedStudent, totalFeeAmount, () => {
      setIsFeeModalOpen(false);
      fetchAll();
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Student Registry</h1>
          <p className="text-slate-500 font-medium mt-1">
            {students.length} students enrolled · {students.filter(s => s.is_locked).length} with pending dues
          </p>
        </div>
        <button
          onClick={() => handleOpenEditModal()}
          className="flex items-center justify-center gap-2 px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all w-full lg:w-auto"
        >
          <Plus className="h-4 w-4" />
          Enroll New Student
        </button>
      </div>

      <StudentFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterClass={filterClass}
        setFilterClass={setFilterClass}
        showOnlyDues={showOnlyDues}
        setShowOnlyDues={setShowOnlyDues}
        classes={classes}
      />

      <div className="flex flex-col xl:flex-row gap-6">
        <StudentTable
          filteredStudents={filteredStudents}
          selectedStudent={selectedStudent}
          loading={dataLoading}
          isSearching={!!searchTerm}
          openStudentDetail={openStudentDetail}
          handleOpenEditModal={handleOpenEditModal}
          handleDeleteStudent={(id) => handleDeleteStudent(id, () => {
            if (selectedStudent?.id === id) closeDetail();
          })}
        />

        {selectedStudent && (
          <StudentPortalModal
            selectedStudent={selectedStudent}
            closeDetail={closeDetail}
            classes={classes}
            studentFees={studentFees}
            loadingFees={loadingFees}
            setFeeForm={setFeeForm}
            setIsFeeModalOpen={setIsFeeModalOpen}
            handleOpenEditModal={handleOpenEditModal}
            fetchAll={fetchAll}
            academicResults={academicResults}
            fetchAcademicResults={fetchAcademicResults}
            handleUpdateResult={handleUpdateResult}
          />
        )}
      </div>

      {isEditModalOpen && (
        <EnrollStudentModal
          studentForm={studentForm}
          setStudentForm={setStudentForm}
          classes={classes}
          sessions={sessions}
          loading={formLoading}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={onEnrollSubmit}
        />
      )}

      {isFeeModalOpen && selectedStudent && (
        <IssueFeeModal
          selectedStudent={selectedStudent}
          feeForm={feeForm}
          setFeeForm={setFeeForm}
          totalFeeAmount={totalFeeAmount}
          onClose={() => setIsFeeModalOpen(false)}
          onSubmit={onFeeSubmit}
        />
      )}
    </div>
  );
};
