-- Cross-device storage for the per-avatar gamification state that used to live only in
-- localStorage. One row per (user, avatar); `state` mirrors the client's AvatarProgress shape.
CREATE TABLE public.avatar_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  avatar_id TEXT NOT NULL,
  state JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, avatar_id)
);
ALTER TABLE public.avatar_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own avatar progress" ON public.avatar_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own avatar progress" ON public.avatar_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own avatar progress" ON public.avatar_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Attribute the existing activity log to an avatar too, so cross-device "recent activity"
-- and counts can be scoped per avatar just like the local gamification state.
ALTER TABLE public.user_progress ADD COLUMN avatar_id TEXT NOT NULL DEFAULT 'default';
ALTER TABLE public.user_progress DROP CONSTRAINT user_progress_user_id_activity_type_activity_id_key;
ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_user_id_avatar_activity_key
  UNIQUE (user_id, avatar_id, activity_type, activity_id);
