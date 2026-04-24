-- ==========================================
-- 📦 STORAGE SECURITY CONFIGURATION (RLS)
-- ==========================================
-- This script is idempotent and can be run multiple times.

-- 1. CLEAN UP EXISTING STORAGE POLICIES
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admin Full Access Student" ON storage.objects;
    DROP POLICY IF EXISTS "Public View Student" ON storage.objects;
    DROP POLICY IF EXISTS "Admin Full Access Teacher" ON storage.objects;
    DROP POLICY IF EXISTS "Public View Teacher" ON storage.objects;
END $$;

-- 2. Student Bucket Policies
CREATE POLICY "Admin Full Access Student" ON storage.objects FOR ALL TO authenticated
USING ( bucket_id = 'Student' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Public View Student" ON storage.objects FOR SELECT TO authenticated, anon
USING ( bucket_id = 'Student' );

-- 3. Teacher Bucket Policies
CREATE POLICY "Admin Full Access Teacher" ON storage.objects FOR ALL TO authenticated
USING ( bucket_id = 'Teacher' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

CREATE POLICY "Public View Teacher" ON storage.objects FOR SELECT TO authenticated, anon
USING ( bucket_id = 'Teacher' );

-- Note: Ensure both buckets are set to "Public" in the Supabase Dashboard 
-- so that URLs are accessible without signed tokens.
