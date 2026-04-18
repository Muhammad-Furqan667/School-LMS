DO $$
DECLARE
    admin_uid UUID;
BEGIN
    -- 1. MANUALLY CONFIRM the email in Supabase Auth
    -- This bypasses the "Email not confirmed" error.
    UPDATE auth.users 
    SET email_confirmed_at = now()
    WHERE email = 'admin@schooling.app';

    -- 2. Find the user ID for admin@schooling.app
    SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@schooling.app' LIMIT 1;

    IF admin_uid IS NOT NULL THEN
        -- 3. Clean up any duplicate profiles
        DELETE FROM public.profiles WHERE username = 'admin' AND id != admin_uid;

        -- 4. Insert or update the profile for the current user
        INSERT INTO public.profiles (id, username, role, is_active)
        VALUES (admin_uid, 'admin', 'admin', true)
        ON CONFLICT (id) DO UPDATE 
        SET username = 'admin', role = 'admin', is_active = true;
        
        RAISE NOTICE '✅ Successfully CONFIRMED email and granted Admin access for: %', admin_uid;
    ELSE
        RAISE NOTICE '❌ User admin@schooling.app not found. Please click Sign Up on the website first.';
    END IF;
END $$;
