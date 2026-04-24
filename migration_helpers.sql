-- ==========================================
-- 🛠️ AUTH MIGRATION & PROVISIONING HELPERS
-- ==========================================

-- This function allows us to update a profile's UUID to match a new Supabase Auth ID
-- while maintaining all foreign key relationships (Teachers, Parents, Notifications).
CREATE OR REPLACE FUNCTION public.migrate_profile_id(old_id uuid, new_id uuid)
RETURNS void AS $$
BEGIN
    -- 1. Update Teachers
    UPDATE public.teachers SET profile_id = new_id WHERE profile_id = old_id;
    
    -- 2. Update Parents
    UPDATE public.parents SET profile_id = new_id WHERE profile_id = old_id;
    
    -- 3. Update Notifications
    UPDATE public.notifications SET sender_id = new_id WHERE sender_id = old_id;
    
    -- 4. Update the Profile itself
    UPDATE public.profiles SET id = new_id WHERE id = old_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
