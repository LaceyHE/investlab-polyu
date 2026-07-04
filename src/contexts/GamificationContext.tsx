import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ─── AVATARS ─────────────────────────────────────────────────────────────────

export interface AvatarDef {
  id: string; name: string; emoji: string; color: string; bg: string; desc: string;
}

export const AVATARS: AvatarDef[] = [
  { id: 'bull',     name: 'The Bull',     emoji: '🦁', color: '#FFB800', bg: '#FFF9E6', desc: 'Confident & growth-focused' },
  { id: 'bear',     name: 'The Bear',     emoji: '🐻', color: '#6C47FF', bg: '#F0EBFF', desc: 'Cautious & risk-aware' },
  { id: 'fox',      name: 'The Fox',      emoji: '🦊', color: '#FF7A35', bg: '#FFF1EA', desc: 'Smart & contrarian' },
  { id: 'eagle',    name: 'The Eagle',    emoji: '🦅', color: '#0EA5E9', bg: '#E6F7FF', desc: 'Big-picture & macro' },
  { id: 'dolphin',  name: 'The Dolphin',  emoji: '🐬', color: '#00C896', bg: '#E6FFF7', desc: 'Adaptive & trend-following' },
  { id: 'owl',      name: 'The Owl',      emoji: '🦉', color: '#8B5CF6', bg: '#F3EEFF', desc: 'Analytical & value-focused' },
  { id: 'cheetah',  name: 'The Cheetah',  emoji: '🐆', color: '#FF5C5C', bg: '#FFE8E8', desc: 'Fast & momentum-driven' },
  { id: 'tortoise', name: 'The Tortoise', emoji: '🐢', color: '#059669', bg: '#E6FFF4', desc: 'Patient & long-term' },
];

// ─── LEVELS ──────────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, title: 'Newcomer',   minXP: 0,    maxXP: 200,  color: '#94a3b8', emoji: '🌱' },
  { level: 2, title: 'Explorer',   minXP: 200,  maxXP: 500,  color: '#6C47FF', emoji: '🔭' },
  { level: 3, title: 'Analyst',    minXP: 500,  maxXP: 1100, color: '#0EA5E9', emoji: '📊' },
  { level: 4, title: 'Strategist', minXP: 1100, maxXP: 2200, color: '#00C896', emoji: '⚡' },
  { level: 5, title: 'Investor',   minXP: 2200, maxXP: 4500, color: '#FFB800', emoji: '💼' },
  { level: 6, title: 'Master',     minXP: 4500, maxXP: 9999, color: '#FF5C5C', emoji: '🎓' },
];

export const XP_REWARDS = {
  CONCEPT_LEARNED: 10, ARTICLE_READ: 5, MODULE_SECTION_READ: 15,
  MODULE_COMPLETED: 80, QUIZ_CORRECT_FIRST: 25, QUIZ_CORRECT_RETRY: 10,
  QUIZ_PERFECT: 60, CASE_STUDIED: 20, BACKTEST_RUN: 25,
  SCENARIO_COMPLETED: 70, DAILY_LOGIN: 5, STREAK_7_DAYS: 100, STREAK_30_DAYS: 500,
};

// ─── BADGES ──────────────────────────────────────────────────────────────────

// The six core strategy modules. Foundations is a separate "module 0" pre-course.
export const CORE_MODULE_IDS = ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6'];
const coreModulesCompleted = (s: AvatarProgress) =>
  CORE_MODULE_IDS.filter((id) => s.moduleProgress[id]?.completed).length;

