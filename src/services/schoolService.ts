import { supabase as libSupabase } from '../lib/supabase';
import { supabaseAdmin } from '../lib/supabaseAdmin';
const supabase = libSupabase as any;
import type { TablesInsert } from '../types/database';

/**
 * @file schoolService.ts
 * @description Centralized service layer for all School Management System logic and database interactions.
 * Following the Logic-Isolation philosophy, UI components must only interact with this service.
 */

export class SchoolService {
  static supabase = supabase;

  static async uploadProfilePicture(bucket: 'Student' | 'Teacher', file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  }
  /**
   * ACADEMIC YEARS & CLASSES
   */

  /**
   * Fetches all classes for the current academic year.
   * @returns {Promise<Tables<'classes'>[]>} Array of classes.
   */
  static async getClasses() {
    const { data, error } = await supabase
      .from('classes')
      .select('*, academic_years(*), class_teacher:teachers!class_teacher_id(id, full_name)');
    
    if (error) {
      console.warn('Class teacher join failed, falling back:', error.message);
      const { data: fallback, error: fallbackError } = await supabase
        .from('classes')
        .select('*, academic_years(*)');
      if (fallbackError) throw fallbackError;
      return fallback;
    }
    return data;
  }

  static async getClassById(id: string) {
    const { data, error } = await supabase
      .from('classes')
      .select('*, academic_years(*), class_teacher:teachers!class_teacher_id(id, full_name)')
      .eq('id', id)
      .single();
    
    if (error) {
      console.warn('ClassById teacher join failed, falling back:', error.message);
      const { data: fallback, error: fallbackError } = await supabase
        .from('classes')
        .select('*, academic_years(*)')
        .eq('id', id)
        .single();
      if (fallbackError) throw fallbackError;
      return fallback;
    }
    return data;
  }

  static async upsertClass(classData: any) {
    if (classData.id) {
      const { data, error } = await supabase
        .from('classes')
        .update(classData)
        .eq('id', classData.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    const { data, error } = await supabase
      .from('classes')
      .upsert(classData)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteClass(classId: string) {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);
    if (error) throw error;
  }

  /**
   * STUDENT MANAGEMENT
   */

  /**
   * Fetches students, optionally filtered by class or parent.
   * @param {string} [classId] - Optional class ID to filter by.
   * @param {string} [parentId] - Optional parent ID to filter by.
   * @returns {Promise<Tables<'students'>[]>} Array of students.
   */
  static async getStudents(classId?: string, parentId?: string) {
    let query = supabase.from('students').select('*, parents(*, profiles(username)), classes(*, academic_years(*)), fees(status)');
    if (classId) query = query.eq('class_id', classId);
    if (parentId) query = query.eq('parent_id', parentId);
    
    // Only show active students by default
    query = query.eq('status', 'Active');
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      console.warn('Student list fetch failed, falling back to basic data:', error.message);
      let fallbackQuery = supabase.from('students').select('*');
      if (classId) fallbackQuery = fallbackQuery.eq('class_id', classId);
      if (parentId) fallbackQuery = fallbackQuery.eq('parent_id', parentId);
      fallbackQuery = fallbackQuery.eq('status', 'Active');
      
      const { data: fallback, error: fbError } = await fallbackQuery;
      if (fbError) throw fbError;
      return fallback;
    }
    return data;
  }

  /**
   * Fetches a single student by ID with their class and parent info.
   */
  static async getStudentById(studentId: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        classes(*, academic_years(*)),
        parents(*)
      `)
      .eq('id', studentId)
      .maybeSingle();
    
    if (error) {
      console.warn('Student detail fetch error, falling back:', error.message);
      const { data: fallback, error: fallbackError } = await supabase
        .from('students')
        .select('*, classes(*)')
        .eq('id', studentId)
        .maybeSingle();
      if (fallbackError) throw fallbackError;
      return fallback;
    }
    return data;
  }

  /**
   * Toggles a student's warning/locked status.
   * @param {string} studentId - The ID of the student.
   * @param {boolean} isLocked - The new locked status.
   * @returns {Promise<Tables<'students'>>} The updated student record.
   */
  static async toggleStudentWarning(studentId: string, isLocked: boolean) {
    const { data, error } = await supabase
      .from('students')
      .update({ is_locked: isLocked })
      .eq('id', studentId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * DIARY & ACADEMICS
   */

  /**
   * Fetches diary entries for a specific teacher assignment.
   * @param {string} assignmentId - The ID of the teacher assignment.
   * @returns {Promise<Tables<'diary'>[]>} Array of diary entries.
   */
  static async getDiaryEntries(assignmentId: string) {
    try {
      const { data, error } = await supabase
        .from('diary')
        .select('*')
        .eq('assignment_id', assignmentId)
        .order('date', { ascending: false });
      
      if (error) {
        console.warn('Diary fetch failed, returning empty:', error.message);
        return [];
      }
      return data;
    } catch (e) {
      console.warn('Diary fetch exception:', e);
      return [];
    }
  }

  /**
   * Fetches teacher data by profile ID.
   */
  static async getTeacherData(profileId: string) {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('profile_id', profileId)
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Fetches parent data by profile ID.
   */
  static async getParentData(profileId: string) {
    const { data, error } = await supabase
      .from('parents')
      .select('*, profiles(*)')
      .eq('profile_id', profileId)
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Fetches all attendance records for a specific date across all classes.
   */
  static async getAllAttendance(date: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        students:student_id(*),
        assignment:teacher_assignments(
          *,
          subject:subjects(*),
          class:classes(*),
          teacher:teachers(*)
        )
      `)
      .eq('date', date);
    
    if (error) throw error;
    return data;
  }

