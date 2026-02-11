import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowLeft, Newspaper, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useDotcomSimulation } from '@/hooks/useDotcomSimulation';
import { STOCKS } from '@/data/dotcom-data';
import DotComStockCard from './DotComStockCard';
import DotComSummary from './DotComSummary';
import { generateStockPrices } from '@/data/dotcom-data';
import { useMemo } from 'react';

interface Props {
  onBack: () => void;
}

const sentimentColor: Record<string, string> = {
  Optimistic: 'text-emerald-500',
  Euphoria: 'text-emerald-400',
  Concern: 'text-amber-500',
  Stress: 'text-orange-500',
  Panic: 'text-red-500',
};

const sentimentBorder: Record<string, string> = {
  Optimistic: 'border-emerald-500/20',
  Euphoria: 'border-emerald-400/30',
  Concern: 'border-amber-500/20',
  Stress: 'border-orange-500/20',
  Panic: 'border-red-500/30',
};

export default function DotComSimulation({ onBack }: Props) {
  const sim = useDotcomSimulation();
  const [showNews, setShowNews] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [showTradeLog, setShowTradeLog] = useState(false);

  // For summary
  const allPrices = useMemo(() => {
    const map: Record<string, number[]> = {};
    STOCKS.forEach(s => { map[s.ticker] = generateStockPrices(s); });
    return map;
  }, []);

  const sectors = ['All', 'Established Tech', 'Internet Leaders', 'Speculative', 'Telecom', 'Defensive'];
  const filteredStocks = activeFilter === 'All'
    ? sim.stocks
    : sim.stocks.filter(s => s.def.sector === activeFilter);

  const cashPct = sim.nav > 0 ? (sim.portfolio.cash / sim.nav * 100).toFixed(1) : '100.0';

  // ---- Intro screen ----
  if (!sim.isStarted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to scenarios
        </button>

        <div className="rounded-xl border border-border bg-card p-8 text-center space-y-4">
          <p className="text-6xl">📈</p>
          <h2 className="font-serif text-3xl text-foreground">The Dot-Com Bubble</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            It's January 1999. The internet is changing everything. Tech stocks are soaring.
            You have $1,000,000 to invest. What could go wrong?
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto text-center pt-4">
            <div>
              <p className="font-mono text-lg font-bold text-foreground">46</p>
              <p className="text-[10px] text-muted-foreground">Months</p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-foreground">20</p>
              <p className="text-[10px] text-muted-foreground">Stocks</p>
            </div>
            <div>
              <p className="font-mono text-lg font-bold text-foreground">$1M</p>
              <p className="text-[10px] text-muted-foreground">Capital</p>
            </div>
          </div>
          <button
            onClick={sim.startSimulation}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-8 py-3 font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Play className="h-4 w-4" /> Enter the Bubble
          </button>
        </div>
      </motion.div>
    );
  }

  // ---- Summary screen ----
  if (sim.isComplete) {
    return (
      <DotComSummary
        nav={sim.nav}
        totalReturn={sim.totalReturn}
        holdings={sim.portfolio.holdings}
        tradeLog={sim.tradeLog}
        allPrices={allPrices}
        onBack={onBack}
      />
    );
  }

  const md = sim.monthData;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to scenarios
      </button>

      {/* ====== MARKET DASHBOARD ====== */}
      <div className={`rounded-xl border ${sentimentBorder[md.sentiment]} bg-card p-5`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-mono text-xs text-muted-foreground">Date</p>
            <p className="font-serif text-xl font-bold text-foreground">{md.date}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-muted-foreground">Sentiment</p>
            <p className={`font-bold text-sm ${sentimentColor[md.sentiment]}`}>{md.sentiment}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground">Nasdaq</p>
            <p className="font-mono font-bold text-foreground">{md.nasdaq.toLocaleString()}</p>
            <p className={`text-[10px] font-mono ${md.nasdaq >= md.nasdaqPrev ? 'text-emerald-500' : 'text-red-500'}`}>
              {md.nasdaq >= md.nasdaqPrev ? '+' : ''}{((md.nasdaq - md.nasdaqPrev) / md.nasdaqPrev * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">YTD Return</p>
            <p className={`font-mono font-bold ${md.ytdReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {md.ytdReturn >= 0 ? '+' : ''}{md.ytdReturn}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Tech Avg P/E</p>
            <p className="font-mono font-bold text-foreground">{md.techPE}x</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">IPO Activity</p>
            <p className="font-mono font-bold text-foreground text-xs">{md.ipoActivity}</p>
          </div>
        </div>

        {/* Bubble level bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-muted-foreground">Bubble Level</p>
            <p className="text-[10px] text-muted-foreground">{md.bubbleLevel.toFixed(0)}/10</p>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${md.bubbleLevel > 7 ? 'bg-red-500' : md.bubbleLevel > 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              animate={{ width: `${md.bubbleLevel * 10}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>

      {/* ====== NEWS FEED ====== */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => setShowNews(!showNews)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Newspaper className="h-4 w-4 text-muted-foreground" /> Market Headlines
          </span>
          {showNews ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showNews && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-border"
            >
              <div className="p-4 space-y-2">
                {md.news.map((headline, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className={`mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                      md.sentiment === 'Panic' || md.sentiment === 'Stress' ? 'bg-red-400' :
                      md.sentiment === 'Euphoria' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`} />
                    <p className="text-sm text-foreground">{headline}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ====== PORTFOLIO OVERVIEW ====== */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground">NAV</p>
            <motion.p
              key={sim.nav}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="font-mono font-bold text-foreground"
            >
              ${sim.nav.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </motion.p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Total Return</p>
            <p className={`font-mono font-bold ${sim.totalReturn >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {sim.totalReturn >= 0 ? '+' : ''}{sim.totalReturn.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Cash</p>
            <p className="font-mono font-bold text-foreground">{cashPct}%</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Holdings</p>
            <p className="font-mono font-bold text-foreground">{sim.holdingsCount}</p>
          </div>
        </div>

        {/* Risk bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-muted-foreground">Risk Level</p>
            <p className="text-[10px] text-muted-foreground">{sim.riskLevel}/10</p>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${sim.riskLevel > 7 ? 'bg-red-500' : sim.riskLevel > 4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              animate={{ width: `${sim.riskLevel * 10}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>

      {/* ====== MONTH SUMMARY BANNER ====== */}
      <AnimatePresence>
        {sim.monthSummary && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl border p-4 flex items-center justify-between ${sentimentBorder[md.sentiment]} bg-card`}
          >
            <p className="text-sm text-foreground">{sim.monthSummary}</p>
            <button onClick={sim.dismissSummary} className="text-muted-foreground hover:text-foreground ml-2">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== SECTOR FILTER ====== */}
      <div className="flex flex-wrap gap-2">
        {sectors.map(s => (
          <button
            key={s}
            onClick={() => setActiveFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFilter === s
                ? 'bg-foreground text-background'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* ====== STOCK CARDS GRID ====== */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStocks.map(stock => (
          <DotComStockCard
            key={stock.def.ticker}
            stock={stock}
            positionPct={sim.getPositionPct(stock.def.ticker)}
            onBuy={() => sim.buyStock(stock.def.ticker)}
            onSell={() => sim.sellStock(stock.def.ticker)}
            canBuy={sim.portfolio.cash >= sim.nav * 0.09}
          />
        ))}
      </div>

      {/* ====== ADVANCE BUTTON ====== */}
      <div className="flex flex-col items-center gap-3 pt-4">
        {sim.holdingsCount < 5 && (
          <p className="text-xs text-amber-500">Minimum 5 holdings required to advance (currently {sim.holdingsCount})</p>
        )}
        <button
          onClick={sim.advanceMonth}
          disabled={sim.holdingsCount < 5}
          className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-8 py-3.5 font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4" /> Advance 1 Month
        </button>
        <p className="text-[10px] text-muted-foreground">Month {sim.month + 1} of 46</p>
      </div>

      {/* ====== TRADE LOG ====== */}
      {sim.tradeLog.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setShowTradeLog(!showTradeLog)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/50 transition-colors"
          >
            <span className="text-sm font-medium text-foreground">Trade Log ({sim.tradeLog.length})</span>
            {showTradeLog ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          <AnimatePresence>
            {showTradeLog && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="border-t border-border overflow-hidden"
              >
                <div className="p-4 space-y-1 max-h-48 overflow-y-auto">
                  {[...sim.tradeLog].reverse().map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t.date}</span>
                      <span className={t.action === 'BUY' ? 'text-emerald-500' : 'text-red-500'}>{t.action}</span>
                      <span className="font-mono text-foreground">{t.ticker}</span>
                      <span className="font-mono text-muted-foreground">${t.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ====== DECISION EVENT MODAL ====== */}
      <AnimatePresence>
        {sim.activeDecision && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4 shadow-lg"
            >
              <div className="text-center">
                <p className="text-2xl mb-2">⚡</p>
                <h3 className="font-serif text-lg font-bold text-foreground">{sim.activeDecision.headline}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{sim.activeDecision.context}</p>
              </div>
              <div className="space-y-2">
                {sim.activeDecision.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => sim.handleDecision(opt.action)}
                    className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground hover:bg-secondary transition-colors text-left"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
