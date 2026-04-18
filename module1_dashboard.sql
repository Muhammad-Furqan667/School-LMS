-- --- MODULE 1: DASHBOARD & PRICING SCHEMA ---

-- 1. Enhance Subjects Table
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES public.teachers(id),
ADD COLUMN IF NOT EXISTS pricing_type TEXT CHECK (pricing_type IN ('free', 'one_time', 'monthly')) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS price DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS discounted_price DECIMAL,
ADD COLUMN IF NOT EXISTS grade_level INT CHECK (grade_level >= 1 AND grade_level <= 10),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'draft', 'archived')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- 2. Create Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    price_at_enrollment DECIMAL NOT NULL DEFAULT 0,
    payment_status TEXT CHECK (payment_status IN ('paid', 'pending', 'cancelled')) DEFAULT 'pending',
    enrollment_status TEXT CHECK (enrollment_status IN ('active', 'completed', 'dropped')) DEFAULT 'active',
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(student_id, subject_id)
);

-- 3. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    discount_percent INT CHECK (discount_percent > 0 AND discount_percent <= 100),
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(code, subject_id)
);

-- --- RLS POLICIES ---

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 1. Subjects Policies
CREATE POLICY "Public subjects viewable by everyone" ON public.subjects
    FOR SELECT USING (status = 'active');

CREATE POLICY "Teachers can manage their own subjects" ON public.subjects
    FOR ALL USING (
        auth.uid() IN (SELECT profile_id FROM public.teachers WHERE id = subjects.teacher_id)
    );

CREATE POLICY "Admins have full access to subjects" ON public.subjects
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 2. Enrollments Policies
CREATE POLICY "Parents can view their children's enrollments" ON public.enrollments
    FOR SELECT USING (
        auth.uid() IN (
            SELECT p.profile_id 
            FROM public.parents p
            JOIN public.students s ON s.parent_id = p.id
            WHERE s.id = enrollments.student_id
        )
    );

CREATE POLICY "Teachers can view enrollments for their subjects" ON public.enrollments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.subjects 
            WHERE subjects.id = enrollments.subject_id 
            AND subjects.teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
        )
    );

CREATE POLICY "Admins have full access to enrollments" ON public.enrollments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- 3. Coupons Policies
CREATE POLICY "Teachers can manage their own coupons" ON public.coupons
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.subjects 
            WHERE subjects.id = coupons.subject_id 
            AND subjects.teacher_id IN (SELECT id FROM public.teachers WHERE profile_id = auth.uid())
        )
    );

-- --- INDEXES FOR PERFORMANCE ---
CREATE INDEX IF NOT EXISTS idx_subjects_teacher ON public.subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subjects_status ON public.subjects(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_subject ON public.enrollments(subject_id);