export const BADGES = [
  { id: 'first_concept',  cat: 'Knowledge', icon: '💡', name: 'Lightbulb Moment',  desc: 'Learn your first concept',          xp: 20,  unlock: (s: AvatarProgress) => s.conceptsLearned >= 1 },
  { id: 'concept_10',     cat: 'Knowledge', icon: '📖', name: 'Concept Collector',  desc: 'Learn 10 financial concepts',       xp: 40,  unlock: (s: AvatarProgress) => s.conceptsLearned >= 10 },
  { id: 'concept_all',    cat: 'Knowledge', icon: '🧠', name: 'Encyclopaedia',      desc: 'Learn all 30+ concepts',            xp: 150, unlock: (s: AvatarProgress) => s.conceptsLearned >= 30 },
  { id: 'first_article',  cat: 'Knowledge', icon: '📰', name: 'News Reader',        desc: 'Read your first news article',      xp: 15,  unlock: (s: AvatarProgress) => s.articlesRead >= 1 },
  { id: 'article_10',     cat: 'Knowledge', icon: '🗞️', name: 'Market Watcher',     desc: 'Read 10 news articles',             xp: 35,  unlock: (s: AvatarProgress) => s.articlesRead >= 10 },
  { id: 'foundations',    cat: 'Strategy',  icon: '🌱', name: 'Grounded',          desc: 'Complete the Foundations module',   xp: 25,  unlock: (s: AvatarProgress) => !!s.moduleProgress['foundations']?.completed },
  { id: 'first_module',   cat: 'Strategy',  icon: '🎯', name: 'First Step',         desc: 'Complete your first core module',   xp: 30,  unlock: (s: AvatarProgress) => coreModulesCompleted(s) >= 1 },
  { id: 'halfway',        cat: 'Strategy',  icon: '⚡', name: 'Halfway There',      desc: 'Complete 3 core modules',           xp: 60,  unlock: (s: AvatarProgress) => coreModulesCompleted(s) >= 3 },
  { id: 'all_modules',    cat: 'Strategy',  icon: '🏆', name: 'Strategy Master',    desc: 'Complete all 6 core modules',       xp: 250, unlock: (s: AvatarProgress) => coreModulesCompleted(s) >= 6 },
  { id: 'quiz_ace',       cat: 'Strategy',  icon: '🎯', name: 'Quiz Ace',           desc: 'Ace a module knowledge check',      xp: 50,  unlock: (s: AvatarProgress) => s.perfectQuizzes >= 1 },
  { id: 'first_case',     cat: 'Cases',     icon: '🔍', name: 'Case Opened',        desc: 'Study your first case',             xp: 20,  unlock: (s: AvatarProgress) => s.casesStudied >= 1 },
  { id: 'case_5',         cat: 'Cases',     icon: '🕵️', name: 'Case Detective',     desc: 'Study 5 historical cases',          xp: 50,  unlock: (s: AvatarProgress) => s.casesStudied >= 5 },
  { id: 'case_all',       cat: 'Cases',     icon: '🌊', name: 'Market Historian',   desc: 'Study all 30 cases',                xp: 200, unlock: (s: AvatarProgress) => s.casesStudied >= 30 },
  { id: 'backtester',     cat: 'Tools',     icon: '🔬', name: 'Backtester',         desc: 'Run 5 sandbox backtests',           xp: 40,  unlock: (s: AvatarProgress) => s.backtestsRun >= 5 },
  { id: 'crisis_pro',     cat: 'Tools',     icon: '🛡️', name: 'Crisis Survivor',    desc: 'Complete 4 scenarios',              xp: 75,  unlock: (s: AvatarProgress) => s.scenariosCompleted >= 4 },
  { id: 'streak_3',       cat: 'Streak',    icon: '🔥', name: 'On a Roll',          desc: '3-day learning streak',             xp: 20,  unlock: (s: AvatarProgress) => s.currentStreak >= 3 },
  { id: 'streak_7',       cat: 'Streak',    icon: '🔥', name: 'Dedicated',          desc: '7-day learning streak',             xp: 80,  unlock: (s: AvatarProgress) => s.currentStreak >= 7 },
  { id: 'night_owl',      cat: 'Secret',    icon: '🦉', name: 'Night Owl',          desc: 'Study between midnight and 3am',    xp: 25,  unlock: (s: AvatarProgress) => s.nightSessions >= 1 },
  { id: 'speed_learner',  cat: 'Secret',    icon: '🏃', name: 'Speed Learner',      desc: 'Complete a module in under 10min',  xp: 30,  unlock: (s: AvatarProgress) => s.fastModules >= 1 },
] as const;

