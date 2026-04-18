import { supabase as libSupabase } from '../lib/supabase';
const supabase = libSupabase as any;
import type { TablesInsert } from '../types/database';

/**
 * @file schoolService.ts
 * @description Centralized service layer for all School Management System logic and database interactions.
 * Following the Logic-Isolation philosophy, UI components must only interact with this service.
 */

export class SchoolService {
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
      .select('*, academic_years(*)');
    if (error) throw error;
    return data;
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
    let query = supabase.from('students').select('*, parents(*), classes(*)');
    if (classId) query = query.eq('class_id', classId);
    if (parentId) query = query.eq('parent_id', parentId);
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
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
    const { data, error } = await supabase
      .from('diary')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
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
   * Fetches attendance records for a student.
   */
  static async getAttendance(studentId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * Calculates attendance summary for a student.
   */
  static async getAttendanceStats(studentId: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', studentId);
    
    if (error) throw error;
    
    const stats = {
      present: 0,
      absent: 0,
      late: 0,
      total: data.length,
      percentage: 0
    };

    data.forEach((rec: any) => {
      if (rec.status === 'present') stats.present++;
      else if (rec.status === 'absent') stats.absent++;
      else if (rec.status === 'late') stats.late++;
    });

    if (stats.total > 0) {
      stats.percentage = Math.round(((stats.present + (stats.late * 0.5)) / stats.total) * 100);
    }

    return stats;
  }

  /**
   * Fetches assignments for a specific teacher.
   */
  static async getTeacherAssignments(teacherId: string) {
    const { data, error } = await supabase
      .from('teacher_assignments')
      .select(`
        *,
        class:classes(*),
        subject:subjects(*)
      `)
      .eq('teacher_id', teacherId);
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
    // Custom absolute manual Auth - Enforce Lowercase!
    let searchUsername = username.includes('@') ? username.split('@')[0] : username;
    searchUsername = searchUsername.toLowerCase().trim();
      
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', searchUsername)
      .eq('password', password)
      .maybeSingle();
      
    if (error) throw error;
    if (!profile) throw new Error('Invalid credentials. Check your username and password.');

    localStorage.setItem('custom_user_id', profile.id);
    return profile;
  }

  static async signOut() {
    localStorage.removeItem('custom_user_id');
    // Also try clearing supabase just in case there's a leftover session
    await supabase.auth.signOut().catch(() => {});
  }

  static async generateAccount(username: string, password: string, role: 'admin' | 'teacher' | 'parent') {
    // Ripping out Supabase auth. Just pushing straight to DB.
    // Enforce lowercase system-wide
    let rawUsername = username.includes('@') ? username.split('@')[0] : username;
    rawUsername = rawUsername.toLowerCase().trim();
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        username: rawUsername,
        password: password,
        role: role,
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      if (profileError.message.includes('duplicate key value')) {
        throw new Error('This account (Roll No / ID) is already registered.');
      }
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
   * Fetches fee history and status for a student.
   */
  static async getStudentFees(studentId: string) {
    const { data, error } = await supabase
      .from('fees')
      .select('*, academic_years(*)')
      .eq('student_id', studentId)
      .order('month', { ascending: false });
    
    if (error) throw error;
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
      .select('*, subjects(*), students(*)');
    
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
      .select('id, class_id, is_locked, created_at, classes(grade)');
    if (errSt) throw errSt;

    const { data: teachers, error: errTe } = await supabase
      .from('teachers')
      .select('id');
    if (errTe) throw errTe;

    const { data: fees, error: errFe } = await supabase
      .from('fees')
      .select('amount_due, amount_paid, status');
    if (errFe) throw errFe;

    const { count: subjectCount } = await supabase.from('subjects').select('*', { count: 'exact', head: true });

    const totalRevenue = (fees || [])
      .reduce((sum: number, f: any) => sum + Number(f.amount_paid || 0), 0);

    const pendingFees = (fees || [])
      .filter((f: any) => f.status !== 'paid')
      .reduce((sum: number, f: any) => sum + (Number(f.amount_due || 0) - Number(f.amount_paid || 0)), 0);

    const gradeCounts: Record<string, number> = {};
    (students || []).forEach((s: any) => {
      let grade = (s.classes as any)?.grade;
      if (!grade) {
        grade = s.class_id ? 'Unknown' : 'Graduated';
      }
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
      gradeDistribution: Object.entries(gradeCounts).map(([name, value]) => ({ name: `Grade ${name}`, value })),
      recentStudents: recentStudentsCount,
      feesPaidCount: (fees || []).filter((f: any) => f.status === 'paid').length,
      feesUnpaidCount: (fees || []).filter((f: any) => f.status !== 'paid').length,
    };
  }

  static async getTeacherStats(profileId: string) {
    const { data: teacher } = await supabase
      .from('teachers')
      .select('id')
      .eq('profile_id', profileId)
      .single();

    if (!teacher) throw new Error('Teacher record not found');

    const { data: stats, error } = await (supabase as any)
      .from('enrollments')
      .select('price_at_enrollment, payment_status, subjects!inner(*)')
      .eq('subjects.teacher_id', teacher.id);

    if (error) throw error;

    const revenue = stats
      .filter((s: any) => s.payment_status === 'paid')
      .reduce((sum: number, s: any) => sum + Number(s.price_at_enrollment), 0);

    return {
      revenue,
      totalStudents: stats.length,
      subjectsCount: stats.length > 0 ? [...new Set(stats.map((s: any) => s.subjects.id))].length : 0
    };
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
    // Note: This requires the user to be using their profile id or username
    // For simplicity in this dev phase, we use the account generation logic
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', id)
      .single();

    if (!profile) throw new Error('User profile not found');

    const { error } = await (supabase as any)
      .from('profiles')
      .update({ password: newPassword })
      .eq('id', profile.id);

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
        teacher_assignments(
          id,
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
    const { data, error } = await supabase
      .from('fees')
      .update({ status, amount_paid: amountPaid })
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
}
