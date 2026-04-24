-- ==========================================
-- 🛡️ PRODUCTION SECURITY CONFIGURATION (RLS) - NUCLEAR RESET
-- ==========================================
-- This script clears ALL potential legacy policies and implements a clean, recursion-safe security layer.

-- 0. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1. ENABLE RLS ON EVERYTHING
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- 2. NUCLEAR POLICY DROP (Removes every policy I might have created)
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

-- PROFILES (Separated by role to prevent login recursion)
CREATE POLICY profiles_anon_login ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY profiles_self_access ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY profiles_admin_all ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- PARENTS & TEACHERS (Crucial: These are often joined and need non-recursive policies)
CREATE POLICY parents_read_all ON public.parents FOR SELECT TO authenticated USING (true);
CREATE POLICY teachers_read_all ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY admin_manage_parents ON public.parents FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY admin_manage_teachers ON public.teachers FOR ALL TO authenticated USING (public.is_admin());

-- STUDENTS
CREATE POLICY students_parent_read ON public.students FOR SELECT TO authenticated USING (
  parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid())
);
CREATE POLICY students_teacher_read ON public.students FOR SELECT TO authenticated USING (
  class_id IN (SELECT class_id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);
CREATE POLICY students_admin_all ON public.students FOR ALL TO authenticated USING (public.is_admin());

-- ATTENDANCE & RESULTS
CREATE POLICY attendance_parent_read ON public.attendance FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);
CREATE POLICY attendance_teacher_manage ON public.attendance FOR ALL TO authenticated USING (
  assignment_id IN (SELECT id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);
CREATE POLICY attendance_admin_all ON public.attendance FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY results_parent_read ON public.results FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);
CREATE POLICY results_teacher_manage ON public.results FOR ALL TO authenticated USING (
  teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
);
CREATE POLICY results_admin_all ON public.results FOR ALL TO authenticated USING (public.is_admin());

-- FEES
CREATE POLICY fees_parent_read ON public.fees FOR SELECT TO authenticated USING (
  student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);
CREATE POLICY fees_admin_all ON public.fees FOR ALL TO authenticated USING (public.is_admin());

-- DIARY & NOTIFICATIONS
CREATE POLICY diary_parent_read ON public.diary FOR SELECT TO authenticated USING (
  assignment_id IN (
    SELECT ta.id FROM public.teacher_assignments ta
    JOIN public.students s ON s.class_id = ta.class_id
    WHERE s.parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid())
  )
);
CREATE POLICY diary_teacher_manage ON public.diary FOR ALL TO authenticated USING (
  assignment_id IN (SELECT id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);
CREATE POLICY diary_admin_all ON public.diary FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY notifications_read_all ON public.notifications FOR SELECT USING (true);
CREATE POLICY notifications_admin_all ON public.notifications FOR ALL TO authenticated USING (public.is_admin());

-- PUBLIC METADATA (Readable by authenticated users)
CREATE POLICY academic_years_read ON public.academic_years FOR SELECT USING (true);
CREATE POLICY classes_read ON public.classes FOR SELECT USING (true);
CREATE POLICY subjects_read ON public.subjects FOR SELECT USING (true);
CREATE POLICY timetable_read ON public.timetable FOR SELECT USING (true);
CREATE POLICY assignments_read ON public.teacher_assignments FOR SELECT USING (true);

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
    tables_to_add text[] := ARRAY['notifications', 'diary', 'attendance', 'teacher_tasks', 'results', 'assessments', 'timetable', 'fees'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_add LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END LOOP;
END $$;
