import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';

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
const coreModulesCompleted = (s: State) =>
  CORE_MODULE_IDS.filter((id) => s.moduleProgress[id]?.completed).length;

export const BADGES = [
  { id: 'first_concept',  cat: 'Knowledge', icon: '💡', name: 'Lightbulb Moment',  desc: 'Learn your first concept',          xp: 20,  unlock: (s: State) => s.conceptsLearned >= 1 },
  { id: 'concept_10',     cat: 'Knowledge', icon: '📖', name: 'Concept Collector',  desc: 'Learn 10 financial concepts',       xp: 40,  unlock: (s: State) => s.conceptsLearned >= 10 },
  { id: 'concept_all',    cat: 'Knowledge', icon: '🧠', name: 'Encyclopaedia',      desc: 'Learn all 30+ concepts',            xp: 150, unlock: (s: State) => s.conceptsLearned >= 30 },
  { id: 'first_article',  cat: 'Knowledge', icon: '📰', name: 'News Reader',        desc: 'Read your first news article',      xp: 15,  unlock: (s: State) => s.articlesRead >= 1 },
  { id: 'article_10',     cat: 'Knowledge', icon: '🗞️', name: 'Market Watcher',     desc: 'Read 10 news articles',             xp: 35,  unlock: (s: State) => s.articlesRead >= 10 },
  { id: 'foundations',    cat: 'Strategy',  icon: '🌱', name: 'Grounded',          desc: 'Complete the Foundations module',   xp: 25,  unlock: (s: State) => !!s.moduleProgress['foundations']?.completed },
  { id: 'first_module',   cat: 'Strategy',  icon: '🎯', name: 'First Step',         desc: 'Complete your first core module',   xp: 30,  unlock: (s: State) => coreModulesCompleted(s) >= 1 },
  { id: 'halfway',        cat: 'Strategy',  icon: '⚡', name: 'Halfway There',      desc: 'Complete 3 core modules',           xp: 60,  unlock: (s: State) => coreModulesCompleted(s) >= 3 },
  { id: 'all_modules',    cat: 'Strategy',  icon: '🏆', name: 'Strategy Master',    desc: 'Complete all 6 core modules',       xp: 250, unlock: (s: State) => coreModulesCompleted(s) >= 6 },
  { id: 'quiz_ace',       cat: 'Strategy',  icon: '🎯', name: 'Quiz Ace',           desc: 'Ace a module knowledge check',      xp: 50,  unlock: (s: State) => s.perfectQuizzes >= 1 },
  { id: 'first_case',     cat: 'Cases',     icon: '🔍', name: 'Case Opened',        desc: 'Study your first case',             xp: 20,  unlock: (s: State) => s.casesStudied >= 1 },
  { id: 'case_5',         cat: 'Cases',     icon: '🕵️', name: 'Case Detective',     desc: 'Study 5 historical cases',          xp: 50,  unlock: (s: State) => s.casesStudied >= 5 },
  { id: 'case_all',       cat: 'Cases',     icon: '🌊', name: 'Market Historian',   desc: 'Study all 30 cases',                xp: 200, unlock: (s: State) => s.casesStudied >= 30 },
  { id: 'backtester',     cat: 'Tools',     icon: '🔬', name: 'Backtester',         desc: 'Run 5 sandbox backtests',           xp: 40,  unlock: (s: State) => s.backtestsRun >= 5 },
  { id: 'crisis_pro',     cat: 'Tools',     icon: '🛡️', name: 'Crisis Survivor',    desc: 'Complete 4 scenarios',              xp: 75,  unlock: (s: State) => s.scenariosCompleted >= 4 },
  { id: 'streak_3',       cat: 'Streak',    icon: '🔥', name: 'On a Roll',          desc: '3-day learning streak',             xp: 20,  unlock: (s: State) => s.currentStreak >= 3 },
  { id: 'streak_7',       cat: 'Streak',    icon: '🔥', name: 'Dedicated',          desc: '7-day learning streak',             xp: 80,  unlock: (s: State) => s.currentStreak >= 7 },
  { id: 'night_owl',      cat: 'Secret',    icon: '🦉', name: 'Night Owl',          desc: 'Study between midnight and 3am',    xp: 25,  unlock: (s: State) => s.nightSessions >= 1 },
  { id: 'speed_learner',  cat: 'Secret',    icon: '🏃', name: 'Speed Learner',      desc: 'Complete a module in under 10min',  xp: 30,  unlock: (s: State) => s.fastModules >= 1 },
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

export interface State {
  xp: number;
  earnedBadgeIds: BadgeId[];
  onboardingComplete: boolean;
  avatarId: string | null;
  displayName: string;
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
  pendingToasts: Toast[];
}

const DEFAULT: State = {
  xp: 0, earnedBadgeIds: [], onboardingComplete: false,
  avatarId: null, displayName: '',
  dailyXPTarget: 50, dailyXPEarned: 0,
  conceptsLearned: 0, articlesRead: 0, modulesCompleted: 0,
  perfectQuizzes: 0, fastModules: 0, casesStudied: 0, casesStudiedIds: [],
  backtestsRun: 0, scenariosCompleted: 0, nightSessions: 0,
  currentStreak: 0, longestStreak: 0, lastActiveDate: null,
  weekActivity: [false, false, false, false, false, false, false],
  moduleProgress: {}, pendingToasts: [],
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
  | { type: 'INCREMENT'; stat: keyof State; by?: number }
  | { type: 'RECORD_CASE'; caseId: string }
  | { type: 'RECORD_MODULE_SECTION'; moduleId: string; sectionId: string }
  | { type: 'COMPLETE_MODULE'; moduleId: string; quizScore: number; maxScore: number }
  | { type: 'UPDATE_STREAK' }
  | { type: 'CHECK_NIGHT' }
  | { type: 'DISMISS_TOAST'; id: number }
  | { type: 'SET_AVATAR'; avatarId: string; displayName: string }
  | { type: 'COMPLETE_ONBOARDING'; avatarId: string; displayName: string }
  | { type: 'LOAD'; state: Partial<State> }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'AWARD_XP': {
      const newXp = state.xp + action.amount;
      const prevLevel = getLevelInfo(state.xp).current.level;
      const newLevel = getLevelInfo(newXp).current.level;
      const leveledUp = newLevel > prevLevel;
      return {
        ...state, xp: newXp,
        dailyXPEarned: state.dailyXPEarned + action.amount,
        pendingToasts: [...state.pendingToasts, {
          id: Date.now() + Math.random(), amount: action.amount, reason: action.reason,
          leveledUp, newLevel: leveledUp ? newLevel : undefined,
        }],
      };
    }
    case 'EARN_BADGE': {
      if (state.earnedBadgeIds.includes(action.badgeId)) return state;
      const badge = BADGES.find(b => b.id === action.badgeId)!;
      return {
        ...state, xp: state.xp + badge.xp,
        earnedBadgeIds: [...state.earnedBadgeIds, action.badgeId],
        pendingToasts: [...state.pendingToasts, {
          id: Date.now() + Math.random() + 1, amount: badge.xp,
          reason: `Badge: ${badge.name}`, badge, isBadge: true,
        }],
      };
    }
    case 'INCREMENT': {
      const val = (state[action.stat] as number ?? 0) + (action.by ?? 1);
      return { ...state, [action.stat]: val };
    }
    case 'RECORD_CASE': {
      if (state.casesStudiedIds.includes(action.caseId)) return state;
      return { ...state, casesStudied: state.casesStudied + 1, casesStudiedIds: [...state.casesStudiedIds, action.caseId] };
    }
    case 'RECORD_MODULE_SECTION': {
      const existing = state.moduleProgress[action.moduleId] ?? { sectionsRead: [], quizScore: null, completed: false, startTime: Date.now() };
      if (existing.sectionsRead.includes(action.sectionId)) return state;
      return { ...state, moduleProgress: { ...state.moduleProgress, [action.moduleId]: { ...existing, sectionsRead: [...existing.sectionsRead, action.sectionId] } } };
    }
    case 'COMPLETE_MODULE': {
      const existing = state.moduleProgress[action.moduleId] ?? { sectionsRead: [], quizScore: null, completed: false, startTime: Date.now() };
      if (existing.completed) return state;
      const elapsed = (Date.now() - existing.startTime) / 60000;
      const isPerfect = action.quizScore === action.maxScore;
      return {
        ...state,
        modulesCompleted: state.modulesCompleted + 1,
        perfectQuizzes: state.perfectQuizzes + (isPerfect ? 1 : 0),
        fastModules: state.fastModules + (elapsed < 10 ? 1 : 0),
        moduleProgress: { ...state.moduleProgress, [action.moduleId]: { ...existing, completed: true, quizScore: action.quizScore } },
      };
    }
    case 'UPDATE_STREAK': {
      const today = new Date().toDateString();
      if (state.lastActiveDate === today) return state;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = state.lastActiveDate === yesterday ? state.currentStreak + 1 : 1;
      const dow = new Date().getDay();
      const week = [...state.weekActivity]; week[dow] = true;
      return { ...state, currentStreak: newStreak, longestStreak: Math.max(state.longestStreak, newStreak), lastActiveDate: today, weekActivity: week, dailyXPEarned: 0 };
    }
    case 'CHECK_NIGHT': {
      const h = new Date().getHours();
      if (h >= 0 && h < 3) return { ...state, nightSessions: state.nightSessions + 1 };
      return state;
    }
    case 'DISMISS_TOAST':
      return { ...state, pendingToasts: state.pendingToasts.filter(t => t.id !== action.id) };
    case 'SET_AVATAR':
      return { ...state, avatarId: action.avatarId, displayName: action.displayName };
    case 'COMPLETE_ONBOARDING':
      return { ...state, avatarId: action.avatarId, displayName: action.displayName, onboardingComplete: true };
    case 'LOAD':
      return { ...DEFAULT, ...action.state };
    case 'RESET':
      return { ...DEFAULT };
    default:
      return state;
  }
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────

interface GamCtx {
  state: State & { completedModuleIds: string[] };
  levelInfo: ReturnType<typeof getLevelInfo>;
  currentAvatar: AvatarDef | null;
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
  completeOnboarding: (avatarId: string, displayName: string) => void;
  resetProgress: () => void;
}

const Ctx = createContext<GamCtx | null>(null);
const STORAGE_KEY = 'investlab_gam_v1';

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT);
  const prevRef = useRef(state);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) dispatch({ type: 'LOAD', state: JSON.parse(s) }); } catch { }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { }
  }, [state]);

  useEffect(() => {
    dispatch({ type: 'UPDATE_STREAK' });
    dispatch({ type: 'CHECK_NIGHT' });
    dispatch({ type: 'AWARD_XP', amount: XP_REWARDS.DAILY_LOGIN, reason: 'Daily login' });
  }, []);

  useEffect(() => {
    const prev = prevRef.current;
    for (const badge of BADGES) {
      if (!state.earnedBadgeIds.includes(badge.id) && badge.unlock(state) && !prev.earnedBadgeIds.includes(badge.id)) {
        dispatch({ type: 'EARN_BADGE', badgeId: badge.id });
      }
    }
    prevRef.current = state;
  }, [state.conceptsLearned, state.articlesRead, state.modulesCompleted, state.perfectQuizzes, state.casesStudied, state.backtestsRun, state.scenariosCompleted, state.currentStreak, state.nightSessions, state.fastModules]);

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
  const completeOnboarding = useCallback((avatarId: string, displayName: string) => dispatch({ type: 'COMPLETE_ONBOARDING', avatarId, displayName }), []);
  const resetProgress = useCallback(() => { if (window.confirm('Reset all progress? This cannot be undone.')) dispatch({ type: 'RESET' }); }, []);

  const completedModuleIds = Object.keys(state.moduleProgress).filter(id => state.moduleProgress[id]?.completed);
  const currentAvatar = AVATARS.find(a => a.id === state.avatarId) ?? null;

  const value: GamCtx = {
    state: { ...state, completedModuleIds }, levelInfo: getLevelInfo(state.xp), currentAvatar,
    awardXP, recordConceptLearned, recordArticleRead, recordModuleSection, completeModule,
    recordQuizCorrect, recordQuizPerfect, recordCaseStudied, recordBacktest, recordScenario,
    dismissToast, setAvatar, completeOnboarding, resetProgress,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGamification() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGamification must be inside GamificationProvider');
  return ctx;
}