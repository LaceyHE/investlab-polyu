-- Restore execution rights removed by migration 20260701011021, which broke sign-up:
-- the on_auth_user_created trigger could no longer run, so profiles were never created
-- for new users even though auth.users insert succeeded.
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;

-- Defensive: ensure the trigger's profile insert is never blocked by RLS regardless of
-- which role ends up executing it.
CREATE POLICY "Trigger can insert profile on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
