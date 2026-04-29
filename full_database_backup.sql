BEGIN;

-- ==========================================
-- 🏫 SCHOOL MANAGEMENT SYSTEM: MASTER DATABASE BACKUP
-- ==========================================
-- Version: 3.3 (Teacher Academic Permissions Fix)
-- ==========================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 🔑 SECURE PASSWORD RESET (ADMIN ONLY)
CREATE OR REPLACE FUNCTION public.admin_reset_password(target_id uuid, new_password text)
RETURNS void AS $$
BEGIN
  -- 🔒 SECURITY CHECK: Ensure caller is Admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can reset passwords.';
  END IF;

  -- 🔑 Update Supabase Auth table directly using pgcrypto
  UPDATE auth.users 
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, extensions;

-- 2. TABLES (IDEMPOTENT)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'parent')),
  phone_number text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.academic_years (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  year_label text NOT NULL UNIQUE,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  salary numeric DEFAULT 0,
  joined_at timestamp with time zone DEFAULT now(),
  profile_picture_url text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.classes (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  grade text NOT NULL,
  section text NOT NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  class_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  pricing_type text DEFAULT 'free' CHECK (pricing_type IN ('free', 'one_time', 'monthly')),
  price numeric DEFAULT 0,
  discounted_price numeric,
  grade_level integer CHECK (grade_level >= 1 AND grade_level <= 10),
  status text DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'archived')),
  description text,
  thumbnail_url text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.parents (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  roll_no text NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES public.parents(id) ON DELETE SET NULL,
  is_locked boolean DEFAULT false,
  status text DEFAULT 'Active',
  admission_date date DEFAULT now(),
  profile_picture_url text,
  father_name text,
  cnic text,
  parent_cnic text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_class_history (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE CASCADE,
  promoted_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_subject_class_assignment UNIQUE (class_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
  status text DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  remarks text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  marking_time time DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  title text NOT NULL,
  total_marks numeric NOT NULL,
  date date NOT NULL,
  passing_marks numeric,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.results (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  assessment_id uuid REFERENCES public.assessments(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  marks_obtained numeric NOT NULL,
  total_marks numeric NOT NULL DEFAULT 100,
  exam_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pass', 'fail', 'pending')),
  grade text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.diary (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fees (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  amount_due numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('Paid', 'Unpaid', 'Partial', 'paid', 'unpaid', 'partial')),
  month text NOT NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  items jsonb DEFAULT '[]',
  breakdown jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_fee_per_month UNIQUE (student_id, month, academic_year_id)
);

CREATE TABLE IF NOT EXISTS public.timetable (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_role text NOT NULL CHECK (target_role IN ('all', 'teacher', 'parent')),
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teacher_tasks (
  id uuid NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assignment_id uuid REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
  task_description text NOT NULL,
  target_date date NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teacher_attendance (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave')),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_teacher_attendance UNIQUE (teacher_id, date)
);

-- 3. SECURITY CONFIGURATION
-- Enable RLS for ALL tables
DO $$ 
DECLARE t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- Drop ALL existing policies to ensure a clean idempotent state
DO $$ 
DECLARE pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 4. POLICIES
-- Profiles
CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY admin_profiles_manage ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- Standard Admin Management
DO $$ 
DECLARE 
    tbl text;
    tables text[] := ARRAY['academic_years', 'teachers', 'parents', 'students', 'classes', 'subjects', 'teacher_assignments', 'fees', 'teacher_attendance', 'timetable', 'notifications', 'teacher_tasks', 'student_class_history'];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('CREATE POLICY %I_admin_all ON public.%I FOR ALL TO authenticated USING (public.is_admin());', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_read ON public.%I FOR SELECT TO authenticated USING (true);', tbl, tbl);
    END LOOP;
END $$;

-- Academic Management (Assessments & Results)
-- Teachers need to manage their own academic data
CREATE POLICY assessments_manage ON public.assessments FOR ALL TO authenticated USING (
    public.is_admin() OR 
    teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
);
CREATE POLICY assessments_read ON public.assessments FOR SELECT TO authenticated USING (true);

CREATE POLICY results_manage ON public.results FOR ALL TO authenticated USING (
    public.is_admin() OR 
    teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
);
CREATE POLICY results_read ON public.results FOR SELECT TO authenticated USING (true);

-- Workflow Policies
CREATE POLICY attendance_manage ON public.attendance FOR ALL TO authenticated USING (
    public.is_admin() OR 
    assignment_id IN (SELECT id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())) OR
    (assignment_id IS NULL AND (SELECT id FROM public.classes WHERE class_teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())) IS NOT NULL)
);
CREATE POLICY attendance_read ON public.attendance FOR SELECT TO authenticated USING (true);

CREATE POLICY diary_manage ON public.diary FOR ALL TO authenticated USING (
    public.is_admin() OR
    assignment_id IN (SELECT id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);
CREATE POLICY diary_read ON public.diary FOR SELECT TO authenticated USING (true);

CREATE POLICY teacher_tasks_update ON public.teacher_tasks FOR UPDATE TO authenticated USING (
    assignment_id IN (SELECT id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);

-- 5. GRANTS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 6. REALTIME
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

-- Dynamically add all tables to realtime
DO $$
DECLARE 
    tbl record;
BEGIN
    FOR tbl IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl.table_name);
        EXCEPTION WHEN others THEN NULL; END;
    END LOOP;
END $$;

COMMIT;
