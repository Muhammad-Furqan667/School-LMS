-- ==========================================
-- 🛡️ PRODUCTION SECURITY CONFIGURATION (RLS) - NUCLEAR RESET
-- ==========================================
-- This script clears ALL potential legacy policies and implements a clean, recursion-safe security layer.

-- 0. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- SECURITY DEFINER ensures this runs with bypassrls privileges (as postgres)
  -- This prevents recursion when called from a profiles policy.
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1. ENABLE RLS ON EVERYTHING & DROP OBSOLETE TABLES
DROP TABLE IF EXISTS public.coupons CASCADE;

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- 2. NUCLEAR POLICY DROP (Removes every policy)
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 3. IMPLEMENT FRESH, RECURSION-SAFE POLICIES

-- PROFILES
-- Fix for sign-in: anon must be able to find profiles
CREATE POLICY profiles_anon_read ON public.profiles FOR SELECT TO anon USING (true);
-- Self access
CREATE POLICY profiles_self_read ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
-- Admin access (Uses is_admin() which is SECURITY DEFINER to avoid recursion)
CREATE POLICY profiles_admin_all ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- PARENTS & TEACHERS
CREATE POLICY parents_read_all ON public.parents FOR SELECT TO authenticated USING (true);
CREATE POLICY teachers_read_all ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY admin_manage_parents ON public.parents FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY admin_manage_teachers ON public.teachers FOR ALL TO authenticated USING (public.is_admin());

-- STUDENTS
CREATE POLICY students_read_all ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY students_admin_all ON public.students FOR ALL TO authenticated USING (public.is_admin());

-- ATTENDANCE & RESULTS
CREATE POLICY attendance_admin_all ON public.attendance FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY attendance_teacher_manage ON public.attendance FOR ALL TO authenticated USING (
  assignment_id IN (SELECT id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);
CREATE POLICY attendance_parent_read ON public.attendance FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);

CREATE POLICY results_admin_all ON public.results FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY results_teacher_manage ON public.results FOR ALL TO authenticated USING (
  teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
);
CREATE POLICY results_parent_read ON public.results FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);

-- FEES
CREATE POLICY fees_admin_all ON public.fees FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY fees_parent_read ON public.fees FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);

-- DIARY & NOTIFICATIONS
CREATE POLICY diary_admin_all ON public.diary FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY diary_teacher_manage ON public.diary FOR ALL TO authenticated USING (
  assignment_id IN (SELECT id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);
CREATE POLICY diary_parent_read ON public.diary FOR SELECT TO authenticated USING (
  assignment_id IN (
    SELECT ta.id FROM public.teacher_assignments ta
    JOIN public.students s ON s.class_id = ta.class_id
    WHERE s.parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid())
  )
);

CREATE POLICY notifications_admin_all ON public.notifications FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY notifications_read_all ON public.notifications FOR SELECT USING (true);

-- ACADEMIC METADATA (Admins manage, others read)
CREATE POLICY academic_years_admin_all ON public.academic_years FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY academic_years_read ON public.academic_years FOR SELECT USING (true);

CREATE POLICY classes_admin_all ON public.classes FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY classes_read ON public.classes FOR SELECT USING (true);

CREATE POLICY subjects_admin_all ON public.subjects FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY subjects_read ON public.subjects FOR SELECT USING (true);

CREATE POLICY timetable_admin_all ON public.timetable FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY timetable_read ON public.timetable FOR SELECT USING (true);

CREATE POLICY assignments_admin_all ON public.teacher_assignments FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY assignments_read ON public.teacher_assignments FOR SELECT USING (true);

-- OTHER TABLES
CREATE POLICY teacher_tasks_admin_all ON public.teacher_tasks FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY teacher_tasks_read ON public.teacher_tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY teacher_attendance_admin_all ON public.teacher_attendance FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY teacher_attendance_read ON public.teacher_attendance FOR SELECT TO authenticated USING (true);

CREATE POLICY assessments_admin_all ON public.assessments FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY assessments_read ON public.assessments FOR SELECT USING (true);

CREATE POLICY enrollments_admin_all ON public.enrollments FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY enrollments_read ON public.enrollments FOR SELECT USING (true);

CREATE POLICY lectures_admin_all ON public.lectures FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY lectures_read ON public.lectures FOR SELECT USING (true);

CREATE POLICY student_class_history_admin_all ON public.student_class_history FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY student_class_history_read ON public.student_class_history FOR SELECT USING (true);

-- 4. REALTIME (Idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

DO $$
DECLARE
    table_name text;
    tables_to_add text[] := ARRAY['notifications', 'diary', 'attendance', 'teacher_tasks', 'results', 'assessments', 'timetable', 'fees', 'profiles', 'students', 'teachers', 'classes'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_add LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END LOOP;
END $$;

