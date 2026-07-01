// src/components/InteractiveLab.tsx
import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  MessageCircle,
  RotateCcw,
  Send,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { chatAI, AIMessage } from '@/lib/ai';

// ============ TYPES ============

export interface Prediction {
  asset: string;
  question: string;
  correctAnswer: 'up' | 'flat' | 'down';
  actualOutcome: string;
  explanation: string;
}

export interface CaseForLab {
  id: string;
  title: string;
  background: string;
  predictions?: Prediction[];
  counterfactuals?: string[];
}

// ============ MAIN COMPONENT ============

export default function InteractiveLab({ caseData }: { caseData: CaseForLab }) {
  return (
    <div className="space-y-8">
      {caseData.predictions && caseData.predictions.length > 0 && (
        <PredictionMode predictions={caseData.predictions} />
      )}
      {caseData.counterfactuals && caseData.counterfactuals.length > 0 && (
        <WhatIfSimulator caseData={caseData} />
      )}
      <SocraticChat caseData={caseData} />
    </div>
  );
}

// ============ FEATURE 1: PREDICTION MODE ============

function PredictionMode({ predictions }: { predictions: Prediction[] }) {
  const [answers, setAnswers] = useState<Record<number, 'up' | 'flat' | 'down'>>({});
  const [revealed, setRevealed] = useState(false);

  const allAnswered = predictions.every((_, i) => answers[i]);
  const score = predictions.filter((p, i) => answers[i] === p.correctAnswer).length;

  return (
    <section className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
          INTERACTIVE
        </div>
        <h2 className="text-xl font-bold">🧪 Predict Before You Learn</h2>
      </div>
      <p className="mb-6 text-sm text-slate-600">
        Test your intuition. Predict the outcome, then compare with history.
      </p>

      <div className="space-y-4">
        {predictions.map((p, i) => (
          <div key={i} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="font-medium">{p.asset}</p>
            <p className="mb-3 text-sm text-slate-600">{p.question}</p>

            <div className="flex gap-2">
              {(['up', 'flat', 'down'] as const).map((dir) => {
                const isSelected = answers[i] === dir;
                const isCorrect = revealed && dir === p.correctAnswer;
                const isWrong = revealed && isSelected && dir !== p.correctAnswer;

                return (
                  <button
                    key={dir}
                    disabled={revealed}
                    onClick={() => setAnswers({ ...answers, [i]: dir })}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                      isCorrect
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : isWrong
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {dir === 'up' && <TrendingUp className="h-4 w-4" />}
                    {dir === 'flat' && <Minus className="h-4 w-4" />}
                    {dir === 'down' && <TrendingDown className="h-4 w-4" />}
                    {dir.charAt(0).toUpperCase() + dir.slice(1)}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  {answers[i] === p.correctAnswer ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  Actual: <span className="font-mono">{p.actualOutcome}</span>
                </div>
                <p className="mt-1 text-slate-600">{p.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        {!revealed ? (
          <button
            disabled={!allAnswered}
            onClick={() => setRevealed(true)}
            className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Submit Prediction
          </button>
        ) : (
          <>
            <div className="text-lg font-semibold">
              Score: {score}/{predictions.length}
            </div>
            <button
              onClick={() => {
                setAnswers({});
                setRevealed(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// ============ FEATURE 2: WHAT-IF SIMULATOR ============

function WhatIfSimulator({ caseData }: { caseData: CaseForLab }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const toggle = (i: number) => {
    const next = new Set(selected);
    next.has(i) ? next.delete(i) : next.add(i);
    setSelected(next);
  };

  const simulate = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const chosen = Array.from(selected).map((i) => caseData.counterfactuals![i]);
      const response = await chatAI([
        {
          role: 'system',
          content:
            'You are a financial history analyst. Write concise counterfactual analyses in flowing prose (no headings, no bullets). Keep it under 180 words. Be specific about likely asset price impacts and second-order effects.',
        },
        {
          role: 'user',
          content: `Historical case: ${caseData.title}\n\nBackground: ${caseData.background}\n\nCounterfactual scenarios to combine: ${chosen.join(
            '; '
          )}\n\nDescribe how markets and the sector would likely have evolved differently.`,
        },
      ]);
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border-2 border-purple-200 bg-purple-50/50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
          AI-POWERED
        </div>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Sparkles className="h-5 w-5 text-purple-600" />
          What If? Counterfactual Simulator
        </h2>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        Select one or more alternate scenarios. AI will simulate how history might have unfolded.
      </p>

      <div className="mb-4 space-y-2">
        {caseData.counterfactuals!.map((cf, i) => (
          <label
            key={i}
            className="flex cursor-pointer items-start gap-3 rounded-lg bg-white p-3 shadow-sm transition hover:bg-slate-50"
          >
            <input
              type="checkbox"
              checked={selected.has(i)}
              onChange={() => toggle(i)}
              className="mt-1 h-4 w-4 accent-purple-600"
            />
            <span className="text-sm">{cf}</span>
          </label>
        ))}
      </div>

      <button
        disabled={selected.size === 0 || loading}
        onClick={simulate}
        className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? 'Simulating...' : 'Simulate Counterfactual'}
      </button>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 rounded-lg border border-purple-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
          {result}
        </div>
      )}
    </section>
  );
}

// ============ FEATURE 3: SOCRATIC CHAT ============

function SocraticChat({ caseData }: { caseData: CaseForLab }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const systemPrompt: AIMessage = {
    role: 'system',
    content: `You are a Socratic tutor helping a university finance student analyze this historical case: "${caseData.title}". Context: ${caseData.background}\n\nYour role is NOT to give answers. Instead, ask probing follow-up questions that challenge assumptions, request evidence, or introduce counter-perspectives. Keep each response under 60 words. Always end with a question. Be warm but intellectually rigorous.`,
  };

  useEffect(() => {
    if (messages.length === 0) {
      openDialogue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const openDialogue = async () => {
    setLoading(true);
    setError('');
    try {
      const opener = await chatAI([
        systemPrompt,
        {
          role: 'user',
          content: 'Please open the dialogue with one thought-provoking Socratic question about this case.',
        },
      ]);
      setMessages([{ role: 'assistant', content: opener }]);
    } catch (e: any) {
      setError(e.message || 'Failed to start dialogue.');
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: AIMessage = { role: 'user', content: input };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError('');
    try {
      const reply = await chatAI([systemPrompt, ...next]);
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setError(e.message || 'AI response failed.');
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setMessages([]);
    setError('');
    openDialogue();
  };

  return (
    <section className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            AI TUTOR
          </div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            Socratic Dialogue
          </h2>
        </div>
        <button
          onClick={restart}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-50"
        >
          <RotateCcw className="h-3 w-3" /> Restart
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mb-3 h-80 space-y-3 overflow-y-auto rounded-lg bg-white p-4"
      >
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-md rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> AI is thinking...
          </div>
        )}
        {error && (
          <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">{error}</div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Type your response..."
          disabled={loading}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none disabled:bg-slate-100"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}