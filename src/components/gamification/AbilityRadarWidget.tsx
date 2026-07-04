import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { AVATARS, CORE_MODULE_IDS, useGamification, type AvatarProgress } from "@/contexts/GamificationContext";

const DIMENSIONS = ["Strategy", "Risk", "Environment", "Reflection", "Allocation"];

// Flavor profile per avatar archetype — shown as a reference overlay on the ability radar.
// Order matches DIMENSIONS: [Strategy, Risk, Environment, Reflection, Allocation]
const AVATAR_ARCHETYPES: Record<string, number[]> = {
  bull:     [8, 3, 5, 4, 7],
  bear:     [5, 9, 6, 6, 5],
  fox:      [7, 6, 8, 7, 5],
  eagle:    [6, 5, 9, 6, 6],
  dolphin:  [7, 5, 7, 5, 6],
  owl:      [8, 6, 6, 9, 6],
  cheetah:  [6, 4, 5, 4, 5],
  tortoise: [6, 8, 5, 7, 9],
};

export function computeAbilityDimensions(progress: AvatarProgress): number[] {
  const completedCount = CORE_MODULE_IDS.filter((id) => progress.moduleProgress[id]?.completed).length;
  const sandboxCount = progress.backtestsRun;
  const scenarioCount = progress.scenariosCompleted;
  const uniqueScenarios = Math.min(scenarioCount, 4);
  const isModuleDone = (n: number) => !!progress.moduleProgress[`module-${n}`]?.completed;
  return [
    Math.min(10, completedCount * 1.2 + sandboxCount * 0.8),
    Math.min(10, scenarioCount * 2.5),
    Math.min(10, (isModuleDone(3) ? 4 : 0) + uniqueScenarios * 1.5),
    Math.min(10, (isModuleDone(6) ? 4 : 0) + sandboxCount * 1.5),
    Math.min(10, (isModuleDone(4) ? 4 : 0) + sandboxCount * 2),
  ];
}

/**
 * Ability radar that can preview any avatar the user has actually played (`viewAvatarId`)
 * without switching which one is active — used on both the Investor Hub and the homepage
 * sidebar so "which avatar am I playing as" and "whose stats am I looking at" stay separate.
 */
export function AbilityRadarWidget({ compact = false }: { compact?: boolean }) {
  const { state, currentAvatar, viewAvatarId, setViewAvatarId, playedAvatarIds, getAvatarProgress } = useGamification();
  const activeId = state.avatarId;
  const shownId = viewAvatarId ?? activeId;
  const shownAvatar = AVATARS.find((a) => a.id === shownId) ?? currentAvatar;
  const progress = shownId ? getAvatarProgress(shownId) : null;
  const scores = progress ? computeAbilityDimensions(progress) : [0, 0, 0, 0, 0];
  const archetype = shownAvatar ? AVATAR_ARCHETYPES[shownAvatar.id] : null;
  const data = DIMENSIONS.map((dimension, i) => ({
    dimension, score: scores[i], archetype: archetype ? archetype[i] : undefined,
  }));
  const color = shownAvatar?.color ?? "hsl(var(--primary))";
  const isPreview = viewAvatarId !== null && viewAvatarId !== activeId;

  // Only offer avatars that have actually been played, plus whichever one is currently active
  // (so a brand-new active avatar with zero XP still appears as an option).
  const switcherAvatars = AVATARS.filter((a) => playedAvatarIds.includes(a.id) || a.id === activeId);

  return (
    <div>
      <div className="flex items-center gap-2 mb-0.5">
        <TrendingUp className="h-4 w-4" style={{ color }} />
        <span className="text-sm font-bold text-foreground">Investment Ability</span>
      </div>
      <p className="text-xs text-muted-foreground mb-1">
        {isPreview ? `Viewing ${shownAvatar?.name ?? "avatar"}'s stats` : `Your scores vs. ${shownAvatar?.name ?? "your avatar"}'s natural style`}
      </p>
      <ResponsiveContainer width="100%" height={compact ? 180 : 230}>
        <RadarChart cx="50%" cy="50%" outerRadius="68%" data={data}>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="dimension" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: compact ? 9 : 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          {archetype && (
            <Radar
              name={shownAvatar?.name ?? "Archetype"}
              dataKey="archetype"
              stroke={color}
              strokeDasharray="4 3"
              fill="transparent"
              strokeWidth={1.5}
              strokeOpacity={0.6}
            />
          )}
          <Radar name="Score" dataKey="score" stroke={color} fill={color} fillOpacity={0.25} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 -mt-1 mb-1">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} /> Score
        </span>
        {archetype && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full border border-dashed" style={{ borderColor: color }} /> {shownAvatar?.name}
          </span>
        )}
      </div>
      {!compact && (
        <div className="grid grid-cols-5 gap-1 mt-1">
          {data.map((d) => (
            <div key={d.dimension} className="text-center">
              <p className="text-[9px] text-muted-foreground/70 leading-tight">{d.dimension}</p>
              <p className="font-mono text-xs text-foreground">{d.score.toFixed(1)}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70 mb-1.5">
          {switcherAvatars.length > 1 ? "Compare avatars you've played" : "Play another avatar to compare"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {switcherAvatars.map((av) => (
            <button
              key={av.id}
              onClick={() => setViewAvatarId(av.id === activeId ? null : av.id)}
              title={`${av.name} — ${av.desc}`}
              className={`flex h-8 w-8 items-center justify-center rounded-none border-2 text-base transition-all ${
                shownId === av.id
                  ? "border-foreground shadow-[2px_2px_0_hsl(var(--foreground))]"
                  : "border-foreground/20 opacity-60 hover:opacity-100 hover:border-foreground/50"
              }`}
              style={{ backgroundColor: av.bg }}
            >
              {av.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