export type BadgeId = typeof BADGES[number]['id'];

// ─── STATE ───────────────────────────────────────────────────────────────────

interface ModuleProgress {
  sectionsRead: string[];
  quizScore: number | null;
  completed: boolean;
  startTime: number;
}

export interface Toast {
  id: number; amount: number; reason: string;
  leveledUp?: boolean; newLevel?: number;
  badge?: typeof BADGES[number]; isBadge?: boolean;
}

// Everything that's tracked separately per avatar — each avatar the user has ever played as
// has its own bucket of these, so switching avatars switches your whole progress/performance.
export interface AvatarProgress {
  xp: number;
  earnedBadgeIds: BadgeId[];
  dailyXPTarget: number;
  dailyXPEarned: number;
  conceptsLearned: number;
  articlesRead: number;
  modulesCompleted: number;
  perfectQuizzes: number;
  fastModules: number;
  casesStudied: number;
  casesStudiedIds: string[];
  backtestsRun: number;
  scenariosCompleted: number;
  nightSessions: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  weekActivity: boolean[];
  moduleProgress: Record<string, ModuleProgress>;
}

const DEFAULT_AVATAR_PROGRESS: AvatarProgress = {
  xp: 0, earnedBadgeIds: [],
  dailyXPTarget: 50, dailyXPEarned: 0,
  conceptsLearned: 0, articlesRead: 0, modulesCompleted: 0,
  perfectQuizzes: 0, fastModules: 0, casesStudied: 0, casesStudiedIds: [],
  backtestsRun: 0, scenariosCompleted: 0, nightSessions: 0,
  currentStreak: 0, longestStreak: 0, lastActiveDate: null,
  weekActivity: [false, false, false, false, false, false, false],
  moduleProgress: {},
};

// A profile has visible progress once it's earned any XP — used to decide which avatars show
// up in the "compare avatars" switchers instead of listing all 8 archetypes as if all were played.
export function hasProgress(p: AvatarProgress | undefined): boolean {
  return !!p && p.xp > 0;
}

export type ExperienceLevel = 'novice' | 'experienced';

// Truly global fields (not tied to any one avatar) plus the per-avatar buckets.
interface State {
  activeAvatarId: string | null;
  displayName: string;
  onboardingComplete: boolean;
  experienceLevel: ExperienceLevel | null;
  profiles: Record<string, AvatarProgress>;
  pendingToasts: Toast[];
}

const DEFAULT: State = {
  activeAvatarId: null, displayName: '', onboardingComplete: false, experienceLevel: null,
  profiles: {}, pendingToasts: [],
};

// ─── LEVEL UTILS ─────────────────────────────────────────────────────────────

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) { if (xp >= lvl.minXP) current = lvl; else break; }
  const next = LEVELS.find(l => l.level === current.level + 1);
  const inLevel = xp - current.minXP;
  const range = (next ? next.minXP : current.maxXP) - current.minXP;
  const pct = Math.min(100, Math.round((inLevel / range) * 100));
  return { current, next, inLevel, range, pct };
}

// ─── REDUCER ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'AWARD_XP'; amount: number; reason: string }
  | { type: 'EARN_BADGE'; badgeId: BadgeId }
  | { type: 'INCREMENT'; stat: keyof AvatarProgress; by?: number }
  | { type: 'RECORD_CASE'; caseId: string }
  | { type: 'RECORD_MODULE_SECTION'; moduleId: string; sectionId: string }
  | { type: 'COMPLETE_MODULE'; moduleId: string; quizScore: number; maxScore: number }
  | { type: 'UPDATE_STREAK' }
  | { type: 'CHECK_NIGHT' }
  | { type: 'DISMISS_TOAST'; id: number }
  | { type: 'SET_AVATAR'; avatarId: string; displayName: string }
  | { type: 'SET_EXPERIENCE_LEVEL'; level: ExperienceLevel }
  | { type: 'COMPLETE_ONBOARDING'; avatarId: string; displayName: string }
  | { type: 'LOAD_AVATAR_PROFILE'; avatarId: string; profile: AvatarProgress }
  | { type: 'LOAD'; state: Partial<State> }
  | { type: 'RESET' };

