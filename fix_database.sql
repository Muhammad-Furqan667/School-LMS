-- ==========================================
-- SCHOOL MANAGEMENT SYSTEM: DATABASE REPAIR
-- ==========================================
-- Instructions: Copy and paste this entire script into your Supabase SQL Editor and hit "Run".

-- 1. ACADEMIC SESSIONS INITIALIZATION
-- This ensures a current session exists for classes to link to.
DO $$
DECLARE
    current_year_id uuid;
BEGIN
    SELECT id INTO current_year_id FROM public.academic_years WHERE is_current = true LIMIT 1;
    
    IF current_year_id IS NULL THEN
        -- Check if any year exists
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

-- 2. ADD MISSING COLUMNS
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS parent_cnic text;

-- 3. FIX TABLE PERMISSIONS (GRANTS)
GRANT ALL ON TABLE public.teacher_assignments TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.timetable TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.students TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.teachers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.parents TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.classes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subjects TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.results TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.academic_years TO anon, authenticated, service_role;

-- Add Section Moderator column to Classes
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS class_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL;

-- 4. FIX ROW LEVEL SECURITY (RLS) POLICIES
DROP POLICY IF EXISTS "Allow all operations for authenticated users on teacher_assignments" ON public.teacher_assignments;
CREATE POLICY "Allow all operations for authenticated users on teacher_assignments" 
ON public.teacher_assignments AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users on students" ON public.students;
CREATE POLICY "Allow all operations for authenticated users on students" 
ON public.students AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users on results" ON public.results;
CREATE POLICY "Allow all operations for authenticated users on results" 
ON public.results AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users on timetable" ON public.timetable;
CREATE POLICY "Allow all operations for authenticated users on timetable" 
ON public.timetable AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users on academic_years" ON public.academic_years;
CREATE POLICY "Allow all operations for authenticated users on academic_years" 
ON public.academic_years AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

-- 5. ATTENDANCE SYSTEM REPAIR
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS assignment_id uuid,
ADD COLUMN IF NOT EXISTS marking_time time DEFAULT now();

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_assignment_fkey') THEN
        ALTER TABLE public.attendance 
        ADD CONSTRAINT attendance_assignment_fkey 
        FOREIGN KEY (assignment_id) REFERENCES public.teacher_assignments(id) ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_attendance') THEN
        ALTER TABLE public.attendance 
        ADD CONSTRAINT unique_attendance UNIQUE (student_id, date, assignment_id);
    END IF;
END $$;

GRANT ALL ON TABLE public.attendance TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Allow all operations for authenticated users on attendance" ON public.attendance;
CREATE POLICY "Allow all operations for authenticated users on attendance" 
ON public.attendance AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users on classes" ON public.classes;
CREATE POLICY "Allow all operations for authenticated users on classes" 
ON public.classes AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users on teachers" ON public.teachers;
CREATE POLICY "Allow all operations for authenticated users on teachers" 
ON public.teachers AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users on parents" ON public.parents;
CREATE POLICY "Allow all operations for authenticated users on parents" 
ON public.parents AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users on subjects" ON public.subjects;
CREATE POLICY "Allow all operations for authenticated users on subjects" 
ON public.subjects AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations for authenticated users on fees" ON public.fees;
CREATE POLICY "Allow all operations for authenticated users on fees" 
ON public.fees AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

-- 6. FEE SYSTEM REPAIR & ENHANCEMENT
ALTER TABLE public.fees DROP CONSTRAINT IF EXISTS fees_status_check;
ALTER TABLE public.fees ADD CONSTRAINT fees_status_check 
CHECK (status = ANY (ARRAY['Paid'::text, 'Unpaid'::text, 'Partial'::text, 'paid'::text, 'unpaid'::text, 'partial'::text]));

UPDATE public.fees SET status = 'Paid' WHERE status ILIKE 'paid';
UPDATE public.fees SET status = 'Unpaid' WHERE status ILIKE 'unpaid';
UPDATE public.fees SET status = 'Partial' WHERE status ILIKE 'partial';

ALTER TABLE public.fees 
ADD COLUMN IF NOT EXISTS items jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL;

-- Standardize column names across the system
DO $$ 
BEGIN 
    -- If both exist, migrate data from year_id to academic_year_id
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='year_id') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='academic_year_id') THEN
        UPDATE public.fees SET academic_year_id = year_id WHERE academic_year_id IS NULL;
        ALTER TABLE public.fees DROP COLUMN year_id;
    -- If only year_id exists, rename it
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fees' AND column_name='year_id') THEN
        ALTER TABLE public.fees RENAME COLUMN year_id TO academic_year_id;
    END IF;
END $$;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_fee_per_month') THEN
        ALTER TABLE public.fees 
        ADD CONSTRAINT unique_fee_per_month UNIQUE (student_id, month, academic_year_id);
    END IF;
END $$;

-- 7. STUDENT STATUS ENHANCEMENT
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active',
ADD COLUMN IF NOT EXISTS admission_date date DEFAULT now();

-- 8. TEACHER TASKS SYSTEM
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

GRANT ALL ON TABLE public.teacher_tasks TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Allow all operations for authenticated users on teacher_tasks" ON public.teacher_tasks;
CREATE POLICY "Allow all operations for authenticated users on teacher_tasks" 
ON public.teacher_tasks AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

