-- ==========================================
-- SCHOOL MANAGEMENT SYSTEM: PRODUCTION REPAIR & SECURITY
-- ==========================================
-- Instructions: Copy and paste this entire script into your Supabase SQL Editor and hit "Run".

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

-- 1. ACADEMIC SESSIONS INITIALIZATION
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

-- 2. SCHEMA ENHANCEMENTS (MISSING COLUMNS & TABLES)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_cnic text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS admission_date date DEFAULT now();
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS profile_picture_url text;

ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS profile_picture_url text;

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS class_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL;

ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS assignment_id uuid REFERENCES public.teacher_assignments(id) ON DELETE CASCADE;
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS marking_time time DEFAULT now();

ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]';
ALTER TABLE public.fees ADD COLUMN IF NOT EXISTS academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL;

-- Standardize Fee Columns
DO $$ BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='year_id') THEN
        UPDATE public.fees SET academic_year_id = year_id WHERE academic_year_id IS NULL;
        ALTER TABLE public.fees DROP COLUMN IF EXISTS year_id;
    END IF;
END $$;

-- Create Missing Tables
CREATE TABLE IF NOT EXISTS public.teacher_tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    assignment_id uuid REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
    admin_id uuid REFERENCES public.profiles(id),
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

ALTER TABLE public.results 
ADD COLUMN IF NOT EXISTS assessment_id uuid REFERENCES public.assessments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS total_marks numeric DEFAULT 100,
ADD COLUMN IF NOT EXISTS marks_obtained numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS grade text,
ADD COLUMN IF NOT EXISTS subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE;

-- 3. CONSTRAINTS & INDEXES (Data Cleanup First)
-- Clean up duplicate teacher assignments (Keep only the most recent one per subject/class)
DELETE FROM public.teacher_assignments a
WHERE a.id NOT IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY class_id, subject_id ORDER BY created_at DESC) as rn
        FROM public.teacher_assignments
    ) t WHERE t.rn = 1
);

ALTER TABLE public.teacher_assignments DROP CONSTRAINT IF EXISTS unique_subject_class_assignment;
ALTER TABLE public.teacher_assignments ADD CONSTRAINT unique_subject_class_assignment UNIQUE (class_id, subject_id);

-- Clean up duplicate fees (Keep only the most recent one per student/month/session)
DELETE FROM public.fees f
WHERE f.id NOT IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY student_id, month, academic_year_id ORDER BY created_at DESC) as rn
        FROM public.fees
    ) t WHERE t.rn = 1
);

ALTER TABLE public.fees DROP CONSTRAINT IF EXISTS unique_fee_per_month;
ALTER TABLE public.fees ADD CONSTRAINT unique_fee_per_month UNIQUE (student_id, month, academic_year_id);

CREATE UNIQUE INDEX IF NOT EXISTS results_student_assessment_idx ON public.results (student_id, assessment_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_subject ON public.attendance (student_id, date, assignment_id) WHERE assignment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_moderator ON public.attendance (student_id, date) WHERE assignment_id IS NULL;

-- 4. HARDENED PRODUCTION RLS (SECURE MERGE)
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    END LOOP;
END $$;

-- Drop insecure policies
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

-- SECURE POLICIES
CREATE POLICY profiles_anon_read ON public.profiles FOR SELECT TO anon USING (true);
CREATE POLICY profiles_self_all ON public.profiles FOR ALL TO authenticated USING (id = auth.uid());
CREATE POLICY admin_all ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- Standard Role-Based Policies
CREATE POLICY teachers_read ON public.teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY admin_teachers_all ON public.teachers FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY students_read ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY admin_students_all ON public.students FOR ALL TO authenticated USING (public.is_admin());

CREATE POLICY parents_read ON public.parents FOR SELECT TO authenticated USING (true);
CREATE POLICY admin_parents_all ON public.parents FOR ALL TO authenticated USING (public.is_admin());

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

-- Financial Policies
CREATE POLICY fees_admin_all ON public.fees FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY fees_parent_read ON public.fees FOR SELECT TO authenticated USING (
    student_id IN (SELECT id FROM public.students WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid()))
);

-- Metadata (Read for all, Write for Admin)
CREATE POLICY metadata_read ON public.academic_years FOR SELECT TO authenticated USING (true);
CREATE POLICY metadata_admin ON public.academic_years FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY classes_read ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY classes_admin ON public.classes FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY subjects_read ON public.subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY subjects_admin ON public.subjects FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY assignments_read ON public.teacher_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY assignments_admin ON public.teacher_assignments FOR ALL TO authenticated USING (public.is_admin());

-- 5. RPC FUNCTIONS (STABLE & SECURE)
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

CREATE OR REPLACE FUNCTION public.perform_great_promotion(old_class_id uuid, new_class_id uuid, academic_year_id uuid) RETURNS void AS $$
BEGIN
    UPDATE public.students SET class_id = new_class_id WHERE class_id = old_class_id;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. REALTIME PUBLICATION
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
            WHEN others THEN NULL; -- Ignore if table doesn't exist
        END;
    END LOOP;
END $$;

-- Done!
