-- ==========================================
-- 🛡️ PRODUCTION SECURITY CONFIGURATION (RLS)
-- ==========================================
-- This script is idempotent and can be run multiple times.

-- 1. ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

-- 2. CLEAN UP EXISTING POLICIES (Ensures Idempotency)
DO $$ 
BEGIN
    -- Profiles
    DROP POLICY IF EXISTS profile_self_access ON public.profiles;
    DROP POLICY IF EXISTS admin_profile_all ON public.profiles;
    
    -- Parents & Teachers
    DROP POLICY IF EXISTS parent_read_self ON public.parents;
    DROP POLICY IF EXISTS teacher_read_self ON public.teachers;
    
    -- Students
    DROP POLICY IF EXISTS parent_read_children ON public.students;
    DROP POLICY IF EXISTS teacher_read_class_students ON public.students;
    
    -- Academic Data
    DROP POLICY IF EXISTS parent_view_academic ON public.results;
    DROP POLICY IF EXISTS teacher_manage_results ON public.results;
    DROP POLICY IF EXISTS parent_view_attendance ON public.attendance;
    DROP POLICY IF EXISTS teacher_manage_attendance ON public.attendance;
    
    -- Fees
    DROP POLICY IF EXISTS parent_view_fees ON public.fees;
    
    -- Diary & Notifications
    DROP POLICY IF EXISTS everyone_read_notifications ON public.notifications;
    DROP POLICY IF EXISTS parent_view_diary ON public.diary;
    
    -- New Tables
    DROP POLICY IF EXISTS public_read_academic_years ON public.academic_years;
    DROP POLICY IF EXISTS public_read_classes ON public.classes;
    DROP POLICY IF EXISTS public_read_subjects ON public.subjects;
    DROP POLICY IF EXISTS public_read_timetable ON public.timetable;
    DROP POLICY IF EXISTS public_read_assignments ON public.teacher_assignments;
    
    -- Assessments & Lectures
    DROP POLICY IF EXISTS teacher_manage_assessments ON public.assessments;
    DROP POLICY IF EXISTS parent_view_assessments ON public.assessments;
    
    -- Teacher Attendance
    DROP POLICY IF EXISTS teacher_read_own_attendance ON public.teacher_attendance;
END $$;

-- 3. RECREATE POLICIES

-- PROFILES
CREATE POLICY profile_self_access ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY admin_profile_all ON public.profiles FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- PARENTS & TEACHERS
CREATE POLICY parent_read_self ON public.parents FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY teacher_read_self ON public.teachers FOR SELECT USING (profile_id = auth.uid());

-- STUDENTS
CREATE POLICY parent_read_children ON public.students FOR SELECT USING (
  parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid())
);
CREATE POLICY teacher_read_class_students ON public.students FOR SELECT USING (
  class_id IN (SELECT class_id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);

-- ACADEMIC DATA
CREATE POLICY parent_view_academic ON public.results FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);
CREATE POLICY teacher_manage_results ON public.results FOR ALL USING (
  teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
);

CREATE POLICY parent_view_attendance ON public.attendance FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);
CREATE POLICY teacher_manage_attendance ON public.attendance FOR ALL USING (
  assignment_id IN (SELECT id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);

-- FEES
CREATE POLICY parent_view_fees ON public.fees FOR SELECT USING (
  student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);

-- DIARY & NOTIFICATIONS
CREATE POLICY everyone_read_notifications ON public.notifications FOR SELECT USING (true);
CREATE POLICY parent_view_diary ON public.diary FOR SELECT USING (
  assignment_id IN (
    SELECT ta.id FROM public.teacher_assignments ta
    JOIN public.students s ON s.class_id = ta.class_id
    WHERE s.parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid())
  )
);

-- NEWLY OPTIMIZED TABLES (Public Read, Admin Manage)
CREATE POLICY public_read_academic_years ON public.academic_years FOR SELECT USING (true);
CREATE POLICY public_read_classes ON public.classes FOR SELECT USING (true);
CREATE POLICY public_read_subjects ON public.subjects FOR SELECT USING (true);
CREATE POLICY public_read_timetable ON public.timetable FOR SELECT USING (true);
CREATE POLICY public_read_assignments ON public.teacher_assignments FOR SELECT USING (true);

-- ASSESSMENTS & LECTURES
CREATE POLICY teacher_manage_assessments ON public.assessments FOR ALL USING (
  teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
);
CREATE POLICY parent_view_assessments ON public.assessments FOR SELECT USING (
  class_id IN (
    SELECT class_id FROM public.students 
    WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid())
  )
);

-- TEACHER ATTENDANCE
CREATE POLICY teacher_read_own_attendance ON public.teacher_attendance FOR SELECT USING (
  teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
);

-- ==========================================
-- 📡 REALTIME CONFIGURATION (Idempotent)
-- ==========================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Add tables one by one to avoid errors if they are already added
DO $$
DECLARE
    table_name text;
    tables_to_add text[] := ARRAY['notifications', 'diary', 'attendance', 'teacher_tasks', 'results', 'assessments', 'timetable', 'fees'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_add LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
        EXCEPTION
            WHEN duplicate_object THEN
                -- Table already in publication, ignore
                NULL;
        END;
    END LOOP;
END $$;
