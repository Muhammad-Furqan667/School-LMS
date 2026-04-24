-- RESET_v2_FINAL
-- ==========================================
-- SYSTEM RESET SCRIPT (CLEAN SLATE)
-- WARNING: This will delete ALL school data.
-- Admin accounts will be PRESERVED.
-- ==========================================

-- 1. Clear Academic & Teacher Workflow Records
TRUNCATE TABLE public.results CASCADE;
TRUNCATE TABLE public.assessments CASCADE;
TRUNCATE TABLE public.attendance CASCADE;
TRUNCATE TABLE public.teacher_attendance CASCADE;
TRUNCATE TABLE public.diary CASCADE;
TRUNCATE TABLE public.teacher_tasks CASCADE;
TRUNCATE TABLE public.timetable CASCADE;

-- 2. Clear Financial & Marketing Records
TRUNCATE TABLE public.fees CASCADE;
TRUNCATE TABLE public.enrollments CASCADE;

-- 3. Clear Structural & Identity Data
TRUNCATE TABLE public.student_class_history CASCADE;
TRUNCATE TABLE public.students CASCADE;
TRUNCATE TABLE public.parents CASCADE;
TRUNCATE TABLE public.teachers CASCADE;
TRUNCATE TABLE public.classes CASCADE;
TRUNCATE TABLE public.subjects CASCADE;
TRUNCATE TABLE public.lectures CASCADE;
TRUNCATE TABLE public.notifications CASCADE;

-- 4. Clear Non-Admin User Profiles
-- This removes teacher and parent accounts from the profiles table.
-- It keeps anyone with the 'Admin' role.
DELETE FROM public.profiles WHERE LOWER(role) != 'admin';

-- 5. Clear Academic Years (Infrastructure)
TRUNCATE TABLE public.academic_years CASCADE;

-- Done! Your system is now a clean slate.
