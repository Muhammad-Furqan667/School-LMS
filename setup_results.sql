-- RUN THIS IN YOUR SUPABASE SQL EDITOR

CREATE TABLE IF NOT EXISTS public.results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    marks_obtained DECIMAL NOT NULL,
    total_marks DECIMAL NOT NULL DEFAULT 100,
    exam_type TEXT NOT NULL, -- e.g., 'Midterm', 'Final', 'Monthly Test'
    academic_year_id UUID REFERENCES public.academic_years(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage all results" ON public.results
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Teachers can manage results for their subjects" ON public.results
    FOR ALL USING (EXISTS (
        SELECT 1 FROM teacher_assignments 
        WHERE teacher_id = (SELECT id FROM teachers WHERE profile_id = auth.uid())
        AND subject_id = results.subject_id
    ));

CREATE POLICY "Parents can view results of their children" ON public.results
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM students 
        WHERE id = results.student_id 
        AND parent_id = (SELECT id FROM parents WHERE profile_id = auth.uid())
    ));
