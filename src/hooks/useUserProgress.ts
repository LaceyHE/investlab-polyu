import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ProgressRecord {
  activity_type: string;
  activity_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const useUserProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!user) { setProgress([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("user_progress")
      .select("activity_type, activity_id, metadata, created_at")
      .eq("user_id", user.id);
    setProgress((data as ProgressRecord[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const markComplete = useCallback(async (activityType: string, activityId: string, metadata: Record<string, unknown> = {}) => {
    if (!user) return;
    await supabase.from("user_progress").upsert(
      { user_id: user.id, activity_type: activityType, activity_id: activityId, metadata } as any,
      { onConflict: "user_id,activity_type,activity_id" }
    );
    await fetchProgress();
  }, [user, fetchProgress]);

  const completedModules = progress
    .filter((p) => p.activity_type === "module_complete")
    .map((p) => parseInt(p.activity_id.replace("module-", ""), 10));

  const hasActivity = (type: string) => progress.some((p) => p.activity_type === type);

  const getActivities = useCallback((type: string) => {
    return progress.filter((p) => p.activity_type === type);
  }, [progress]);

  const activityCount = useCallback((type: string) => {
    return progress.filter((p) => p.activity_type === type).length;
  }, [progress]);

  const recentActivities = useMemo(() => {
    return [...progress]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20);
  }, [progress]);

  return { progress, loading, markComplete, completedModules, hasActivity, getActivities, activityCount, recentActivities };
};
