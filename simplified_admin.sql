-- --- SIMPLIFIED ADMIN-CENTRIC SCHEMA ---

-- 1. Add Salary to Teachers
ALTER TABLE public.teachers 
ADD COLUMN IF NOT EXISTS salary DECIMAL DEFAULT 0;

-- 2. Create Simple Lectures Table
-- Admin will use this to upload links/content for subjects
CREATE TABLE IF NOT EXISTS public.lectures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_url TEXT, -- Video URL or PDF link
    content_body TEXT, -- Optional text content
    order_index INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- --- RLS POLICIES ---

ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;

-- 1. Everyone enrolled can view lectures
CREATE POLICY "Enrolled students can view lectures" ON public.lectures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.enrollments 
            WHERE enrollments.subject_id = lectures.subject_id 
            AND enrollments.student_id IN (
                -- Link to current parent/student
                SELECT s.id FROM public.students s
                JOIN public.parents p ON s.parent_id = p.id
                WHERE p.profile_id = auth.uid()
            )
        )
    );

-- 2. Admins have full access
CREATE POLICY "Admins have full access to lectures" ON public.lectures
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 3. Teachers can view lectures for their subjects
CREATE POLICY "Teachers can view their own subjects lectures" ON public.lectures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.subjects 
            WHERE subjects.id = lectures.subject_id 
            AND subjects.teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
        )
    );