function ensureAvatar(state: State, avatarId: string | null): State {
  if (!avatarId || state.profiles[avatarId]) return state;
  return { ...state, profiles: { ...state.profiles, [avatarId]: { ...DEFAULT_AVATAR_PROGRESS } } };
}

// Applies an updater to the active avatar's own progress bucket, leaving every other avatar's
// (and all global fields') data untouched.
function updateActive(state: State, updater: (p: AvatarProgress) => AvatarProgress): State {
  const id = state.activeAvatarId;
  if (!id) return state;
  const current = state.profiles[id] ?? DEFAULT_AVATAR_PROGRESS;
  return { ...state, profiles: { ...state.profiles, [id]: updater(current) } };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'AWARD_XP': {
      if (!state.activeAvatarId) return state;
      const current = state.profiles[state.activeAvatarId] ?? DEFAULT_AVATAR_PROGRESS;
      const newXp = current.xp + action.amount;
      const prevLevel = getLevelInfo(current.xp).current.level;
      const newLevel = getLevelInfo(newXp).current.level;
      const leveledUp = newLevel > prevLevel;
      const next = updateActive(state, (p) => ({ ...p, xp: newXp, dailyXPEarned: p.dailyXPEarned + action.amount }));
      return {
        ...next,
        pendingToasts: [...state.pendingToasts, {
          id: Date.now() + Math.random(), amount: action.amount, reason: action.reason,
          leveledUp, newLevel: leveledUp ? newLevel : undefined,
        }],
      };
    }
    case 'EARN_BADGE': {
      const id = state.activeAvatarId;
      if (!id) return state;
      const current = state.profiles[id] ?? DEFAULT_AVATAR_PROGRESS;
      if (current.earnedBadgeIds.includes(action.badgeId)) return state;
      const badge = BADGES.find(b => b.id === action.badgeId)!;
      const next = updateActive(state, (p) => ({
        ...p, xp: p.xp + badge.xp, earnedBadgeIds: [...p.earnedBadgeIds, action.badgeId],
      }));
      return {
        ...next,
        pendingToasts: [...state.pendingToasts, {
          id: Date.now() + Math.random() + 1, amount: badge.xp,
          reason: `Badge: ${badge.name}`, badge, isBadge: true,
        }],
      };
    }
    case 'INCREMENT':
      return updateActive(state, (p) => ({ ...p, [action.stat]: (p[action.stat] as number ?? 0) + (action.by ?? 1) }));
    case 'RECORD_CASE':
      return updateActive(state, (p) => {
        if (p.casesStudiedIds.includes(action.caseId)) return p;
        return { ...p, casesStudied: p.casesStudied + 1, casesStudiedIds: [...p.casesStudiedIds, action.caseId] };
      });
    case 'RECORD_MODULE_SECTION':
      return updateActive(state, (p) => {
        const existing = p.moduleProgress[action.moduleId] ?? { sectionsRead: [], quizScore: null, completed: false, startTime: Date.now() };
        if (existing.sectionsRead.includes(action.sectionId)) return p;
        return { ...p, moduleProgress: { ...p.moduleProgress, [action.moduleId]: { ...existing, sectionsRead: [...existing.sectionsRead, action.sectionId] } } };
      });
    case 'COMPLETE_MODULE':
      return updateActive(state, (p) => {
        const existing = p.moduleProgress[action.moduleId] ?? { sectionsRead: [], quizScore: null, completed: false, startTime: Date.now() };
        if (existing.completed) return p;
        const elapsed = (Date.now() - existing.startTime) / 60000;
        const isPerfect = action.quizScore === action.maxScore;
        return {
          ...p,
          modulesCompleted: p.modulesCompleted + 1,
          perfectQuizzes: p.perfectQuizzes + (isPerfect ? 1 : 0),
          fastModules: p.fastModules + (elapsed < 10 ? 1 : 0),
          moduleProgress: { ...p.moduleProgress, [action.moduleId]: { ...existing, completed: true, quizScore: action.quizScore } },
        };
      });
    case 'UPDATE_STREAK': {
      const id = state.activeAvatarId;
      if (!id) return state;
      const current = state.profiles[id] ?? DEFAULT_AVATAR_PROGRESS;
      const today = new Date().toDateString();
      if (current.lastActiveDate === today) return state; // already logged in today on this avatar
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = current.lastActiveDate === yesterday ? current.currentStreak + 1 : 1;
      const dow = new Date().getDay();
      const week = [...current.weekActivity]; week[dow] = true;
      const next = updateActive(state, (p) => ({
        ...p, currentStreak: newStreak, longestStreak: Math.max(p.longestStreak, newStreak),
        lastActiveDate: today, weekActivity: week, dailyXPEarned: 0,
        xp: p.xp + XP_REWARDS.DAILY_LOGIN,
      }));
      return {
        ...next,
        pendingToasts: [...state.pendingToasts, {
          id: Date.now() + Math.random(), amount: XP_REWARDS.DAILY_LOGIN, reason: 'Daily login',
        }],
      };
    }
    case 'CHECK_NIGHT':
      return updateActive(state, (p) => {
        const h = new Date().getHours();
        if (h >= 0 && h < 3) return { ...p, nightSessions: p.nightSessions + 1 };
        return p;
      });
    case 'DISMISS_TOAST':
      return { ...state, pendingToasts: state.pendingToasts.filter(t => t.id !== action.id) };
    case 'SET_AVATAR':
      return ensureAvatar({ ...state, activeAvatarId: action.avatarId, displayName: action.displayName }, action.avatarId);
    case 'SET_EXPERIENCE_LEVEL':
      return { ...state, experienceLevel: action.level };
    case 'COMPLETE_ONBOARDING':
      return ensureAvatar({ ...state, activeAvatarId: action.avatarId, displayName: action.displayName, onboardingComplete: true }, action.avatarId);
    case 'LOAD_AVATAR_PROFILE':
      return { ...state, profiles: { ...state.profiles, [action.avatarId]: action.profile } };
    case 'LOAD':
      return { ...DEFAULT, ...action.state };
    case 'RESET':
      return { ...DEFAULT };
    default:
      return state;
  }
}

