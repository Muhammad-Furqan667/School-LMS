-- MIGRATION: Parent Panel Security & Fields
-- Run this in Supabase SQL Editor

-- 1. ENHANCE PARENTS TABLE
ALTER TABLE public.parents 
ADD COLUMN IF NOT EXISTS cnic TEXT;

-- 2. CREATE ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('present', 'absent', 'late')) DEFAULT 'present',
    remarks TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. ENHANCED RLS POLICIES FOR PARENTS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- STUDENTS: Parents only see their own children
DROP POLICY IF EXISTS "Parents can view their own children" ON public.students;
CREATE POLICY "Parents can view their own children" ON public.students
    FOR SELECT USING (
        parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid())
    );

-- ATTENDANCE: Parents only see their children's attendance
DROP POLICY IF EXISTS "Parents can view children's attendance" ON public.attendance;
CREATE POLICY "Parents can view children's attendance" ON public.attendance
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM public.students 
            WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid())
        )
    );

-- FEES: Parents only see their children's fees
DROP POLICY IF EXISTS "Parents can view children's fees" ON public.fees;
CREATE POLICY "Parents can view children's fees" ON public.fees
    FOR SELECT USING (
        student_id IN (
            SELECT id FROM public.students 
            WHERE parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid())
        )
    );

-- DIARY: Parents only see diaries for their children's classes
DROP POLICY IF EXISTS "Parents can view children's diary" ON public.diary;
CREATE POLICY "Parents can view children's diary" ON public.diary
    FOR SELECT USING (
        assignment_id IN (
            SELECT ta.id FROM public.teacher_assignments ta
            JOIN public.students s ON s.class_id = ta.class_id
            WHERE s.parent_id IN (SELECT id FROM public.parents WHERE profile_id = auth.uid())
        )
    );

-- 4. INSERT DUMMY DATA FOR parent_audit
DO $$
DECLARE
    parent_p_id UUID;
    parent_rec_id UUID;
    child_id UUID;
BEGIN
    -- Find parent_audit profile
    SELECT id INTO parent_p_id FROM public.profiles WHERE username = 'parent_audit' LIMIT 1;
    
    IF parent_p_id IS NOT NULL THEN
        -- Link or Update Parent CNIC
        UPDATE public.parents SET cnic = '12345-6789012-3' WHERE profile_id = parent_p_id RETURNING id INTO parent_rec_id;
        
        -- Find a student linked to this parent
        SELECT id INTO child_id FROM public.students WHERE parent_id = parent_rec_id LIMIT 1;
        
        IF child_id IS NOT NULL THEN
            -- Insert dummy attendance for last 5 days
            INSERT INTO public.attendance (student_id, status, date)
            VALUES 
                (child_id, 'present', CURRENT_DATE - INTERVAL '1 day'),
                (child_id, 'present', CURRENT_DATE - INTERVAL '2 days'),
                (child_id, 'late', CURRENT_DATE - INTERVAL '3 days'),
                (child_id, 'present', CURRENT_DATE - INTERVAL '4 days'),
                (child_id, 'absent', CURRENT_DATE - INTERVAL '5 days')
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE '✅ Dummy data injected for parent_audit child: %', child_id;
        END IF;
    END IF;
END $$;