  static async getAllTeacherAttendance(date: string) {
    const { data: teachers } = await supabase.from('teachers').select('*');
    const { data: attendance } = await supabase.from('teacher_attendance').select('*').eq('date', date);
    
    return (teachers || []).map(t => {
      const record = (attendance || []).find(a => a.teacher_id === t.id);
      return {
        ...record,
        teacher_id: t.id,
        teacher: t,
        status: record?.status || 'not-marked',
        date
      };
    });
  }

  static async upsertTeacherAttendance(record: { teacher_id: string, date: string, status: string }) {
    const { data, error } = await supabase
      .from('teacher_attendance')
      .upsert(record, { onConflict: 'teacher_id,date' });
    
    if (error) throw error;
    return data;
  }

  static async getAttendanceByClassAndDate(classId: string, date: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, teacher_assignments!inner(class_id)')
      .eq('date', date)
      .eq('teacher_assignments.class_id', classId);
    
    if (error) throw error;
    return data;
  }

  /**
   * Calculates attendance summary for a student.
   */
  static async getAttendanceStats(studentId: string) {
    const { data: attendanceData, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId);
    
    if (error) throw error;
    
    const stats = {
      present: (attendanceData || []).filter((a: any) => a.status === 'present').length,
      absent: (attendanceData || []).filter((a: any) => a.status === 'absent').length,
      late: (attendanceData || []).filter((a: any) => a.status === 'late').length,
      total: attendanceData.length,
      percentage: '0.00'
    };

    if (stats.total > 0) {
      stats.percentage = (stats.present / stats.total * 100).toFixed(2);
    }

    return stats;
  }

