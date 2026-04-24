import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
import { MyClasses } from '../../components/teacher/MyClasses';
import { MyStudents } from '../../components/teacher/MyStudents';

const TeacherDashboard: React.FC = () => {
  const location = useLocation();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [diaryContent, setDiaryContent] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [selectedClassData, setSelectedClassData] = useState<any>(null);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [activeStudentForMarks, setActiveStudentForMarks] = useState<any>(null);
  const [teacherStats, setTeacherStats] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [teacherTimetable, setTeacherTimetable] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [todaysAttendance, setTodaysAttendance] = useState<any[]>([]);
  const [moderatedClasses, setModeratedClasses] = useState<any[]>([]);
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
      if (!customUserId) {
        setLoading(false);
        return;
      }

      const teacher = await SchoolService.getTeacherData(customUserId);
      const profile = await SchoolService.getProfile(customUserId);
      setTeacherData(teacher);
      setProfileData(profile);

      const [assignData, statsData, tTimetable, taskData, moderatedData] = await Promise.all([
        teacher ? SchoolService.getTeacherAssignments(teacher.id) : Promise.resolve([]),
        SchoolService.getTeacherStats(customUserId),
        teacher ? SchoolService.getTeacherTimetable(teacher.id) : Promise.resolve([]),
        teacher ? SchoolService.getTeacherTasks(undefined, teacher.id) : Promise.resolve([]),
        teacher ? SchoolService.getModeratedClasses(teacher.id) : Promise.resolve([])
      ]);

      // Merge assignments and moderated classes with a separator flag
      const mergedAssignments = [
        ...(assignData || []),
        ...(moderatedData || [])
      ];

      setAssignments(mergedAssignments);
      setTeacherStats(statsData);
      setTeacherTimetable(tTimetable || []);
      setTasks(taskData || []);
      setModeratedClasses(moderatedData || []);

      if (mergedAssignments.length > 0) {
        const modAsgn = mergedAssignments.find(a => a.isModeratorAssignment);
        const initialAsgn = (location.pathname.includes('/attendance') && modAsgn) ? modAsgn : mergedAssignments[0];
        setSelectedAssignment(initialAsgn.id);
        fetchAssignmentDetails(initialAsgn);
      }
    } catch (error) {
      toast.error('Failed to load workplace data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentDetails = async (assignment: any, date: string = attendanceDate) => {
    try {
      const isMod = assignment.isModeratorAssignment;
      
      const [studentData, classData, diaryData, attendanceData] = await Promise.all([
        isMod ? SchoolService.getStudents(assignment.class_id) : SchoolService.getStudentsByClass(assignment.class_id),
        SchoolService.getClassById(assignment.class_id),
        isMod ? Promise.resolve([]) : SchoolService.getDiaryEntries(assignment.id),
        SchoolService.getAttendanceByAssignment(assignment.id, date),
      ]);
      
      setStudents(studentData || []);
      setSelectedClassData(classData);
      setHistory(diaryData || []);
      setTodaysAttendance(attendanceData || []);
    } catch (error) {
      toast.error('Error fetching class details');
    }
  };

  useEffect(() => {
    if (!selectedAssignment) return;
    
    if (selectedAssignment.startsWith('MOD-')) {
      const classId = selectedAssignment.replace('MOD-', '');
      const cls = moderatedClasses.find(c => c.class_id === classId);
      if (cls) {
        fetchAssignmentDetails(cls);
      }
    } else {
      const asgn = assignments.find(a => a.id === selectedAssignment);
      if (asgn) fetchAssignmentDetails(asgn);
    }
  }, [selectedAssignment, assignments, moderatedClasses]);

  useEffect(() => {
    if (location.pathname.includes('/attendance') && assignments.length > 0) {
      const modAsgn = assignments.find(a => a.isModeratorAssignment);
      if (modAsgn && selectedAssignment !== modAsgn.id) {
        setSelectedAssignment(modAsgn.id);
      }
    }
  }, [location.pathname, assignments]);

  useEffect(() => {
    if (!selectedAssignment || !attendanceDate) return;
    
    let asgn = assignments.find(a => a.id === selectedAssignment);
    if (!asgn) {
      const classId = selectedAssignment.replace('MOD-', '');
      asgn = assignments.find(a => a.class_id === classId);
    }
    
    if (asgn) {
      fetchAssignmentDetails(asgn, attendanceDate);
    }
  }, [attendanceDate]);

  const handleCreateDiary = async (e: React.FormEvent) => {
    e.preventDefault();
    const asgn = assignments.find(a => a.id === selectedAssignment);
    if (asgn && !asgn.class?.academic_years?.is_current) {
      toast.error('Diary posting is officially locked for archived academic sessions.');
      return;
    }

    if (selectedAssignment.startsWith('MOD-')) {
      toast.error('Diary entries must be posted to a specific subject, not class attendance.');
      return;
    }

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
    } catch (error: any) {
      console.error('Diary post error:', error);
      toast.error(`Failed to post diary: ${error.message || 'Unknown error'}`);
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
            tasks={tasks}
            onUpdateTaskStatus={async (id, status) => {
              try {
                await (SchoolService as any).updateTaskStatus(id, status);
                setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
                toast.success('Task objective complete');
              } catch {
                toast.error('Failed to update task status');
              }
            }}
          />
        } />
        <Route path="attendance" element={
          <AttendanceBox 
            students={students} 
            isClassTeacher={selectedClassData?.class_teacher_id === teacherData?.id}
            existingAttendance={todaysAttendance}
            selectedDate={attendanceDate}
            onDateChange={setAttendanceDate}
            onSave={async (attendanceData, markingTime) => {
               if(!selectedAssignment) {
                 toast.error('Select an assignment first to mark attendance');
                 return;
               }
               
               const asgn = assignments.find(a => a.id === selectedAssignment);
               if (!asgn) return;

               const records = Object.entries(attendanceData).map(([studentId, status]) => ({
                 student_id: studentId,
                 assignment_id: asgn.isModeratorAssignment ? null : asgn.id,
                 date: attendanceDate,
                 marking_time: markingTime,
                 status
               }));
               try {
                 await SchoolService.bulkUpsertAttendance(records);
                 toast.success('Attendance synced successfully');
                 
                 // Refresh details to lock the UI
                 fetchAssignmentDetails(asgn);
               } catch (e) {
                 toast.error('Failed to sync attendance');
               }
            }} 
          />
        } />
        <Route path="salary" element={<SalaryRecord teacher={teacherData} />} />
        <Route path="classes" element={<MyClasses teacher={teacherData} assignments={assignments} />} />
        <Route path="students" element={<MyStudents teacher={teacherData} assignments={assignments} />} />
        <Route path="profile" element={<TeacherProfile teacher={teacherData} profile={profileData} />} />
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
            tasks={tasks}
            onUpdateTaskStatus={async (id, status) => {
              try {
                await (SchoolService as any).updateTaskStatus(id, status);
                setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
                toast.success('Task objective complete');
              } catch {
                toast.error('Failed to update task status');
              }
            }}
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

