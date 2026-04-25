-- ==========================================
-- 🏫 SCHOOL MANAGEMENT SYSTEM: MASTER DATABASE BACKUP
-- ==========================================
-- Description: Consolidated, idempotent SQL script containing the full schema, 
-- security configurations, RLS policies, storage rules, and helper functions.
-- Last Updated: 2026-04-25
-- ==========================================

-- 0. EXTENSIONS & INITIAL SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. HELPER FUNCTIONS (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.migrate_profile_id(old_id uuid, new_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.teachers SET profile_id = new_id WHERE profile_id = old_id;
    UPDATE public.parents SET profile_id = new_id WHERE profile_id = old_id;
    UPDATE public.notifications SET sender_id = new_id WHERE sender_id = old_id;
    UPDATE public.profiles SET id = new_id WHERE id = old_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CORE SCHEMA (TABLES)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role = ANY (ARRAY['admin'::text, 'teacher'::text, 'parent'::text])),
  phone_number text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.academic_years (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  year_label text NOT NULL UNIQUE,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT academic_years_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  salary numeric DEFAULT 0,
  joined_at timestamp with time zone DEFAULT now(),
  profile_picture_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teachers_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  grade text NOT NULL,
  section text NOT NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  class_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  pricing_type text DEFAULT 'free'::text CHECK (pricing_type = ANY (ARRAY['free'::text, 'one_time'::text, 'monthly'::text])),
  price numeric DEFAULT 0,
  discounted_price numeric,
  grade_level integer CHECK (grade_level >= 1 AND grade_level <= 10),
  status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['active'::text, 'draft'::text, 'archived'::text])),
  description text,
  thumbnail_url text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.parents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT parents_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
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
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teacher_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT unique_subject_class_assignment UNIQUE (class_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
  status text DEFAULT 'present'::text CHECK (status = ANY (ARRAY['present'::text, 'absent'::text, 'late'::text])),
  remarks text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  marking_time time DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attendance_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.diary (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT diary_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.fees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  amount_due numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status = ANY (ARRAY['Paid'::text, 'Unpaid'::text])),
  month text NOT NULL,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  items jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fees_pkey PRIMARY KEY (id),
  CONSTRAINT unique_fee_per_month UNIQUE (student_id, month, academic_year_id)
);

