import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SchoolService } from '../../services/schoolService';
// Supabase import removed
import { useSchoolEvents } from '../../hooks/useSchoolEvents';
import { toast } from 'sonner';
// Imports cleaned
import { MarksModal } from '../../components/teacher/MarksModal';
import { AttendanceBox } from '../../components/teacher/AttendanceBox';
import { SalaryRecord } from '../../components/teacher/SalaryRecord';
import { TeacherProfile } from '../../components/teacher/TeacherProfile';
import { TeacherOverview } from '../../components/teacher/TeacherOverview';

const TeacherDashboard: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [activeStudentForMarks, setActiveStudentForMarks] = useState<any>(null);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [teacherTimetable, setTeacherTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time events (Admin OTAs)
  useSchoolEvents((notification) => {
    toast.message(`Broadcast: ${notification.message}`, {
      description: `From Admin office • Just now`,
      duration: 10000,
    });
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const customUserId = localStorage.getItem('custom_user_id');
      if (!customUserId) return;

      const teacher = await SchoolService.getTeacherData(customUserId);
      const profile = await SchoolService.getProfile(customUserId);
      setTeacherData(teacher);
      setProfileData(profile);

      const [assignData, statsData, tTimetable] = await Promise.all([
        SchoolService.getTeacherAssignments(teacher.id),
        SchoolService.getTeacherStats(customUserId),
        SchoolService.getTeacherTimetable(teacher.id)
      ]);
      setAssignments(assignData);
      setTeacherStats(statsData);
      setTeacherTimetable(tTimetable);

      if (assignData.length > 0) {
        setSelectedAssignment(assignData[0].id);
        fetchAssignmentDetails(assignData[0]);
      }
    } catch (error) {
      toast.error('Failed to load workplace data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentDetails = async (assignment: any) => {
    try {
      const [diaryData, timetableData, studentData, resultsData] = await Promise.all([
        SchoolService.getDiaryEntries(assignment.id),
        SchoolService.getTimetable(assignment.class_id),
        SchoolService.getStudents(assignment.class_id),
        SchoolService.getResults(undefined, assignment.subject_id)
      ]);
      setHistory(diaryData);
      setTimetable(timetableData);
      setStudents(studentData);
      setResults(resultsData);
    } catch (error) {
      toast.error('Error fetching class details');
    }
  };

  useEffect(() => {
    const asgn = assignments.find(a => a.id === selectedAssignment);
    if (asgn) fetchAssignmentDetails(asgn);
  }, [selectedAssignment]);

  const handleCreateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !diaryContent.trim()) return;

    try {
      await SchoolService.createDiaryEntry({
        assignment_id: selectedAssignment,
        content: diaryContent,
        date: new Date().toISOString().split('T')[0]
      });
      
      toast.success('Diary entry posted!');
      setDiaryContent('');
      
      const diaryData = await SchoolService.getDiaryEntries(selectedAssignment);
      setHistory(diaryData);
    } catch (error) {
      toast.error('Failed to post diary');
    }
  };

  if (loading) return null;

  // View extracted to TeacherOverview to remove render-blocking performance issue

  return (
    <div className="min-h-full">
      <Routes>
        <Route path="/" element={
          <TeacherOverview 
            assignments={assignments}
            selectedAssignment={selectedAssignment}
            setSelectedAssignment={setSelectedAssignment}
            diaryContent={diaryContent}
            setDiaryContent={setDiaryContent}
            handleCreateDiary={handleCreateDiary}
            teacherStats={teacherStats}
            timetable={timetable}
            teacherTimetable={teacherTimetable}
            students={students}
            results={results}
            setActiveStudentForMarks={setActiveStudentForMarks}
            setIsMarksModalOpen={setIsMarksModalOpen}
            history={history}
          />
        } />
        <Route path="/attendance" element={
          <AttendanceBox 
            students={students} 
            onSave={async (attendanceData) => {
               if(!selectedAssignment) {
                 toast.error('Select an assignment first to mark attendance');
                 return;
               }
               try {
                 const records = students.map(s => ({
                   student_id: s.id,
                   date: new Date().toISOString().split('T')[0],
                   status: attendanceData[s.id] || 'present',
                   assignment_id: selectedAssignment
                 }));
                 await SchoolService.bulkUpsertAttendance(records);
                 toast.success('Attendance synced successfully');
               } catch (e) {
                 toast.error('Failed to sync attendance');
               }
            }} 
          />
        } />
        <Route path="/salary" element={<SalaryRecord teacher={teacherData} />} />
        <Route path="/profile" element={<TeacherProfile teacher={teacherData} profile={profileData} />} />
        {/* Fallback to Overview for unknown sub-routes */}
        <Route path="*" element={
          <TeacherOverview 
            assignments={assignments}
            selectedAssignment={selectedAssignment}
            setSelectedAssignment={setSelectedAssignment}
            diaryContent={diaryContent}
            setDiaryContent={setDiaryContent}
            handleCreateDiary={handleCreateDiary}
            teacherStats={teacherStats}
            timetable={timetable}
            teacherTimetable={teacherTimetable}
            students={students}
            results={results}
            setActiveStudentForMarks={setActiveStudentForMarks}
            setIsMarksModalOpen={setIsMarksModalOpen}
            history={history}
          />
        } />
      </Routes>

      <MarksModal
        isOpen={isMarksModalOpen}
        onClose={() => setIsMarksModalOpen(false)}
        student={activeStudentForMarks}
        assignment={assignments.find(a => a.id === selectedAssignment)}
        currentResult={results.find(r => r.student_id === activeStudentForMarks?.id)}
        onSuccess={() => {
          const asgn = assignments.find(a => a.id === selectedAssignment);
          if (asgn) fetchAssignmentDetails(asgn);
        }}
      />
    </div>
  );
};

export default TeacherDashboard;

