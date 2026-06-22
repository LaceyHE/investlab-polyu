import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Trash2, Loader2, Bot, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  id: number;
}

// Suggested prompts per route
const PAGE_SUGGESTIONS: Record<string, string[]> = {
  "/": [
    "Where should I start as a beginner?",
    "What can I learn on InvestLab?",
    "What is the difference between stocks and bonds?",
  ],
  "/learning-path": [
    "What order should I complete the modules?",
    "What does each module cover?",
    "How long does a module take to finish?",
  ],
  "/module/1": [
    "What is the time value of money?",
    "Explain compound interest with an example",
    "What is the difference between risk and return?",
  ],
  "/module/2": [
    "What is the difference between a stock and a bond?",
    "What is an ETF and how does it work?",
    "What are real assets?",
  ],
  "/module/3": [
    "What does a P/E ratio tell me?",
    "Explain discounted cash flow (DCF) simply",
    "What is intrinsic value?",
  ],
  "/module/4": [
    "What is portfolio diversification?",
    "How is beta calculated?",
    "What is the efficient frontier?",
  ],
  "/module/5": [
    "How do moving averages work?",
    "What is the RSI indicator?",
    "When does momentum investing fail?",
  ],
  "/module/6": [
    "What is loss aversion in investing?",
    "What are the most common cognitive biases?",
    "What is herd behaviour in markets?",
  ],
  "/sandbox": [
    "What is backtesting?",
    "How does the Sharpe ratio work?",
    "When does a momentum strategy fail?",
    "What is a moving average crossover?",
  ],
  "/scenarios": [
    "What is mean reversion?",
    "How does a volatility shock crash markets?",
    "What is the Shiller CAPE ratio?",
    "How do I build a defensive portfolio?",
  ],
  "/finsignal": [
    "How do I interpret sentiment scores?",
    "What drives stock price movements?",
    "How do I read financial news critically?",
  ],
  "/financial-statements": [
    "How do I read a balance sheet?",
    "What does EBITDA mean?",
    "What is free cash flow?",
    "What does a P/E ratio measure?",
  ],
  "/account": [
    "How is my learning progress tracked?",
    "What skills am I developing?",
    "How do I complete a module?",
  ],
};

const PAGE_TITLES: Record<string, string> = {
  "/": "Home",
  "/learning-path": "Learning Path",
  "/module/1": "Module 1 — Foundations",
  "/module/2": "Module 2 — Asset Classes",
  "/module/3": "Module 3 — Valuation",
  "/module/4": "Module 4 — Portfolio Theory",
  "/module/5": "Module 5 — Technical Analysis",
  "/module/6": "Module 6 — Behavioural Finance",
  "/sandbox": "Strategy Sandbox",
  "/scenarios": "Scenario Simulator",
  "/finsignal": "FinSignal",
  "/financial-statements": "Financial Statements",
  "/account": "Account",
};

function getPageContext(pathname: string): { title: string; suggestions: string[] } {
  // Normalise module sub-paths
  const key = Object.keys(PAGE_TITLES).find((k) => pathname === k || pathname.startsWith(k + "/")) ?? pathname;
  return {
    title: PAGE_TITLES[key] ?? "InvestLab",
    suggestions: PAGE_SUGGESTIONS[key] ?? PAGE_SUGGESTIONS["/"],
  };
}

let nextId = 1;

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const { title: pageTitle, suggestions } = getPageContext(location.pathname);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [messages, open, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasUnread(false);
    }
  }, [open]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed, id: nextId++ };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke("chatbot", {
        body: {
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          pageContext: location.pathname,
          pageTitle,
        },
      });

      if (response.error) throw new Error(response.error.message);

      const reply = response.data?.reply ?? "Sorry, I couldn't generate a response.";
      const assistantMsg: Message = { role: "assistant", content: reply, id: nextId++ };
      setMessages((prev) => [...prev, assistantMsg]);

      if (!open) setHasUnread(true);
    } catch (err: any) {
      if (err.message?.includes("429")) {
        setError("Rate limit reached — please wait a moment and try again.");
      } else if (err.message?.includes("402")) {
        setError("AI credits exhausted. Contact the platform administrator.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, [messages, loading, location.pathname, pageTitle, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const showSuggestions = messages.length === 0 && !loading;

  return (
    <>
      {/* Floating toggle button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Ask AI</span>
              {hasUnread && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-warm animate-pulse" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 flex w-[360px] flex-col rounded-2xl border border-border bg-card shadow-2xl"
            style={{ height: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-border px-4 py-3 shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-none">InvestLab Assistant</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{pageTitle}</p>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    title="Clear conversation"
                    className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {/* Welcome state */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center pt-4 pb-2 text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">How can I help?</p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Ask me anything about investing or the InvestLab platform.
                  </p>
                  <div className="flex flex-col gap-1.5 w-full">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-left text-xs text-foreground hover:bg-secondary hover:border-muted-foreground/30 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Message bubbles */}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mr-2 mt-0.5">
                      <Bot className="h-3 w-3 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex gap-1 rounded-2xl bg-secondary px-3 py-2.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                  <button
                    onClick={() => setError(null)}
                    className="ml-2 underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Inline suggestions after responses */}
              {messages.length > 0 && !loading && messages.length < 6 && (
                <div className="pt-1">
                  <p className="text-[10px] text-muted-foreground mb-1.5 px-1">Suggested follow-ups</p>
                  <div className="flex flex-wrap gap-1.5">
                    {suggestions.slice(0, 2).map((s) => (
                      <button
                        key={s}
                        onClick={() => sendMessage(s)}
                        className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-border px-3 py-3 shrink-0"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                disabled={loading}
                className="flex-1 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </form>

            {/* Footer disclaimer */}
            <p className="pb-2 text-center text-[9px] text-muted-foreground/60 shrink-0">
              For education only — not financial advice
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