  static async getAttendanceHistory(studentId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*, assignment:teacher_assignments(*, subject:subjects(*), teacher:teachers(*))')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async getAttendanceByAssignment(assignmentId: string, date: string) {
    let query = supabase
      .from('attendance')
      .select('*, student:students!inner(class_id)')
      .eq('date', date);

    if (assignmentId.startsWith('MOD-')) {
      const classId = assignmentId.replace('MOD-', '');
      // Use the aliased 'student' for filtering on the inner join
      query = query.is('assignment_id', null).eq('student.class_id', classId);
    } else {
      query = query.eq('assignment_id', assignmentId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async getModeratedClasses(teacherId: string) {
    const { data: assignments } = await supabase
      .from('teacher_assignments')
      .select('*, subject:subjects(name)')
      .eq('teacher_id', teacherId);

    const { data, error } = await supabase
      .from('classes')
      .select('*, academic_years!inner(*)')
      .eq('class_teacher_id', teacherId)
      .eq('academic_years.is_current', true);
    
    if (error) throw error;
    
    // Return all moderated classes, linking subject context where available
    return (data || []).map(cls => {
      const relatedAssignment = (assignments || []).find(a => a.class_id === cls.id);
      return {
        id: `MOD-${cls.id}`,
        class_id: cls.id,
        isModeratorAssignment: true,
        class: cls,
        subject: { 
          name: relatedAssignment ? `Attendance (${relatedAssignment.subject?.name})` : 'General Attendance' 
        },
        assignment_id: relatedAssignment?.id
      };
    });
  }

  static async bulkUpsertAttendance(records: any[]) {
    const { data, error } = await supabase
      .rpc('upsert_student_attendance', { attendance_json: records });
    if (error) throw error;
    return data;
  }

  static async bulkUpsertTeacherAttendance(records: any[]) {
    if (!records || records.length === 0) return;
    const { data, error } = await supabase
      .from('teacher_attendance')
      .upsert(records, { onConflict: 'teacher_id,date' });
    if (error) throw error;
    return data;
  }

  /**
   * Fetches all students enrolled in a specific class.
   */
  static async getStudentsByClass(classId: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*, parents(*, profiles(username))')
      .eq('class_id', classId)
      .eq('status', 'Active')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  /**
   * Fetches assignments for a specific teacher.
   */
  static async getTeacherAssignments(teacherId: string) {
    const { data, error } = await supabase
      .from('teacher_assignments')
      .select(`
        *,
        class:classes(*, academic_years(*)),
        subject:subjects(*)
      `)
      .eq('teacher_id', teacherId);
    
    if (error) {
      console.warn('Teacher assignments fetch failed, falling back:', error.message);
      const { data: fallback, error: fbError } = await supabase
        .from('teacher_assignments')
        .select('*, class:classes(*), subject:subjects(*)')
        .eq('teacher_id', teacherId);
      if (fbError) throw fbError;
      return fallback;
    }
    return data;
  }

  static async getTeacherAssignmentsByClass(classId: string) {
    const { data, error } = await supabase
      .from('teacher_assignments')
      .select(`
        *,
        subject:subjects(*),
        teacher:teachers(*)
      `)
      .eq('class_id', classId);
    if (error) throw error;
    return data;
  }
  static async getAllTeacherAssignments() {
    const { data, error } = await supabase
      .from('teacher_assignments')
      .select(`
        *,
        class:classes(*),
        subject:subjects(*),
        teacher:teachers(*)
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  /**
   * Creates a new diary entry.
   * @param {TablesInsert<'diary'>} entry - The diary entry to create.
   */
  static async createDiaryEntry(entry: TablesInsert<'diary'>) {
    const { data, error } = await supabase
      .from('diary')
      .insert(entry)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to avoid 406 errors on empty results
    
    if (error) throw error;
    if (!data) throw new Error('Identity not initialized. Please run the setup script.');
    
    return data;
  }

  /**
   * NOTIFICATIONS & BROADCASTS
   */

  /**
   * Broadcasts a notification to a target role.
   * @param {string} message - The broadcast message.
   * @param {Database['public']['Tables']['notifications']['Row']['target_role']} targetRole - The target role (all|teacher|parent).
   */
  static async sendOTA(message: string, targetRole: 'all' | 'teacher' | 'parent') {
    const customUserId = localStorage.getItem('custom_user_id');
    if (!customUserId) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        message,
        target_role: targetRole,
        sender_id: customUserId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * AUTH & USER GENERATION
   */

  /**
   * Signs in a user using their custom school-id username or email.
   * @param {string} username - The custom school-id OR full email.
   * @param {string} password - The user's password.
   */
  static async signIn(username: string, password: string) {
    // 1. Automatically handle the @school.com suffix with sanitization
    let rawId = username.includes('@') ? username.split('@')[0] : username;
    // Remove all spaces and special characters that are invalid in an email prefix
    rawId = rawId.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const email = `${rawId}@school.com`;

    console.log('Attempting login with virtual email:', email);

    // 2. Real Supabase Authentication (Password is stored ONLY in Supabase Auth)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // 3. Fetch Profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) throw new Error('Identity record not found. Please contact support.');

    localStorage.setItem('custom_user_id', profile.id);
    return profile;
  }

  static async signOut() {
    localStorage.removeItem('custom_user_id');
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  static async generateAccount(username: string, password: string, role: 'admin' | 'teacher' | 'parent') {
    let rawId = username.includes('@') ? username.split('@')[0] : username;
    rawId = rawId.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const email = `${rawId}@school.com`;
    
    // 1. Create real Supabase Auth user using the ISOLATED client.
    // This client does NOT persist the session, so it will NOT log out the admin.
    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create authentication record.');

    // 2. Create Profile linked to the Auth User ID
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: rawId,
        role: role,
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      // We can't delete the user via anon key if profile fails, 
      // but the record is now safely in auth.users.
      throw profileError;
    }
    
    return profileData;
  }

  /**
   * Special method to ensure a student has their own unique login and parent record.
   * This enforces the 1:1 isolation requested by the user.
   */
  static async createStudentAccess(studentId: string, rollNo: string, password: string) {
    // 1. Get student data
    const { data: student } = await supabase.from('students').select('parent_id, name').eq('id', studentId).single();
    if (!student) throw new Error('Student not found');
    
    // 2. Create Profile & Auth User using Roll Number as username
    const profile = await this.generateAccount(rollNo, password, 'parent');

    // 3. Create or Update Parent record for this login
    let parentId = student.parent_id;
    if (!parentId) {
      const { data: newParent, error: pErr } = await supabase.from('parents').insert({
        profile_id: profile.id,
        full_name: `${student.name}'s Guardian`
      }).select().single();
      if (pErr) throw pErr;
      parentId = newParent.id;
    } else {
      // Update existing parent record to point to new profile if necessary
      await supabase.from('parents').update({ profile_id: profile.id }).eq('id', parentId);
    }

    // 4. Link Student to this parent
    const { error: sErr } = await supabase.from('students').update({ parent_id: parentId }).eq('id', studentId);
    if (sErr) throw sErr;

    return { profile, parent_id: parentId };
  }

  /**
   * Special method to ensure a teacher has their own unique login.
   */
  static async createTeacherAccess(teacherId: string, username: string, password: string) {
    // 1. Create Profile & Auth User using username
    const profile = await this.generateAccount(username, password, 'teacher');

    // 2. Update Teacher record to link to this profile
    const { error: tErr } = await supabase.from('teachers').update({ profile_id: profile.id }).eq('id', teacherId);
    if (tErr) throw tErr;

    return profile;
  }

  static async updateProfileRole(profileId: string, role: 'admin' | 'teacher' | 'parent') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', profileId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getTeacherById(id: string) {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        teacher_assignments(
          id,
          subject:subjects(id, name),
          class:classes(id, grade, section)
        )
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  static async upsertStudentAccess(studentId: string, rollNo: string, password: string) {
    try {
      await this.createStudentAccess(studentId, rollNo, password);
    } catch (e: any) {
      if (e.message?.includes('already registered')) {
        await this.resetUserPassword(rollNo, password);
      } else {
        throw e;
      }
    }
  }

  static async upsertTeacherAccess(teacherId: string, username: string, password: string) {
    try {
      await this.createTeacherAccess(teacherId, username, password);
    } catch (e: any) {
      if (e.message?.includes('already registered')) {
        await this.resetUserPassword(username, password);
      } else {
        throw e;
      }
    }
  }

  /**
   * Identifies all students and teachers who are missing a digital login.
   * This is used for the "System Audit" repair tool.
   */
  static async getAuthAudit() {
    const { data: students } = await supabase
      .from('students')
      .select('id, name, roll_no, parent_id, parents(profile_id)');
    const { data: teachers } = await supabase
      .from('teachers')
      .select('id, full_name, profile_id');

    const missingStudents = (students || []).filter((s: any) => !s.parents?.profile_id);
    const missingTeachers = (teachers || []).filter((t: any) => !t.profile_id);

    return {
      students: missingStudents,
      teachers: missingTeachers,
      totalMissing: missingStudents.length + missingTeachers.length
    };
  }

  /**
   * OPERATIONS: THE GREAT PROMOTION
   */

  /**
   * Bulk promotes students from one class to another.
   * Atomic operation that logs history and updates student class_ids.
   * @param {string} oldClassId - The current class ID.
   * @param {string} newClassId - The target class ID.
   * @param {string} academicYearId - The academic year to log in history.
   */
  static async performGreatPromotion(oldClassId: string, newClassId: string, academicYearId: string) {
    const { error } = await supabase.rpc('perform_great_promotion', {
      old_class_id: oldClassId,
      new_class_id: newClassId,
      academic_year_id: academicYearId
    });

    if (error) throw error;
    return true;
  }

  /**
   * Fetches timetable for a specific class.
   */
  static async getTimetable(classId: string) {
    const { data, error } = await supabase
      .from('timetable')
      .select(`
        *,
        assignment:teacher_assignments(
          subject:subjects(name),
          teacher:teachers(full_name)
        )
      `)
      .eq('assignment.class_id', classId);
    
    if (error) throw error;
    return data;
  }

  /**
   * Fetches the full weekly timetable for a specific teacher.
   */
  static async getTeacherTimetable(teacherId: string) {
    const { data, error } = await supabase
      .from('timetable')
      .select(`
        *,
        assignment:teacher_assignments!inner(
          id,
          teacher_id,
          subject:subjects(name),
          class:classes(grade, section)
        )
      `)
      .eq('assignment.teacher_id', teacherId);
    
    if (error) throw error;
    return data;
  }

  static async upsertTimetable(timetableRecord: any) {
    // 0. Basic duration validation
    if (timetableRecord.end_time <= timetableRecord.start_time) {
      throw new Error('Invalid Time: End time must be later than start time.');
    }

    // 1. Get the teacher_id for the assignment being scheduled
    const { data: currentAssignment } = await supabase
      .from('teacher_assignments')
      .select('teacher_id')
      .eq('id', timetableRecord.assignment_id)
      .single();

    if (currentAssignment) {
      // 2. Fetch all scheduled slots for the SAME teacher on the SAME day across ALL classes
      const { data: existingSlots } = await supabase
        .from('timetable')
        .select(`
          id,
          start_time,
          end_time,
          assignment:teacher_assignments!inner (
            teacher_id,
            class:classes(grade, section),
            subject:subjects(name)
          )
        `)
        .eq('day_of_week', timetableRecord.day_of_week)
        .eq('assignment.teacher_id', currentAssignment.teacher_id);

      // 3. Check for time overlap
      const hasOverlap = existingSlots?.some(slot => {
        // Skip if we're updating the same slot
        if (timetableRecord.id && slot.id === timetableRecord.id) return false;

        const newStart = timetableRecord.start_time;
        const newEnd = timetableRecord.end_time;
        const oldStart = slot.start_time;
        const oldEnd = slot.end_time;

        // Overlap logic: (StartA < EndB) AND (EndA > StartB)
        return (newStart < oldEnd && newEnd > oldStart);
      });

      if (hasOverlap) {
        throw new Error('Teacher Conflict: This teacher is already scheduled for another class at this time.');
      }
    }

    const { data, error } = await supabase
      .from('timetable')
      .upsert(timetableRecord)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteTimetable(id: string) {
    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  /**
   * Fetches fee history and status for a student.
   */
  static async getStudentFees(studentId: string) {
    const { data, error } = await supabase
      .from('fees')
      .select('*, academic_years!academic_year_id(*)')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });
    
    if (error) {
        console.warn('Fee history fetch failed, trying without join:', error.message);
        const { data: fallback, error: fallbackError } = await supabase
            .from('fees')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });
        if (fallbackError) throw fallbackError;
        return fallback;
    }
    return data;
  }


  /**
   * Fetches diary entries for all subjects assigned to a class.
   */
  static async getDiaryForParent(classId: string) {
    const { data, error } = await supabase
      .from('diary')
      .select(`
        *,
        assignment:teacher_assignments!inner(
          class_id,
          subject:subjects(name),
          teacher:teachers(full_name)
        )
      `)
      .eq('assignment.class_id', classId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * OPERATIONS: STUDENT & CLASS MANAGEMENT
   */

  static async upsertStudent(student: any) {
    const { data, error } = await supabase
      .from('students')
      .upsert(student)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteStudent(studentId: string) {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);
    if (error) throw error;
  }

  static async updateStudentStatus(studentId: string, status: string) {
    const { data, error } = await supabase
      .from('students')
      .update({ status })
      .eq('id', studentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getSubjects() {
    const { data, error } = await supabase
      .from('subjects')
      .select('*');
    if (error) throw error;
    return data;
  }

  /**
   * RESULT / MARKS MANAGEMENT
   */

  static async getResults(studentId?: string, subjectId?: string) {
    let query = supabase
      .from('results')
      .select('*, subject:subjects(*), subjects(*), teacher:teachers(*), teachers(*), students(*), assessment:assessments(*, subject:subjects(*), subjects(*), teacher:teachers(*), teachers(*))');
    
    if (studentId) query = query.eq('student_id', studentId);
    if (subjectId) query = query.eq('subject_id', subjectId);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async upsertResult(result: any) {
    const { data, error } = await supabase
      .from('results')
      .upsert(result)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * ASSESSMENT & MARKS CATEGORIES (PHASE 6)
   */
  static async getAssessments(teacherId?: string, classId?: string, subjectId?: string) {
    let query = supabase.from('assessments').select('*, teacher:teachers(full_name), class:classes(grade, section), subject:subjects(name)');
    if (teacherId) query = query.eq('teacher_id', teacherId);
    if (classId) query = query.eq('class_id', classId);
    if (subjectId) query = query.eq('subject_id', subjectId);
    
    const { data, error } = await query.order('date', { ascending: false });
    if (error) {
      console.warn('Assessments fetch failed, falling back to basic data:', error.message);
      let fallbackQuery = supabase.from('assessments').select('*');
      if (teacherId) fallbackQuery = fallbackQuery.eq('teacher_id', teacherId);
      if (classId) fallbackQuery = fallbackQuery.eq('class_id', classId);
      if (subjectId) fallbackQuery = fallbackQuery.eq('subject_id', subjectId);
      
      const { data: fallback, error: fbError } = await fallbackQuery.order('date', { ascending: false });
      if (fbError) throw fbError;
      return fallback;
    }
    return data;
  }

  static async createAssessment(assessment: any) {
    const { data, error } = await supabase.from('assessments').insert(assessment).select().single();
    if (error) throw error;
    return data;
  }

  static async getAssessmentResults(assessmentId: string) {
    const { data, error } = await supabase.from('results').select('*, student:students(id, name, roll_no)').eq('assessment_id', assessmentId);
    if (error) throw error;
    return data;
  }

  static async bulkUpsertResults(results: any[]) {
    console.log('Publishing results payload:', results);
    const { data, error } = await supabase.rpc('upsert_assessment_results', {
      results_json: results
    });
    if (error) throw error;
    return data;
  }

  static async getSubjectsByGrade(grade: string) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('grade_level', grade);
    if (error) throw error;
    return data;
  }

  static async createSubject(name: string, grade: string) {
    const { data, error } = await (supabase as any)
      .from('subjects')
      .insert({ name, grade_level: grade })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteSubject(id: string) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  /**
   * REALTIME SUBSCRIPTIONS
   */

  /**
   * Subscribes to real-time updates for notifications.
   * @param {Function} onUpdate - Callback for new notifications.
   */
  static subscribeToNotifications(onUpdate: (payload: any) => void) {
    return supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, onUpdate)
      .subscribe();
  }

  /**
   * Subscribes to real-time updates for diary entries.
   * @param {Function} onUpdate - Callback for new diary entries.
   */
  static subscribeToDiaryUpdates(onUpdate: (payload: any) => void) {
    return supabase
      .channel('public:diary')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'diary' }, onUpdate)
      .subscribe();
  }

  /**
   * Subscribes to real-time student updates (e.g., locking).
   * @param {string} studentId - The ID of the student to monitor.
   * @param {Function} onUpdate - Callback for student record changes.
   */
  static subscribeToStudentStatus(studentId: string, onUpdate: (payload: any) => void) {
    return supabase
      .channel(`student-status:${studentId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'students', filter: `id=eq.${studentId}` }, onUpdate)
      .subscribe();
  }

  /**
   * DASHBOARD & FINANCIAL ANALYTICS
   */

  static async getDashboardStats() {
    const { data: students, error: errSt } = await supabase
      .from('students')
      .select('id, class_id, is_locked, created_at, classes(grade)')
      .eq('status', 'Active');
    if (errSt) throw errSt;

    const { data: teachers, error: errTe } = await supabase
      .from('teachers')
      .select('id');
    if (errTe) throw errTe;

    const { data: fees, error: errFe } = await supabase
      .from('fees')
      .select('amount_due, amount_paid, status, created_at');
    if (errFe) throw errFe;

    const { count: subjectCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true });

    // Calculate revenue trends (last 6 months)
    const monthlyRevenue: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    (fees || []).forEach((f: any) => {
      const date = new Date(f.created_at);
      const monthKey = months[date.getMonth()];
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + Number(f.amount_paid || 0);
    });

    const revenueTrend = months.map(m => ({
      name: m,
      rev: monthlyRevenue[m] || 0
    })).filter((_, i) => i <= new Date().getMonth());

    const totalRevenue = (fees || [])
      .reduce((sum: number, f: any) => sum + Number(f.amount_paid || 0), 0);

    const pendingFees = (fees || [])
      .filter((f: any) => f.status !== 'Paid')
      .reduce((sum: number, f: any) => sum + (Number(f.amount_due || 0) - Number(f.amount_paid || 0)), 0);

    const gradeCounts: Record<string, number> = {};
    (students || []).forEach((s: any) => {
      let grade = (s.classes as any)?.grade;
      if (!grade) grade = 'Unassigned';
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
    });

    // Recent students (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentStudentsCount = (students || []).filter((s: any) => 
      s.created_at && new Date(s.created_at) > weekAgo
    ).length;

    return {
      totalRevenue,
      pendingFees,
      totalStudents: students?.length || 0,
      totalTeachers: teachers?.length || 0,
      activeSubjects: subjectCount || 0,
      gradeDistribution: Object.entries(gradeCounts)
        .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        .map(([name, value]) => ({ name: `Grade ${name}`, value })),
      revenueTrend,
      recentStudents: recentStudentsCount,
      feesPaidCount: (fees || []).filter((f: any) => f.status === 'Paid').length,
      feesUnpaidCount: (fees || []).filter((f: any) => f.status !== 'Paid').length,
      topDefaulters: (students || [])
        .map((s: any) => {
          const studentFees = (fees || []).filter((f: any) => f.student_id === s.id);
          const pending = studentFees
            .filter((f: any) => f.status !== 'Paid')
            .reduce((sum: number, f: any) => sum + (Number(f.amount_due || 0) - Number(f.amount_paid || 0)), 0);
          return { name: s.name, pending, grade: s.classes?.grade };
        })
        .filter(s => s.pending > 0)
        .sort((a, b) => b.pending - a.pending)
        .slice(0, 5)
    };
  }

  static async getTeacherStats(profileId: string) {
    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('profile_id', profileId)
        .single();

      if (!teacher) return { revenue: 0, totalStudents: 0, subjectsCount: 0 };

      const { data: stats, error } = await (supabase as any)
        .from('enrollments')
        .select('price_at_enrollment, payment_status, subjects!inner(*)')
        .eq('subjects.teacher_id', teacher.id);

      if (error || !stats) return { revenue: 0, totalStudents: 0, subjectsCount: 0 };

      const revenue = stats
        .filter((s: any) => s.payment_status === 'paid')
        .reduce((sum: number, s: any) => sum + Number(s.price_at_enrollment), 0);

      return {
        revenue,
        totalStudents: stats.length,
        subjectsCount: stats.length > 0 ? [...new Set(stats.map((s: any) => s.subjects.id))].length : 0
      };
    } catch (e) {
      console.warn('Teacher stats calculation fallback:', e);
      return { revenue: 0, totalStudents: 0, subjectsCount: 0 };
    }
  }

  /**
   * USER MANAGEMENT & ACCESS CONTROL
   */

  static async toggleUserStatus(userId: string, isActive: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId);
    if (error) throw error;
  }

  static async resetUserPassword(id: string, newPassword: string) {
    let rawUsername = id.includes('@') ? id.split('@')[0] : id;
    rawUsername = rawUsername.toLowerCase().trim();

    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', rawUsername)
      .single();

    if (!profile) throw new Error('User profile not found');

    const { error } = await (supabase as any)
      .from('profiles')
      .update({ password: newPassword })
      .eq('id', profile.id);

    if (error) throw error;
  }

  static async updateProfileRegistration(profileId: string, newRegistrationNo: string) {
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ registration_no: newRegistrationNo })
      .eq('id', profileId);

    if (error) throw error;
  }

  static async getProfileCredentials(profileId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('registration_no, password')
      .eq('id', profileId)
      .single();

    if (error) throw error;
    return data;
  }

  static async resetUserPasswordById(profileId: string, newPassword: string) {
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ password: newPassword })
      .eq('id', profileId);

    if (error) throw error;
  }

  static async bulkRegisterStudents(csvData: any[], classId: string) {
    // csvData is expected to be an array of objects from PapaParse
    const results = [];
    for (const row of csvData) {
      try {
        // 1. Create Student record
        const student = await this.upsertStudent({
          name: row.name,
          roll_no: row.roll_no,
          class_id: classId
        });

        // 2. Generate Account if password provided
        if (row.password) {
          await this.generateAccount(student.id, row.password, 'parent');
        }
        
        results.push({ name: row.name, status: 'success' });
      } catch (err: any) {
        results.push({ name: row.name, status: 'error', message: err.message });
      }
    }
    return results;
  }

  /**
   * TEACHER MANAGEMENT (Full CRUD)
   */

  /**
   * Fetches all teachers with their assignments, subjects, and classes.
   */
  static async getTeachers() {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        profiles(username, role),
        teacher_assignments(
          id,
          subject_id,
          class_id,
          subject:subjects(id, name),
          class:classes(id, grade, section)
        )
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  /**
   * Creates or updates a teacher record.
   */
  static async upsertTeacher(teacher: any) {
    const { data, error } = await supabase
      .from('teachers')
      .upsert(teacher)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Updates specific teacher fields (name, salary, joined_at).
   */
  static async updateTeacher(teacherId: string, updates: Record<string, any>) {
    const { data, error } = await (supabase as any)
      .from('teachers')
      .update(updates)
      .eq('id', teacherId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Deletes a teacher by ID.
   */
  static async deleteTeacher(teacherId: string) {
    // First remove assignments
    await supabase.from('teacher_assignments').delete().eq('teacher_id', teacherId);
    const { error } = await supabase.from('teachers').delete().eq('id', teacherId);
    if (error) throw error;
  }

  /**
   * Creates a new teacher assignment (subject + class).
   */
  static async createTeacherAssignment(teacherId: string, subjectId: string, classId: string) {
    const { data, error } = await supabase
      .from('teacher_assignments')
      .insert({ teacher_id: teacherId, subject_id: subjectId, class_id: classId })
      .select(`*, subject:subjects(*), class:classes(*)`)
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Deletes a teacher assignment.
   */
  static async deleteTeacherAssignment(assignmentId: string) {
    const { error } = await supabase
      .from('teacher_assignments')
      .delete()
      .eq('id', assignmentId);
    if (error) throw error;
  }

  /**
   * FEE MANAGEMENT (Full CRUD)
   */

  /**
   * Creates or updates a fee record.
   */
  static async upsertFee(fee: any) {
    if (fee.status) {
      fee.status = fee.status.charAt(0).toUpperCase() + fee.status.slice(1).toLowerCase();
    }
    const { data, error } = await supabase
      .from('fees')
      .upsert(fee)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Updates fee payment status.
   */
  static async updateFeeStatus(feeId: string, status: string, amountPaid: number) {
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    
    const { data, error } = await supabase
      .from('fees')
      .update({ status: normalizedStatus, amount_paid: amountPaid })
      .eq('id', feeId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async addFeeAdjustment(feeId: string, category: string, amount: number) {
    const { data: fee, error: fetchError } = await supabase
      .from('fees')
      .select('items, amount_due')
      .eq('id', feeId)
      .single();
    if (fetchError) throw fetchError;

    const currentItems = Array.isArray(fee.items) ? fee.items : [];
    const newItems = [...currentItems, { category, amount }];
    const newAmountDue = newItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const { data, error } = await supabase
      .from('fees')
      .update({ 
        items: newItems,
        amount_due: Math.max(0, newAmountDue)
      })
      .eq('id', feeId)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  /**
   * Deletes a fee record.
   */
  static async deleteFee(feeId: string) {
    const { error } = await supabase
      .from('fees')
      .delete()
      .eq('id', feeId);
    if (error) throw error;
  }

  /**
   * Upgrades a student to the next grade.
   */
  static async upgradeStudentGrade(studentId: string, currentGrade: string, classes: any[]) {
    // SECURITY CHECK: Ensure student has passed ALL courses for the current grade
    const results = await this.getResults(studentId);
    const hasFailed = results.some((r: any) => r.status !== 'pass');
    
    if (results.length > 0 && hasFailed) {
      throw new Error('Academic Block: Student cannot be upgraded until all current courses are marked as "Pass".');
    }

    if (results.length === 0) {
      // Logic decision: Should we block if NO results are entered yet?
      // User said "only able to upgrade when he passes all the courses".
      // This implies if courses exist, they MUST be passed.
      const currentSubjects = await this.getSubjectsByGrade(currentGrade);
      if (currentSubjects.length > 0) {
         throw new Error('Academic Block: Student has no recorded results for their current courses. Please record a "Pass" for each course first.');
      }
    }

    const nextGradeNum = parseInt(currentGrade) + 1;
    const nextGradeStr = nextGradeNum.toString();

    // Find a class for the next grade
    const targetClass = classes.find(c => c.grade === nextGradeStr);

    if (!targetClass) {
      throw new Error(`Grade ${nextGradeStr} does not exist. Please create Grade ${nextGradeStr} first in classes.`);
    }

    const { data, error } = await supabase
      .from('students')
      .update({ class_id: targetClass.id })
      .eq('id', studentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * TEACHER TASKS (ADMIN DIRECTIVES)
   */

  static async createTeacherTask(task: {
    assignment_id: string;
    task_description: string;
    target_date: string;
  }) {
    const adminId = localStorage.getItem('custom_user_id');
    if (!adminId) throw new Error('Not authenticated');

    const { data, error } = await (supabase as any)
      .from('teacher_tasks')
      .insert({
        ...task,
        admin_id: adminId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getTeacherTasks(assignmentId?: string, teacherId?: string) {
    let query = (supabase as any).from('teacher_tasks').select(`
      *,
      admin:admin_id(username),
      assignment:teacher_assignments(
        id,
        class:classes(grade, section),
        subject:subjects(name),
        teacher:teachers(full_name)
      )
    `);

    if (assignmentId) {
      query = query.eq('assignment_id', assignmentId);
    } else if (teacherId) {
      query = query.eq('assignment.teacher_id', teacherId);
    }

    const { data, error } = await query.order('target_date', { ascending: true });
    if (error) throw error;
    return data;
  }

  /**
   * Fetches students in a specific class along with their academic result status for promotion.
   */
  static async getStudentsForPromotion(classId: string) {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        results!left(status, exam_type, marks_obtained, total_marks),
        fees!left(amount_due, amount_paid, status)
      `)
      .eq('class_id', classId);
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Bulk promotes students to a new class and records the transition in history.
   */
  static async promoteStudents(studentIds: string[], targetClassId: string, academicYearId: string) {
    // 1. Update students table
    const { error: updateError } = await supabase
      .from('students')
      .update({ class_id: targetClassId })
      .in('id', studentIds);

    if (updateError) throw updateError;

    // 2. Insert into history
    const historyRecords = studentIds.map(id => ({
      student_id: id,
      class_id: targetClassId,
      academic_year_id: academicYearId
    }));

    const { error: historyError } = await supabase
      .from('student_class_history')
      .insert(historyRecords);

    if (historyError) throw historyError;

    return { success: true };
  }

  /**
   * Fetches all academic years.
   */
  static async getAcademicYears() {
    const { data, error } = await supabase
      .from('academic_years')
      .select('*')
      .order('year_label', { ascending: false });
    
    if (error) throw error;
    const years = data || [];

    // Safety check: ensure only one is current
    const currentSessions = years.filter(y => y.is_current);
    if (currentSessions.length > 1) {
       console.warn('Multiple active sessions detected. Enforcing single-active-session policy.');
       // Keep only the first one (most recent due to order)
       await this.setCurrentYear(currentSessions[0].id);
       return years.map(y => y.id === currentSessions[0].id ? { ...y, is_current: true } : { ...y, is_current: false });
    }

    return years;
  }
  /**
   * Ensures at least one session is marked as current.
   */
  static async ensureCurrentSession() {
    try {
      const { data: years } = await supabase
        .from('academic_years')
        .select('*');
      
      if (!years || years.length === 0) {
        const { data: created } = await supabase
          .from('academic_years')
          .insert({ year_label: '2024-25', is_current: true })
          .select();
        return created ? created[0] : null;
      }

      const current = years.find(y => y.is_current);
      if (!current && years.length > 0) {
        await this.setCurrentYear(years[0].id);
        return years[0];
      }
      return current;
    } catch (e) {
      console.error('Session Init Error:', e);
      return null;
    }
  }

  /**
   * Creates or updates an academic year.
   */
  static async upsertAcademicYear(year: any) {
    try {
      // If setting as current, reset all others first
      if (year.is_current) {
        await supabase.from('academic_years').update({ is_current: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      }

      // Direct Insert
      const { data, error } = await supabase
        .from('academic_years')
        .insert(year)
        .select();
      
      if (error) {
        // Direct Upsert Fallback
        const { data: upsertData, error: upsertError } = await supabase
          .from('academic_years')
          .upsert(year, { onConflict: 'year_label' })
          .select();
        
        if (upsertError) throw upsertError;

        // If upserted as current, double check reset
        if (year.is_current && upsertData && upsertData[0]) {
           await supabase.from('academic_years').update({ is_current: false }).neq('id', upsertData[0].id);
           await supabase.from('academic_years').update({ is_current: true }).eq('id', upsertData[0].id);
        }
        return upsertData;
      }
      return data;
    } catch (e) {
      console.error('Upsert Session Error:', e);
      throw e;
    }
  }

  /**
   * Sets a specific academic year as the current one and deselects others.
   */
  static async setCurrentYear(yearId: string) {
    // Reset all
    await supabase.from('academic_years').update({ is_current: false }).neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Set target
    const { error } = await supabase
      .from('academic_years')
      .update({ is_current: true })
      .eq('id', yearId);
    
    if (error) throw error;
    return { success: true };
  }

  /**
   * Fetches the class history for a specific student.
   */
  static async getStudentHistory(studentId: string) {
    const { data, error } = await supabase
      .from('student_class_history')
      .select('*, class:classes(grade, section), academic_year:academic_years(year_label)')
      .eq('student_id', studentId)
      .order('promoted_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async updateTaskStatus(taskId: string, status: 'pending' | 'completed') {
    const { data, error } = await (supabase as any)
      .from('teacher_tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  /**
   * Links classes with no academic_year_id to the current session.
   */
  static async linkOrphanClasses(yearId: string) {
    const { error } = await supabase
      .from('classes')
      .update({ academic_year_id: yearId })
      .is('academic_year_id', null);
    
    if (error) throw error;
    return { success: true };
  }

  /**
   * Issues fees to multiple students at once.
   */
  static async issueBulkFees(studentIds: string[], feeData: any) {
    const feeRecords = studentIds.map(id => ({
      student_id: id,
      ...feeData,
      status: 'Unpaid',
      amount_paid: 0
    }));

    const { data, error } = await supabase
      .from('fees')
      .upsert(feeRecords, { onConflict: 'student_id,month,academic_year_id' });
    
    if (error) throw error;
    return data;
  }

  /**
   * Fetches financial status for a report.
   */
  static async getFinancialReport() {
    const { data, error } = await supabase
      .from('fees')
      .select(`
        *,
        student:students(
          id, 
          name, 
          roll_no, 
          class_id, 
          classes(grade, section)
        )
      `)
      .order('month', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async deleteTask(taskId: string) {
    const { error } = await (supabase as any)
      .from('teacher_tasks')
      .delete()
      .eq('id', taskId);
    if (error) throw error;
  }

  static async updateAttendanceRecord(recordId: string, status: string) {
    const { data, error } = await supabase
      .from('attendance')
      .update({ status })
      .eq('id', recordId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}
