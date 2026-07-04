-- The previous fix (20260703230507) re-granted EXECUTE on handle_new_user() to
-- anon/authenticated/service_role, but the actual role Supabase's GoTrue service uses to
-- insert into auth.users is `supabase_auth_admin`. Grant it explicitly so the trigger can
-- always fire regardless of which roles happen to hold the (now-revoked) PUBLIC grant.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- Make the handler idempotent so retried/duplicate trigger invocations (e.g. from provider
-- relinking) never fail with a duplicate-key error instead of silently no-op'ing.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Backfill profiles for any accounts created while the trigger was broken
-- (between migrations 20260701011021 and 20260703230507).
INSERT INTO public.profiles (id, display_name)
SELECT u.id, COALESCE(u.raw_user_meta_data->>'display_name', '')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