UPDATE public.classes
SET academic_year_id = (SELECT id FROM public.academic_years WHERE is_current = true LIMIT 1)
WHERE academic_year_id IS NULL;

-- 10. TEACHER ATTENDANCE SYSTEM
CREATE TABLE IF NOT EXISTS public.teacher_attendance (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
    date date NOT NULL,
    status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'leave')),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT teacher_attendance_pkey PRIMARY KEY (id),
    CONSTRAINT unique_teacher_attendance UNIQUE (teacher_id, date)
);

GRANT ALL ON TABLE public.teacher_attendance TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Allow all operations for authenticated users on teacher_attendance" ON public.teacher_attendance;
CREATE POLICY "Allow all operations for authenticated users on teacher_attendance" 
ON public.teacher_attendance AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

-- 10. ASSESSMENT & MARKS CATEGORIES
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

GRANT ALL ON TABLE public.assessments TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Allow all operations for authenticated users on assessments" ON public.assessments;
CREATE POLICY "Allow all operations for authenticated users on assessments" 
ON public.assessments AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

-- 11. GREAT PROMOTION FUNCTION
CREATE OR REPLACE FUNCTION public.perform_great_promotion(
    old_class_id uuid,
    new_class_id uuid,
    academic_year_id uuid
) RETURNS void AS $$
BEGIN
    UPDATE public.students
    SET class_id = new_class_id
    WHERE class_id = old_class_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. RPC BASED UPSERT (BYPASSES 400 ERRORS)
CREATE OR REPLACE FUNCTION public.upsert_assessment_results(
    results_json jsonb
) RETURNS void AS $$
DECLARE
    result_item jsonb;
BEGIN
    FOR result_item IN SELECT * FROM jsonb_array_elements(results_json)
    LOOP
        INSERT INTO public.results (
            student_id, 
            assessment_id, 
            subject_id, 
            marks_obtained, 
            total_marks, 
            grade, 
            academic_year_id,
            exam_type
        ) 
        VALUES (
            (NULLIF(result_item->>'student_id', ''))::uuid,
            (NULLIF(result_item->>'assessment_id', ''))::uuid,
            (NULLIF(result_item->>'subject_id', ''))::uuid,
            (NULLIF(result_item->>'marks_obtained', ''))::numeric,
            (NULLIF(result_item->>'total_marks', ''))::numeric,
            result_item->>'grade',
            (NULLIF(result_item->>'academic_year_id', ''))::uuid,
            COALESCE(result_item->>'exam_type', 'quiz')
        )
        ON CONFLICT (student_id, assessment_id) 
        DO UPDATE SET 
            marks_obtained = EXCLUDED.marks_obtained,
            total_marks = EXCLUDED.total_marks,
            grade = EXCLUDED.grade,
            subject_id = EXCLUDED.subject_id,
            academic_year_id = EXCLUDED.academic_year_id,
            exam_type = EXCLUDED.exam_type;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. INDEX FOR PERFORMANCE
CREATE UNIQUE INDEX IF NOT EXISTS results_student_assessment_idx ON public.results (student_id, assessment_id);

-- 14. ROBUST STUDENT ATTENDANCE UPSERT
CREATE OR REPLACE FUNCTION public.upsert_student_attendance(
    attendance_json jsonb
) RETURNS void AS $$
DECLARE
    item jsonb;
    v_assignment_id uuid;
BEGIN
    FOR item IN SELECT * FROM jsonb_array_elements(attendance_json)
    LOOP
        v_assignment_id := (NULLIF(item->>'assignment_id', ''))::uuid;

        IF v_assignment_id IS NOT NULL THEN
            -- Subject-specific attendance
            INSERT INTO public.attendance (
                student_id, 
                assignment_id, 
                date, 
                status, 
                marking_time
            ) 
            VALUES (
                (item->>'student_id')::uuid,
                v_assignment_id,
                (item->>'date')::date,
                (item->>'status'),
                (COALESCE(item->>'marking_time', now()::text))::time
            )
            ON CONFLICT (student_id, date, assignment_id) 
            WHERE assignment_id IS NOT NULL
            DO UPDATE SET 
                status = EXCLUDED.status,
                marking_time = EXCLUDED.marking_time;
        ELSE
            -- Section Moderator / Manual Daily Attendance
            INSERT INTO public.attendance (
                student_id, 
                assignment_id,
                date, 
                status, 
                marking_time
            )
            VALUES (
                (item->>'student_id')::uuid,
                NULL,
                (item->>'date')::date,
                (item->>'status'),
                (COALESCE(item->>'marking_time', now()::text))::time
            )
            ON CONFLICT (student_id, date) WHERE assignment_id IS NULL
            DO UPDATE SET 
                status = EXCLUDED.status,
                marking_time = EXCLUDED.marking_time;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure indexes exist for the ON CONFLICT clauses used above
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_subject ON public.attendance (student_id, date, assignment_id) WHERE assignment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_attendance_moderator ON public.attendance (student_id, date) WHERE assignment_id IS NULL;

-- Add profile_picture_url to students and teachers
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS profile_picture_url text;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS profile_picture_url text;

-- Done! Refresh your application after running this.
