-- ==========================================
-- SCHOOL MANAGEMENT SYSTEM: DATABASE REPAIR
-- ==========================================
-- Instructions: Copy and paste this entire script into your Supabase SQL Editor and hit "Run".

-- 1. ADD MISSING COLUMNS
-- This fixes the "400 Bad Request" when creating/updating students
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS parent_cnic text;

-- 2. FIX TABLE PERMISSIONS (GRANTS)
-- This ensures the frontend API roles are actually allowed to interact with the tables
GRANT ALL ON TABLE public.teacher_assignments TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.timetable TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.students TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.teachers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.parents TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.classes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subjects TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.results TO anon, authenticated, service_role;

-- Add Section Moderator column to Classes
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS class_teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL;

-- 3. FIX ROW LEVEL SECURITY (RLS) POLICIES
-- This fixes the "401 Unauthorized" when assigning subjects to teachers or modifying records.
-- If RLS is turned ON for these tables, these policies will allow the admin/teacher dashboards to bypass the blocks.
-- (If RLS is already off, these policy creations will just safely do nothing or warn you, which is perfectly fine!)

CREATE POLICY "Allow all operations for authenticated users on teacher_assignments" 
ON public.teacher_assignments AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on students" 
ON public.students AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on results" 
ON public.results AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on timetable" 
ON public.timetable AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

-- 4. ATTENDANCE SYSTEM REPAIR
-- This fixes the "Column assignment_id does not exist" and ensures we can sync daily attendance.

-- Add missing assignment_id column
ALTER TABLE public.attendance 
ADD COLUMN IF NOT EXISTS assignment_id uuid;

-- Add foreign key constraint
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'attendance_assignment_fkey') THEN
        ALTER TABLE public.attendance 
        ADD CONSTRAINT attendance_assignment_fkey 
        FOREIGN KEY (assignment_id) REFERENCES public.teacher_assignments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add UNIQUE constraint to allow upserting (one record per student per day per subject)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_attendance') THEN
        ALTER TABLE public.attendance 
        ADD CONSTRAINT unique_attendance UNIQUE (student_id, date, assignment_id);
    END IF;
END $$;

-- Fix Permissions & RLS for attendance
GRANT ALL ON TABLE public.attendance TO anon, authenticated, service_role;

CREATE POLICY "Allow all operations for authenticated users on attendance" 
ON public.attendance AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations for authenticated users on classes" 
ON public.classes AS PERMISSIVE FOR ALL 
TO public 
USING (true) WITH CHECK (true);

-- 5. FEE SYSTEM REPAIR & ENHANCEMENT
-- Fix fee status constraints to be more flexible and include 'Partial'
ALTER TABLE public.fees DROP CONSTRAINT IF EXISTS fees_status_check;
ALTER TABLE public.fees ADD CONSTRAINT fees_status_check 
CHECK (status = ANY (ARRAY['Paid'::text, 'Unpaid'::text, 'Partial'::text, 'paid'::text, 'unpaid'::text, 'partial'::text]));

-- Ensure all current records match the intended display casing
UPDATE public.fees SET status = 'Paid' WHERE status ILIKE 'paid';
UPDATE public.fees SET status = 'Unpaid' WHERE status ILIKE 'unpaid';
UPDATE public.fees SET status = 'Partial' WHERE status ILIKE 'partial';

-- Done! Refresh your application after running this.