CREATE TABLE IF NOT EXISTS public.assessments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
    title text NOT NULL,
    total_marks numeric NOT NULL,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT assessments_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.results (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES public.assessments(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
  marks_obtained numeric DEFAULT 0,
  total_marks numeric DEFAULT 100,
  exam_type text NOT NULL DEFAULT 'quiz',
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  grade text,
  status text CHECK (status = ANY (ARRAY['pass'::text, 'fail'::text, 'pending'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT results_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.timetable (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
  day_of_week text NOT NULL CHECK (day_of_week = ANY (ARRAY['Monday'::text, 'Tuesday'::text, 'Wednesday'::text, 'Thursday'::text, 'Friday'::text, 'Saturday'::text, 'Sunday'::text])),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT timetable_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_role text NOT NULL CHECK (target_role = ANY (ARRAY['all'::text, 'teacher'::text, 'parent'::text])),
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.teacher_tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    assignment_id uuid REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
    admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    task_description text NOT NULL,
    target_date date NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT teacher_tasks_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.teacher_attendance (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
    date date NOT NULL,
    status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave')),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT teacher_attendance_pkey PRIMARY KEY (id),
    CONSTRAINT unique_teacher_attendance UNIQUE (teacher_id, date)
);

-- 3. INDEXES
CREATE UNIQUE INDEX IF NOT EXISTS results_student_assessment_idx ON public.results (student_id, assessment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_subject ON public.attendance (student_id, date, assignment_id) WHERE assignment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_moderator ON public.attendance (student_id, date) WHERE assignment_id IS NULL;

-- 4. HARDENED SECURITY (RLS)
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- Drop all existing policies to ensure a clean state
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- GRANTS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- Profile Policies
CREATE POLICY profiles_anon_read ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY profiles_self_all ON public.profiles FOR ALL TO authenticated USING (id = auth.uid());
CREATE POLICY admin_all ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- Core Read Policies
CREATE POLICY teachers_read ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY students_read ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY parents_read ON public.parents FOR SELECT TO authenticated USING (true);
CREATE POLICY classes_read ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY academic_years_read ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY subjects_read ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY assignments_read ON public.teacher_assignments FOR SELECT TO authenticated USING (true);

-- Admin Management Policies
CREATE POLICY admin_teachers_manage ON public.teachers FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY admin_students_manage ON public.students FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY admin_parents_manage ON public.parents FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY admin_classes_manage ON public.classes FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY admin_academic_years_manage ON public.academic_years FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY admin_subjects_manage ON public.subjects FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY admin_assignments_manage ON public.teacher_assignments FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY admin_fees_manage ON public.fees FOR ALL TO authenticated USING (public.is_admin());

-- Workflow Policies
CREATE POLICY attendance_teacher_manage ON public.attendance FOR ALL TO authenticated USING (
    public.is_admin() OR 
    assignment_id IN (SELECT id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())) OR
    (assignment_id IS NULL AND (SELECT id FROM public.classes WHERE class_teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())) IS NOT NULL)
);
CREATE POLICY attendance_read ON public.attendance FOR SELECT TO authenticated USING (true);

CREATE POLICY results_teacher_manage ON public.results FOR ALL TO authenticated USING (
    public.is_admin() OR 
    subject_id IN (SELECT subject_id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);
CREATE POLICY results_read ON public.results FOR SELECT TO authenticated USING (true);

CREATE POLICY assessments_teacher_manage ON public.assessments FOR ALL TO authenticated USING (
    public.is_admin() OR
    teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
);
CREATE POLICY assessments_read ON public.assessments FOR SELECT TO authenticated USING (true);

CREATE POLICY diary_teacher_manage ON public.diary FOR ALL TO authenticated USING (
    public.is_admin() OR
    assignment_id IN (SELECT id FROM public.teacher_assignments WHERE teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid()))
);
CREATE POLICY diary_read ON public.diary FOR SELECT TO authenticated USING (true);

CREATE POLICY fees_parent_read ON public.fees FOR SELECT TO authenticated USING (
    student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);

-- 5. STORAGE POLICIES
DO $$ 
BEGIN
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('Student', 'Student', true), ('Teacher', 'Teacher', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Clear storage policies
DO $$ 
DECLARE
    pol record;
BEGIN
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'storage'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.%I;', pol.policyname, pol.tablename);
    END LOOP;
END $$;

CREATE POLICY \"Admin Full Access Student\" ON storage.objects FOR ALL TO authenticated USING ( bucket_id = 'Student' AND public.is_admin() );
CREATE POLICY \"Public View Student\" ON storage.objects FOR SELECT TO authenticated, anon USING ( bucket_id = 'Student' );
CREATE POLICY \"Admin Full Access Teacher\" ON storage.objects FOR ALL TO authenticated USING ( bucket_id = 'Teacher' AND public.is_admin() );
CREATE POLICY \"Public View Teacher\" ON storage.objects FOR SELECT TO authenticated, anon USING ( bucket_id = 'Teacher' );

-- 6. RPC FUNCTIONS
CREATE OR REPLACE FUNCTION public.upsert_assessment_results(results_json jsonb) RETURNS void AS $$
DECLARE item jsonb;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(results_json) LOOP
        INSERT INTO public.results (student_id, assessment_id, subject_id, marks_obtained, total_marks, grade, academic_year_id, exam_type)
        VALUES (
            (NULLIF(item->>'student_id', ''))::uuid, (NULLIF(item->>'assessment_id', ''))::uuid, (NULLIF(item->>'subject_id', ''))::uuid,
            (NULLIF(item->>'marks_obtained', ''))::numeric, (NULLIF(item->>'total_marks', ''))::numeric, item->>'grade',
            (NULLIF(item->>'academic_year_id', ''))::uuid, COALESCE(item->>'exam_type', 'quiz')
        )
        ON CONFLICT (student_id, assessment_id) DO UPDATE SET
            marks_obtained = EXCLUDED.marks_obtained, total_marks = EXCLUDED.total_marks, grade = EXCLUDED.grade,
            subject_id = EXCLUDED.subject_id, academic_year_id = EXCLUDED.academic_year_id, exam_type = EXCLUDED.exam_type;
    END LOOP;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.upsert_student_attendance(attendance_json jsonb) RETURNS void AS $$
DECLARE item jsonb; v_assignment_id uuid;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(attendance_json) LOOP
        v_assignment_id := (NULLIF(item->>'assignment_id', ''))::uuid;
        IF v_assignment_id IS NOT NULL THEN
            INSERT INTO public.attendance (student_id, assignment_id, date, status, marking_time)
            VALUES ((item->>'student_id')::uuid, v_assignment_id, (item->>'date')::date, item->>'status', (COALESCE(item->>'marking_time', now()::text))::time)
            ON CONFLICT (student_id, date, assignment_id) WHERE assignment_id IS NOT NULL
            DO UPDATE SET status = EXCLUDED.status, marking_time = EXCLUDED.marking_time;
        ELSE
            INSERT INTO public.attendance (student_id, assignment_id, date, status, marking_time)
            VALUES ((item->>'student_id')::uuid, NULL, (item->>'date')::date, item->>'status', (COALESCE(item->>'marking_time', now()::text))::time)
            ON CONFLICT (student_id, date) WHERE assignment_id IS NULL
            DO UPDATE SET status = EXCLUDED.status, marking_time = EXCLUDED.marking_time;
        END IF;
    END LOOP;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. REALTIME PUBLICATION
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
EXCEPTION 
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
DECLARE
    table_name text;
    tables_to_add text[] := ARRAY['notifications', 'diary', 'attendance', 'teacher_tasks', 'results', 'assessments', 'fees', 'profiles', 'students', 'teachers', 'classes'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_add LOOP
        BEGIN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', table_name);
        EXCEPTION
            WHEN duplicate_object THEN NULL;
            WHEN others THEN NULL;
        END;
    END LOOP;
END $$;

-- 8. INITIALIZATION
DO $$
DECLARE
    current_year_id uuid;
BEGIN
    SELECT id INTO current_year_id FROM public.academic_years WHERE is_current = true LIMIT 1;
    IF current_year_id IS NULL THEN
        SELECT id INTO current_year_id FROM public.academic_years ORDER BY year_label DESC LIMIT 1;
        IF current_year_id IS NULL THEN
            INSERT INTO public.academic_years (year_label, is_current)
            VALUES ('2024-2025', true)
            ON CONFLICT (year_label) DO UPDATE SET is_current = true;
        ELSE
            UPDATE public.academic_years SET is_current = true WHERE id = current_year_id;
        END IF;
    END IF;
END $$;
