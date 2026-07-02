import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { useGamification, LEVELS, BADGES, getLevelInfo } from '@/contexts/GamificationContext';
import { AvatarDisplay, AvatarPicker } from '@/components/gamification/AvatarSystem';

// ─── XP BAR ──────────────────────────────────────────────────────────────────

export function XPBar({ compact = false }: { compact?: boolean }) {
  const { state, levelInfo } = useGamification();
  const { current, next, pct, inLevel, range } = levelInfo;

  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow" style={{ background: current.color }}>
          {current.level}
        </div>
        <div className="flex-1 min-w-[60px]">
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${current.color}, ${next?.color ?? current.color})` }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }} />
          </div>
        </div>
        <span className="text-xs text-gray-500 tabular-nums flex-shrink-0">{state.xp.toLocaleString()} XP</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-none border-2 border-foreground bg-card shadow-[2px_2px_0_hsl(var(--foreground))]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md" style={{ background: `linear-gradient(135deg, ${current.color}cc, ${current.color})`, boxShadow: `0 0 16px ${current.color}40` }}>
            {current.emoji}
          </div>
          <div>
            <div className="text-sm font-bold" style={{ color: current.color }}>Level {current.level} · {current.title}</div>
            <div className="text-xs text-gray-400 tabular-nums">{state.xp.toLocaleString()} XP total</div>
          </div>
        </div>
        {next && <div className="text-right"><div className="text-[10px] text-gray-400">Next level</div><div className="text-xs font-semibold" style={{ color: next.color }}>{next.title}</div></div>}
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-1.5">
        <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${current.color}, ${next?.color ?? current.color})` }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }} />
      </div>
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{inLevel.toLocaleString()} / {range.toLocaleString()} XP to next level</span>
        <span>{pct}%</span>
      </div>
      <div className="flex gap-1 mt-3">
        {LEVELS.map(l => (
          <div key={l.level} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full h-1 rounded-full transition-all duration-500" style={{ background: state.xp >= l.minXP ? l.color : '#e5e7eb' }} />
            <span className="text-[9px] text-gray-400">{l.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DAILY XP BAR ────────────────────────────────────────────────────────────

export function DailyXPBar() {
  const { state } = useGamification();
  const earned = state.dailyXPEarned;
  const target = state.dailyXPTarget;
  const pct = Math.min(100, Math.round((earned / target) * 100));
  const done = earned >= target;

  return (
    <div className="p-3 rounded-none border-2 border-foreground bg-card shadow-[2px_2px_0_hsl(var(--foreground))]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Daily Goal</span>
        <span className={`text-xs font-bold tabular-nums ${done ? 'text-emerald-500' : 'text-gray-500'}`}>
          {earned} / {target} XP {done ? '✓' : ''}
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: done ? '#00C896' : '#6C47FF' }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
      </div>
      {done && <p className="text-[10px] text-emerald-500 font-medium mt-1.5">Goal reached! Keep going 🚀</p>}
    </div>
  );
}

// ─── STREAK WIDGET ───────────────────────────────────────────────────────────

export function StreakWidget() {
  const { state } = useGamification();
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date().getDay();
  return (
    <div className="p-3 rounded-none border-2 border-foreground bg-card shadow-[2px_2px_0_hsl(var(--foreground))]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold">{state.currentStreak}-Day Streak</span>
        </div>
        <span className="text-[10px] text-gray-400">Best: {state.longestStreak}</span>
      </div>
      <div className="flex gap-1">
        {days.map((d, i) => {
          const active = state.weekActivity[i];
          const isToday = i === today;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className={`w-full h-6 rounded flex items-center justify-center text-[9px] font-bold transition-all ${active ? 'text-white' : isToday ? 'border-2 border-dashed border-violet-400 text-violet-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`} style={active ? { background: '#6C47FF' } : {}}>
                {active ? '✓' : isToday ? '○' : '·'}
              </div>
              <span className={`text-[9px] ${isToday ? 'font-bold text-violet-500' : 'text-gray-400'}`}>{d}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BADGE DISPLAY ───────────────────────────────────────────────────────────

export function BadgeDisplay({ compact = false, filterCat }: { compact?: boolean; filterCat?: string }) {
  const { state } = useGamification();
  const [expanded, setExpanded] = useState(false);
  const badges = filterCat ? BADGES.filter(b => b.cat === filterCat) : [...BADGES];
  const earned = badges.filter(b => state.earnedBadgeIds.includes(b.id));
  const locked = badges.filter(b => !state.earnedBadgeIds.includes(b.id));
  const sorted = [...earned, ...locked];
  const visible = compact && !expanded ? sorted.slice(0, 6) : sorted;

  return (
    <div>
      <div className="grid grid-cols-4 gap-2">
        {visible.map(badge => {
          const isEarned = state.earnedBadgeIds.includes(badge.id);
          return (
            <motion.div key={badge.id} whileHover={{ scale: 1.06 }} className="group relative" title={`${badge.name}: ${badge.desc}`}>
              <div className={`flex flex-col items-center gap-1 p-2 rounded-none text-center cursor-default transition-all ${isEarned ? 'border-2 border-foreground bg-primary/10 shadow-[2px_2px_0_hsl(var(--foreground))]' : 'border-2 border-foreground/25 bg-muted opacity-60'}`}>
                <span className={`text-xl ${isEarned ? '' : 'grayscale opacity-70'}`}>{badge.icon}</span>
                <span className={`text-[9px] font-bold leading-tight text-center ${isEarned ? 'text-foreground' : 'text-muted-foreground'}`}>{badge.name}</span>
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 hidden group-hover:block min-w-[140px] rounded-none border-2 border-foreground bg-card p-2.5 shadow-[3px_3px_0_hsl(var(--foreground))] text-left pointer-events-none">
                <div className="text-xs font-bold mb-0.5 text-foreground">{badge.name}</div>
                <div className="text-[10px] text-muted-foreground mb-1">{badge.desc}</div>
                <div className="text-[10px] font-semibold text-primary">+{badge.xp} XP bonus</div>
                {isEarned && <div className="text-[10px] font-semibold text-teal mt-0.5">✓ Earned</div>}
              </div>
            </motion.div>
          );
        })}
      </div>
      {compact && sorted.length > 6 && (
        <button onClick={() => setExpanded(e => !e)} className="mt-2 w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors">
          {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> +{sorted.length - 6} more</>}
        </button>
      )}
      <div className="mt-2 text-center text-[10px] font-medium text-muted-foreground">{earned.length} / {badges.length} earned</div>
    </div>
  );
}

// ─── FULL SIDEBAR ─────────────────────────────────────────────────────────────

export function GamificationSidebar() {
  const { state, currentAvatar } = useGamification();
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-64 flex-shrink-0">
      {/* Avatar header */}
      <div className="p-3 rounded-none border-2 border-foreground bg-card shadow-[2px_2px_0_hsl(var(--foreground))]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <AvatarDisplay size="md" showRing />
            <button onClick={() => setPickerOpen(true)} className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-colors" title="Change avatar">
              <Pencil className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{state.displayName || 'Investor'}</div>
            {currentAvatar && <div className="text-xs text-gray-400 truncate">{currentAvatar.name}</div>}
          </div>
        </div>
      </div>

      <DailyXPBar />
      <XPBar />
      <StreakWidget />

      <div className="p-3 rounded-none border-2 border-foreground bg-card shadow-[2px_2px_0_hsl(var(--foreground))]">
        <div className="flex items-center gap-1.5 mb-3">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold">Badges</span>
        </div>
        <BadgeDisplay compact />
      </div>

      <AvatarPicker isOpen={pickerOpen} onClose={() => setPickerOpen(false)} />
    </div>
  );
}

// ─── STAT ROW ────────────────────────────────────────────────────────────────

export function StatRow({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-xs text-gray-500 flex items-center gap-1.5"><span>{icon}</span> {label}</span>
      <span className="text-xs font-bold tabular-nums">{value}</span>
    </div>
  );
}