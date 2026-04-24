-- Idempotent script to link orphan classes to the current session
DO $$
DECLARE
    current_year_id uuid;
BEGIN
    -- 1. Get the current academic year ID
    SELECT id INTO current_year_id FROM public.academic_years WHERE is_current = true LIMIT 1;

    -- 2. If no current year, get the latest one
    IF current_year_id IS NULL THEN
        SELECT id INTO current_year_id FROM public.academic_years ORDER BY year_label DESC LIMIT 1;
    END IF;

    -- 3. If still no year, create a default one (idempotent because of unique constraint on year_label)
    IF current_year_id IS NULL THEN
        INSERT INTO public.academic_years (year_label, is_current)
        VALUES ('2026-2027', true)
        ON CONFLICT (year_label) DO UPDATE SET is_current = true
        RETURNING id INTO current_year_id;
    END IF;

    -- 4. Link orphan classes to the current session
    UPDATE public.classes
    SET academic_year_id = current_year_id
    WHERE academic_year_id IS NULL;

    RAISE NOTICE 'Orphan classes linked to session ID: %', current_year_id;
END $$;
