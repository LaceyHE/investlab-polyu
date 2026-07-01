import { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, RotateCcw, Send, CheckCircle2, XCircle } from 'lucide-react';
import { chatAI, type AIMessage } from '@/lib/ai';

interface Prediction {
  ticker: string;
  question: string;
  actual: 'up' | 'down' | 'flat';
  explanation: string;
}

interface CaseForLab {
  id: string;
  title: string;
  background: string;
  predictions?: Prediction[];
  counterfactuals?: string[];
}

export default function InteractiveLab({ caseData }: { caseData: CaseForLab }) {
  return (
    <div className="space-y-8">
      {caseData.predictions && caseData.predictions.length > 0 && (
        <PredictionMode predictions={caseData.predictions} />
      )}
      <WhatIfSimulator caseData={caseData} />
      <SocraticChat caseData={caseData} />
    </div>
  );
}

function PredictionMode({ predictions }: { predictions: Prediction[] }) {
  const [answers, setAnswers] = useState<Record<number, 'up' | 'down' | 'flat'>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = predictions.filter((p, i) => answers[i] === p.actual).length;

  return (
    <section className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">CHALLENGE</div>
        <h2 className="text-xl font-bold">🧪 Predict Before You Read</h2>
      </div>
      <p className="mb-4 text-sm text-slate-600">Make your predictions first, then reveal the actual historical outcomes.</p>
      <div className="space-y-4">
        {predictions.map((p, i) => (
          <div key={i} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="mb-2 font-medium">
              <span className="mr-2 rounded bg-slate-100 px-2 py-0.5 text-xs">{p.ticker}</span>
              {p.question}
            </div>
            <div className="flex gap-2">
              {(['up', 'down', 'flat'] as const).map((opt) => (
                <button
                  key={opt}
                  disabled={submitted}
                  onClick={() => setAnswers({ ...answers, [i]: opt })}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${answers[i] === opt ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} disabled:opacity-70`}
                >
                  {opt === 'up' ? '📈 Up' : opt === 'down' ? '📉 Down' : '➡️ Flat'}
                </button>
              ))}
            </div>
            {submitted && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  {answers[i] === p.actual ? (
                    <><CheckCircle2 className="h-4 w-4 text-green-600" /> Correct!</>
                  ) : (
                    <><XCircle className="h-4 w-4 text-red-600" /> Actual: {p.actual}</>
                  )}
                </div>
                <p className="text-slate-600">{p.explanation}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      {!submitted ? (
        <button
          disabled={Object.keys(answers).length < predictions.length}
          onClick={() => setSubmitted(true)}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Reveal Results
        </button>
      ) : (
        <div className="mt-4 rounded-lg bg-blue-100 p-3 text-sm font-medium text-blue-900">Score: {score} / {predictions.length}</div>
      )}
    </section>
  );
}

function WhatIfSimulator({ caseData }: { caseData: CaseForLab }) {
  const [scenarios, setScenarios] = useState<string[]>(caseData.counterfactuals || []);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (scenarios.length === 0) generateScenarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateScenarios = async () => {
    setLoadingScenarios(true);
    setError('');
    try {
      const response = await chatAI([
        { role: 'system', content: 'You generate counterfactual scenarios for financial history cases. Output EXACTLY 3 scenarios, one per line, no numbering, no bullets. Each scenario should be a concise "What if [specific historical variable had been different]" statement. Focus on plausible alternate policy choices, corporate decisions, or macro conditions relevant to the case. Keep each under 15 words.' },
        { role: 'user', content: `Case: ${caseData.title}\n\nBackground: ${caseData.background}\n\nGenerate 3 counterfactual scenarios.` },
      ]);
      const lines = response.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.match(/^[0-9\-\*•]/)).slice(0, 3);
      setScenarios(lines.length >= 3 ? lines : response.split('\n').filter((l) => l.trim()).slice(0, 3));
    } catch (e: any) {
      setError(e.message || 'Failed to generate scenarios.');
    } finally {
      setLoadingScenarios(false);
    }
  };

  const toggle = (i: number) => {
    const next = new Set(selected);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setSelected(next);
  };

  const simulate = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const chosen = Array.from(selected).map((i) => scenarios[i]);
      const response = await chatAI([
        { role: 'system', content: 'You are a financial historian. Given a real historical case and 1-3 counterfactual assumptions, produce a concise (150-250 word) causal narrative describing plausible alternate outcomes. Ground reasoning in economic mechanisms. Do not fabricate specific numbers.' },
        { role: 'user', content: `Historical case: ${caseData.title}\n\nBackground: ${caseData.background}\n\nCounterfactual assumptions:\n${chosen.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\nDescribe the alternate outcome.` },
      ]);
      setResult(response);
    } catch (e: any) {
      setError(e.message || 'AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  const reshuffleScenarios = () => {
    setSelected(new Set());
    setResult('');
    generateScenarios();
  };

  return (
    <section className="rounded-2xl border-2 border-purple-200 bg-purple-50/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">AI-POWERED</div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-purple-600" />
            What If? Counterfactual Simulator
          </h2>
        </div>
        {scenarios.length > 0 && !loadingScenarios && (
          <button onClick={reshuffleScenarios} disabled={loading} className="flex items-center gap-1 rounded-lg border border-purple-300 bg-white px-3 py-1 text-xs text-purple-700 hover:bg-purple-50 disabled:opacity-50">
            <RotateCcw className="h-3 w-3" /> New scenarios
          </button>
        )}
      </div>
      <p className="mb-4 text-sm text-slate-600">Select one or more AI-generated counterfactuals, then let the model simulate an alternate history.</p>
      {loadingScenarios ? (
        <div className="flex items-center gap-2 rounded-lg bg-white p-4 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Generating counterfactual scenarios...
        </div>
      ) : (
        <div className="mb-4 space-y-2">
          {scenarios.map((cf, i) => (
            <label key={i} className="flex cursor-pointer items-start gap-3 rounded-lg bg-white p-3 shadow-sm transition hover:bg-slate-50">
              <input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)} className="mt-1 h-4 w-4 accent-purple-600" />
              <span className="text-sm">{cf}</span>
            </label>
          ))}
        </div>
      )}
      <button disabled={selected.size === 0 || loading || loadingScenarios} onClick={simulate} className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-2 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? 'Simulating...' : 'Run Simulation'}
      </button>
      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {result && <div className="mt-4 whitespace-pre-wrap rounded-lg bg-white p-4 text-sm leading-relaxed shadow-sm">{result}</div>}
    </section>
  );
}

function SocraticChat({ caseData }: { caseData: CaseForLab }) {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startDialogue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startDialogue = async () => {
    setLoading(true);
    try {
      const opener = await chatAI([
        { role: 'system', content: 'You are a Socratic tutor for finance history. NEVER give direct answers. Always respond with a probing question that guides the learner to reason themselves. Keep responses under 60 words.' },
        { role: 'user', content: `Start a dialogue about this case: ${caseData.title}. Background: ${caseData.background}. Open with one thought-provoking question.` },
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
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError('');
    try {
      const response = await chatAI([
        { role: 'system', content: 'You are a Socratic tutor for finance history. NEVER give direct answers. Always respond with a probing question that guides the learner to reason themselves. Keep responses under 60 words. Context case: ' + caseData.title },
        ...nextMessages,
      ]);
      setMessages([...nextMessages, { role: 'assistant', content: response }]);
    } catch (e: any) {
      setError(e.message || 'AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border-2 border-green-200 bg-green-50/50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">AI TUTOR</div>
        <h2 className="text-xl font-bold">💬 Socratic Dialogue</h2>
      </div>
      <p className="mb-4 text-sm text-slate-600">The AI won't give you answers — it will only ask questions that push your thinking further.</p>
      <div ref={scrollRef} className="mb-4 max-h-96 space-y-3 overflow-y-auto rounded-lg bg-white p-4 shadow-sm">
        {messages.length === 0 && loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Starting dialogue...
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`rounded-lg p-3 text-sm ${m.role === 'user' ? 'ml-8 bg-green-100' : 'mr-8 bg-slate-100'}`}>
            <div className="mb-1 text-xs font-semibold text-slate-500">{m.role === 'user' ? 'You' : 'AI Tutor'}</div>
            <div className="whitespace-pre-wrap">{m.content}</div>
          </div>
        ))}
        {loading && messages.length > 0 && (
          <div className="mr-8 flex items-center gap-2 rounded-lg bg-slate-100 p-3 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
          </div>
        )}
      </div>
      {error && <div className="mb-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} disabled={loading} placeholder="Type your response..." className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none" />
        <button onClick={send} disabled={loading || !input.trim()} className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300">
          <Send className="h-4 w-4" /> Send
        </button>
      </div>
    </section>
  );
}
