

# Add Email Authentication with Progress Persistence

## Overview
Add email/password login and signup so users can save their study progress, badges, and AI commentary across sessions. The Hub page becomes personalized per user.

## Database Changes

### 1. Create `profiles` table
Stores display name and auto-creates on signup via trigger.

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 2. Create `user_progress` table
Tracks module completions, scenario runs, sandbox usage.

```sql
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL, -- 'module_complete', 'scenario_run', 'sandbox_backtest'
  activity_id TEXT NOT NULL,   -- e.g. 'module-1', 'dotcom', 'allocation'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, activity_type, activity_id)
);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own progress" ON public.user_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.user_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
```

## Frontend Changes

### 3. Create Auth context (`src/contexts/AuthContext.tsx`)
- Wrap app with auth provider using `supabase.auth.onAuthStateChange`
- Expose `user`, `session`, `signIn`, `signUp`, `signOut`, `loading`

### 4. Create Auth page (`src/pages/Auth.tsx`)
- Login and signup tabs with email + password fields
- Display name field on signup
- Error handling with toast messages
- Redirect to `/account` after login

### 5. Create `useUserProgress` hook (`src/hooks/useUserProgress.ts`)
- Fetch progress from `user_progress` table
- Provide `markComplete(activityType, activityId)` function
- Derive completed modules, badges earned, etc.

### 6. Update `App.tsx`
- Wrap with `AuthProvider`
- Add `/auth` route
- Protect `/account` route (redirect to `/auth` if not logged in)

### 7. Update `AppNav.tsx`
- Show user avatar initials when logged in
- Show "Sign In" link when logged out
- Add sign-out option

### 8. Update `Account.tsx` (Hub page)
- Fetch real progress from database
- Show user's display name and email
- Derive badge status from progress records
- Add sign-out button

### 9. Add progress tracking to module pages
- At the end of each module, call `markComplete('module_complete', 'module-1')` etc.
- Non-intrusive — just records completion when user reaches the end

## Files summary

| Action | File |
|--------|------|
| Create | `src/contexts/AuthContext.tsx` |
| Create | `src/pages/Auth.tsx` |
| Create | `src/hooks/useUserProgress.ts` |
| Modify | `src/App.tsx` — add AuthProvider, /auth route |
| Modify | `src/components/AppNav.tsx` — auth-aware nav |
| Modify | `src/pages/Account.tsx` — real progress data |
| Migration | `profiles` + `user_progress` tables with RLS |

## Design notes
- Email confirmation is required by default (users verify email before signing in)
- No changes to Sandbox, Scenarios, or Learning Path functionality
- Progress tracking is additive — pages work fine without login, they just don't save

