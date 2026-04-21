-- Create teacher_tasks table
CREATE TABLE IF NOT EXISTS public.teacher_tasks (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.teacher_assignments(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    target_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.teacher_tasks ENABLE ROW LEVEL SECURITY;

-- Policies
-- Admin can do everything
CREATE POLICY admin_all_teacher_tasks ON public.teacher_tasks
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Teachers can view tasks assigned to them and update status
CREATE POLICY teacher_view_own_tasks ON public.teacher_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.teacher_assignments ta 
            JOIN public.teachers t ON ta.teacher_id = t.id 
            WHERE ta.id = public.teacher_tasks.assignment_id 
            AND t.profile_id = auth.uid()
        )
    );

CREATE POLICY teacher_update_own_tasks ON public.teacher_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.teacher_assignments ta 
            JOIN public.teachers t ON ta.teacher_id = t.id 
            WHERE ta.id = public.teacher_tasks.assignment_id 
            AND t.profile_id = auth.uid()
        )
    );

-- Parents can view tasks for their children's classes (optional, but good for transparency)
-- For now, keep it between admin and teacher.

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teacher_tasks_updated_at
    BEFORE UPDATE ON public.teacher_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