// Shape of the pre-per-avatar localStorage blob (all fields optional/loosely-typed since it's
// untrusted user-provided JSON from a previous app version).
interface LegacyState extends Partial<AvatarProgress> {
  profiles?: unknown;
  avatarId?: string;
  displayName?: string;
  onboardingComplete?: boolean;
}

// Migrates the old (pre-per-avatar) flat localStorage shape into the new `profiles` map, so
// existing users don't lose progress. Old shape had xp/badges/etc. at the top level alongside
// a single `avatarId`; new shape nests all of that under `profiles[avatarId]`.
function migrateLegacyState(raw: LegacyState | null): Partial<State> | null {
  if (!raw || raw.profiles) return null; // already new shape (or empty)
  if (typeof raw.xp !== 'number') return null; // not a recognizable legacy shape
  const avatarId: string = raw.avatarId ?? 'owl';
  const profile: AvatarProgress = {
    xp: raw.xp ?? 0,
    earnedBadgeIds: raw.earnedBadgeIds ?? [],
    dailyXPTarget: raw.dailyXPTarget ?? 50,
    dailyXPEarned: raw.dailyXPEarned ?? 0,
    conceptsLearned: raw.conceptsLearned ?? 0,
    articlesRead: raw.articlesRead ?? 0,
    modulesCompleted: raw.modulesCompleted ?? 0,
    perfectQuizzes: raw.perfectQuizzes ?? 0,
    fastModules: raw.fastModules ?? 0,
    casesStudied: raw.casesStudied ?? 0,
    casesStudiedIds: raw.casesStudiedIds ?? [],
    backtestsRun: raw.backtestsRun ?? 0,
    scenariosCompleted: raw.scenariosCompleted ?? 0,
    nightSessions: raw.nightSessions ?? 0,
    currentStreak: raw.currentStreak ?? 0,
    longestStreak: raw.longestStreak ?? 0,
    lastActiveDate: raw.lastActiveDate ?? null,
    weekActivity: raw.weekActivity ?? [false, false, false, false, false, false, false],
    moduleProgress: raw.moduleProgress ?? {},
  };
  return {
    activeAvatarId: raw.avatarId ?? null,
    displayName: raw.displayName ?? '',
    onboardingComplete: raw.onboardingComplete ?? false,
    profiles: raw.avatarId ? { [avatarId]: profile } : {},
    pendingToasts: [],
  };
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────

// Flattened, active-avatar-scoped view of the state — kept shape-compatible with the old
// single-bucket State so existing consumers (XPSidebar, Account, RequireModule, module pages,
// Sandbox, ScenarioSimulator, CausalLab) can keep reading `state.xp`, `state.moduleProgress`,
// etc. without any changes.
type FlatState = AvatarProgress & {
  avatarId: string | null;
  displayName: string;
  onboardingComplete: boolean;
  experienceLevel: ExperienceLevel | null;
  pendingToasts: Toast[];
  completedModuleIds: string[];
};

interface GamCtx {
  state: FlatState;
  levelInfo: ReturnType<typeof getLevelInfo>;
  currentAvatar: AvatarDef | null;
  viewAvatarId: string | null;
  setViewAvatarId: (avatarId: string | null) => void;
  playedAvatarIds: string[];
  getAvatarProgress: (avatarId: string) => AvatarProgress;
  awardXP: (amount: number, reason: string) => void;
  recordConceptLearned: () => void;
  recordArticleRead: () => void;
  recordModuleSection: (moduleId: string, sectionId: string) => void;
  completeModule: (moduleId: string, quizScore?: number, maxScore?: number) => void;
  recordQuizCorrect: (firstTry: boolean) => void;
  recordQuizPerfect: () => void;
  recordCaseStudied: (caseId: string) => void;
  recordBacktest: () => void;
  recordScenario: () => void;
  dismissToast: (id: number) => void;
  setAvatar: (avatarId: string, displayName: string) => void;
  setExperienceLevel: (level: ExperienceLevel) => void;
  completeOnboarding: (avatarId: string, displayName: string) => void;
  resetProgress: () => void;
}

const Ctx = createContext<GamCtx | null>(null);
const STORAGE_KEY = 'investlab_gam_v2';
const LEGACY_STORAGE_KEY = 'investlab_gam_v1';

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT);
  const prevRef = useRef(state);
  const [viewAvatarId, setViewAvatarId] = useState<string | null>(null);
  const { user } = useAuth();
  const pulledForRef = useRef<string | null>(null); // `${userId}:${avatarId}` already pulled this session

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      // Only trust an existing v2 entry if it actually has an avatar — an empty/default v2
      // blob (e.g. written by another tab's very first render, before its own migration ran)
      // must not permanently mask legacy v1 progress from ever being migrated.
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.activeAvatarId || Object.keys(parsed.profiles ?? {}).length > 0) {
          dispatch({ type: 'LOAD', state: parsed });
          return;
        }
      }
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        const migrated = migrateLegacyState(JSON.parse(legacy));
        if (migrated) dispatch({ type: 'LOAD', state: migrated });
      }
    } catch { /* ignore malformed storage */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* storage unavailable/full */ }
  }, [state]);

  useEffect(() => {
    if (!state.activeAvatarId) return;
    dispatch({ type: 'UPDATE_STREAK' });
    dispatch({ type: 'CHECK_NIGHT' });
  }, [state.activeAvatarId]);

  useEffect(() => {
    const prev = prevRef.current;
    const id = state.activeAvatarId;
    const current = id ? state.profiles[id] ?? DEFAULT_AVATAR_PROGRESS : DEFAULT_AVATAR_PROGRESS;
    const prevProfile = id ? prev.profiles[id] ?? DEFAULT_AVATAR_PROGRESS : DEFAULT_AVATAR_PROGRESS;
    for (const badge of BADGES) {
      if (!current.earnedBadgeIds.includes(badge.id) && badge.unlock(current) && !prevProfile.earnedBadgeIds.includes(badge.id)) {
        dispatch({ type: 'EARN_BADGE', badgeId: badge.id });
      }
    }
    prevRef.current = state;
  }, [state]);

  // Cloud sync (signed-in only): pull an avatar's remote progress the first time it becomes
  // active in this session, preferring whichever of local/remote has more XP so neither a
  // fresh device nor a guest's pre-sign-in local progress gets clobbered.
  useEffect(() => {
    const avatarId = state.activeAvatarId;
    if (!user || !avatarId) return;
    const key = `${user.id}:${avatarId}`;
    if (pulledForRef.current === key) return;
    pulledForRef.current = key;
    (async () => {
      const { data } = await supabase
        .from('avatar_progress')
        .select('state')
        .eq('user_id', user.id)
        .eq('avatar_id', avatarId)
        .maybeSingle();
      const remote = data?.state as AvatarProgress | undefined;
      if (remote && remote.xp > (state.profiles[avatarId]?.xp ?? 0)) {
        dispatch({ type: 'LOAD_AVATAR_PROFILE', avatarId, profile: remote });
      }
    })();
  }, [user, state.activeAvatarId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Push the active avatar's profile to Supabase (debounced) whenever it changes, so progress
  // follows the signed-in user across devices.
  const activeProfileForSync = state.activeAvatarId ? state.profiles[state.activeAvatarId] : undefined;
  useEffect(() => {
    const avatarId = state.activeAvatarId;
    if (!user || !avatarId || !activeProfileForSync) return;
    const timer = window.setTimeout(() => {
      supabase.from('avatar_progress').upsert(
        { user_id: user.id, avatar_id: avatarId, state: activeProfileForSync, updated_at: new Date().toISOString() } as Record<string, unknown>,
        { onConflict: 'user_id,avatar_id' }
      );
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [user, state.activeAvatarId, activeProfileForSync]);

  const awardXP = useCallback((amount: number, reason: string) => dispatch({ type: 'AWARD_XP', amount, reason }), []);
  const recordConceptLearned = useCallback(() => { dispatch({ type: 'INCREMENT', stat: 'conceptsLearned' }); dispatch({ type: 'AWARD_XP', amount: XP_REWARDS.CONCEPT_LEARNED, reason: 'Concept learned! +10 XP' }); }, []);
  const recordArticleRead = useCallback(() => { dispatch({ type: 'INCREMENT', stat: 'articlesRead' }); dispatch({ type: 'AWARD_XP', amount: XP_REWARDS.ARTICLE_READ, reason: 'Article read +5 XP' }); }, []);
  const recordModuleSection = useCallback((moduleId: string, sectionId: string) => { dispatch({ type: 'RECORD_MODULE_SECTION', moduleId, sectionId }); dispatch({ type: 'AWARD_XP', amount: XP_REWARDS.MODULE_SECTION_READ, reason: 'Section read +15 XP' }); }, []);
  const completeModule = useCallback((moduleId: string, quizScore = 0, maxScore = 5) => { dispatch({ type: 'COMPLETE_MODULE', moduleId, quizScore, maxScore }); dispatch({ type: 'AWARD_XP', amount: XP_REWARDS.MODULE_COMPLETED, reason: 'Module completed! 🎉 +80 XP' }); }, []);
  const recordQuizCorrect = useCallback((firstTry: boolean) => { const amt = firstTry ? XP_REWARDS.QUIZ_CORRECT_FIRST : XP_REWARDS.QUIZ_CORRECT_RETRY; dispatch({ type: 'AWARD_XP', amount: amt, reason: firstTry ? 'Correct first try! +25 XP' : 'Correct! +10 XP' }); }, []);
  const recordQuizPerfect = useCallback(() => { dispatch({ type: 'INCREMENT', stat: 'perfectQuizzes' }); dispatch({ type: 'AWARD_XP', amount: XP_REWARDS.QUIZ_PERFECT, reason: 'Perfect quiz! 🎯 +60 XP' }); }, []);
  const recordCaseStudied = useCallback((caseId: string) => { dispatch({ type: 'RECORD_CASE', caseId }); dispatch({ type: 'AWARD_XP', amount: XP_REWARDS.CASE_STUDIED, reason: 'Case studied! +20 XP' }); }, []);
  const recordBacktest = useCallback(() => { dispatch({ type: 'INCREMENT', stat: 'backtestsRun' }); dispatch({ type: 'AWARD_XP', amount: XP_REWARDS.BACKTEST_RUN, reason: 'Backtest run! +25 XP' }); }, []);
  const recordScenario = useCallback(() => { dispatch({ type: 'INCREMENT', stat: 'scenariosCompleted' }); dispatch({ type: 'AWARD_XP', amount: XP_REWARDS.SCENARIO_COMPLETED, reason: 'Scenario completed! +70 XP' }); }, []);
  const dismissToast = useCallback((id: number) => dispatch({ type: 'DISMISS_TOAST', id }), []);
  const setAvatar = useCallback((avatarId: string, displayName: string) => dispatch({ type: 'SET_AVATAR', avatarId, displayName }), []);
  const setExperienceLevel = useCallback((level: ExperienceLevel) => dispatch({ type: 'SET_EXPERIENCE_LEVEL', level }), []);
  const completeOnboarding = useCallback((avatarId: string, displayName: string) => dispatch({ type: 'COMPLETE_ONBOARDING', avatarId, displayName }), []);
  const resetProgress = useCallback(() => { if (window.confirm('Reset all progress? This cannot be undone.')) dispatch({ type: 'RESET' }); }, []);
  const getAvatarProgress = useCallback((avatarId: string) => state.profiles[avatarId] ?? DEFAULT_AVATAR_PROGRESS, [state.profiles]);

  const activeProfile = state.activeAvatarId ? state.profiles[state.activeAvatarId] ?? DEFAULT_AVATAR_PROGRESS : DEFAULT_AVATAR_PROGRESS;
  const completedModuleIds = Object.keys(activeProfile.moduleProgress).filter(id => activeProfile.moduleProgress[id]?.completed);
  const currentAvatar = AVATARS.find(a => a.id === state.activeAvatarId) ?? null;
  const playedAvatarIds = Object.keys(state.profiles).filter(id => hasProgress(state.profiles[id]));

  const flatState: FlatState = {
    ...activeProfile,
    avatarId: state.activeAvatarId,
    displayName: state.displayName,
    onboardingComplete: state.onboardingComplete,
    experienceLevel: state.experienceLevel,
    pendingToasts: state.pendingToasts,
    completedModuleIds,
  };

  const value: GamCtx = {
    state: flatState, levelInfo: getLevelInfo(activeProfile.xp), currentAvatar,
    viewAvatarId, setViewAvatarId, playedAvatarIds, getAvatarProgress,
    awardXP, recordConceptLearned, recordArticleRead, recordModuleSection, completeModule,
    recordQuizCorrect, recordQuizPerfect, recordCaseStudied, recordBacktest, recordScenario,
    dismissToast, setAvatar, setExperienceLevel, completeOnboarding, resetProgress,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGamification() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGamification must be inside GamificationProvider');
  return ctx;
}
