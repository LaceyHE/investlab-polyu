import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, ArrowLeft, ChevronRight, Calendar, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import ScenarioCard from "@/components/scenario/ScenarioCard";
import MarketChart from "@/components/scenario/MarketChart";
import PortfolioBuilder from "@/components/scenario/PortfolioBuilder";
import DotComSidePanel from "@/components/scenario/DotComSidePanel";
import TimelineScrubber from "@/components/scenario/TimelineScrubber";
import AnalyticsPanel from "@/components/scenario/AnalyticsPanel";
import AICommentary from "@/components/scenario/AICommentary";
import LearningOutcomes from "@/components/scenario/LearningOutcomes";
import PersonalizedOutcomes from "@/components/scenario/PersonalizedOutcomes";
import PushMessages from "@/components/scenario/PushMessages";
import { scenarioPresets, type ScenarioPreset } from "@/data/scenario-presets";
import { useMarketData, type TimeAggregation } from "@/hooks/useMarketData";
import { useScenarioSimulation } from "@/hooks/useScenarioSimulation";
import { usePushMessages } from "@/hooks/usePushMessages";
import { dotcomStocks } from "@/data/dotcom-stocks";

const ScenarioSimulator = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioPreset | null>(null);
  const [aggregationOverride, setAggregationOverride] = useState<TimeAggregation | null>(null);
  const [showDrawdown, setShowDrawdown] = useState(false);
  const [showVolatility, setShowVolatility] = useState(false);
  const [showSharpe, setShowSharpe] = useState(false);

  const isDotCom = selectedScenario?.id === 'dotcom';

  const allTickers = useMemo(() => {
    if (!selectedScenario) return [];
    if (isDotCom) return [selectedScenario.indexTicker, ...dotcomStocks.map(s => s.ticker)];
    return [selectedScenario.indexTicker, ...selectedScenario.tickers];
  }, [selectedScenario, isDotCom]);

  const { data: marketData, isLoading: isLoadingData } = useMarketData(
    allTickers, selectedScenario?.startDate || '', selectedScenario?.endDate || '',
  );

  const allDates = useMemo(() => {
    if (!marketData || !selectedScenario) return [];
    return marketData[selectedScenario.indexTicker]?.map(d => d.date) || [];
  }, [marketData, selectedScenario]);

  const simulation = useScenarioSimulation(marketData, allDates);

  const recentEvents = useMemo(() => {
    if (!selectedScenario) return [];
    return selectedScenario.events.filter(e => {
      const eventDate = new Date(e.date);
      const current = new Date(simulation.currentDate);
      const daysAgo = (current.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo >= 0 && daysAgo <= 60;
    });
  }, [selectedScenario, simulation.currentDate]);

  const currentEvent = useMemo(() => {
    if (!selectedScenario) return null;
    return selectedScenario.events.find(e => {
      const eventDate = new Date(e.date);
      const current = new Date(simulation.currentDate);
      const diff = Math.abs(current.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 7;
    }) || null;
  }, [selectedScenario, simulation.currentDate]);

  const { messages: pushMessages, dismissMessage } = usePushMessages({
    positions: simulation.state.positions,
    metrics: simulation.metrics,
    currentEvent,
    enabled: !!selectedScenario && isDotCom,
  });

  const indexData = marketData?.[selectedScenario?.indexTicker || ''] || [];

  const handleBack = () => {
    setSelectedScenario(null);
    setAggregationOverride(null);
    setShowDrawdown(false);
    setShowVolatility(false);
    setShowSharpe(false);
    simulation.reset();
  };

  const isAtEnd = simulation.state.currentDateIndex >= allDates.length - 2 && allDates.length > 0;

  return (
    <AppLayout>
      <div className="container max-w-7xl py-12 md:py-20">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/learning-path" className="hover:text-foreground transition-colors">Learning Path</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Scenarios</span>
        </div>

        <AnimatePresence mode="wait">
          {!selectedScenario ? (
            <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Compass className="h-5 w-5" />
                </div>
                <h1 className="font-serif text-3xl text-foreground">Scenario Simulator</h1>
              </div>
              <p className="text-muted-foreground max-w-2xl mb-10">
                Explore historical market scenarios with real data. Build portfolios, scrub through time, and understand how different environments shape investment outcomes.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {scenarioPresets.map((scenario, i) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} index={i} onSelect={() => setSelectedScenario(scenario)} />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="simulation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to scenarios
              </button>

              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="font-serif text-2xl text-foreground mb-1">{selectedScenario.name}</h1>
                  <p className="text-sm text-muted-foreground">{selectedScenario.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {simulation.currentDate ? new Date(simulation.currentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                    <span className="text-muted-foreground">Peak: {selectedScenario.peakDrawdown}</span>
                  </div>
                </div>
              </div>

              {/* Push messages */}
              {isDotCom && <PushMessages messages={pushMessages} onDismiss={dismissMessage} />}

              {/* Event badge (for non-dotcom or when no push messages) */}
              {currentEvent && !isDotCom && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg border p-3 mb-4 ${
                    currentEvent.type === 'crash' ? 'border-destructive/30 bg-destructive/5' :
                    currentEvent.type === 'recovery' ? 'border-teal/30 bg-teal/5' :
                    currentEvent.type === 'fed' ? 'border-primary/30 bg-primary/5' :
                    'border-warm/30 bg-warm/5'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{currentEvent.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{currentEvent.description}</p>
                </motion.div>
              )}

              {isLoadingData ? (
                <div className="flex items-center justify-center py-20 text-muted-foreground">
                  <div className="text-center">
                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm">Loading market data...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_340px] lg:items-stretch">
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Index', value: indexData.find(d => d.date <= simulation.currentDate)?.close?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '—' },
                          { label: 'Portfolio NAV', value: `$${simulation.state.currentNav.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                          { label: 'Return', value: `${simulation.metrics.totalReturn >= 0 ? '+' : ''}${simulation.metrics.totalReturn.toFixed(1)}%`, color: simulation.metrics.totalReturn >= 0 ? 'text-teal' : 'text-destructive' },
                          { label: 'Drawdown', value: `${simulation.metrics.maxDrawdown.toFixed(1)}%`, color: 'text-destructive' },
                        ].map(stat => (
                          <div key={stat.label} className="rounded-lg border border-border bg-card p-3 text-center">
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className={`text-sm font-mono font-medium mt-1 ${(stat as any).color || 'text-foreground'}`}>{stat.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Analytics */}
                      <AnalyticsPanel metrics={simulation.metrics} positions={simulation.state.positions} />

                      {/* Chart */}
                      <MarketChart
                        indexData={indexData}
                        navHistory={simulation.state.navHistory}
                        events={selectedScenario.events}
                        currentDate={simulation.currentDate}
                        aggregationOverride={aggregationOverride}
                        onAggregationChange={setAggregationOverride}
                        showDrawdown={showDrawdown}
                        showVolatility={showVolatility}
                        showSharpe={showSharpe}
                        onToggleDrawdown={() => setShowDrawdown(!showDrawdown)}
                        onToggleVolatility={() => setShowVolatility(!showVolatility)}
                        onToggleSharpe={() => setShowSharpe(!showSharpe)}
                        rollingSharpe={simulation.rollingSharpe}
                        portfolioDrawdown={simulation.portfolioDrawdown}
                      />

                      <TimelineScrubber
                        currentIndex={simulation.state.currentDateIndex}
                        totalDates={allDates.length}
                        currentDate={simulation.currentDate}
                        startDate={selectedScenario.startDate}
                        endDate={selectedScenario.endDate}
                        isPlaying={simulation.isPlaying}
                        playSpeed={simulation.playSpeed}
                        onScrub={simulation.setDateIndex}
                        onTogglePlay={() => simulation.setIsPlaying(!simulation.isPlaying)}
                        onSetSpeed={simulation.setPlaySpeed}
                        currentEvent={currentEvent}
                      />
                    </div>

                    {/* Sidebar — sticky with viewport-capped height, scrolls internally */}
                    <div className="lg:sticky lg:top-20 lg:self-start lg:h-[calc(100vh-6rem)] lg:overflow-hidden">
                      {isDotCom ? (
                        <DotComSidePanel
                          positions={simulation.state.positions}
                          cashWeight={simulation.state.cashWeight}
                          marketData={marketData}
                          currentDate={simulation.currentDate}
                          onUpdatePosition={simulation.updatePosition}
                        />
                      ) : (
                        <PortfolioBuilder
                          availableTickers={selectedScenario.tickers}
                          positions={simulation.state.positions}
                          cashWeight={simulation.state.cashWeight}
                          marketData={marketData}
                          currentDate={simulation.currentDate}
                          onUpdatePosition={simulation.updatePosition}
                        />
                      )}
                    </div>
                  </div>

                  {/* AI Commentary */}
                  <AICommentary
                    scenario={selectedScenario}
                    currentDate={simulation.currentDate}
                    positions={simulation.state.positions}
                    metrics={simulation.metrics}
                    recentEvents={recentEvents}
                    autoTrigger={isDotCom}
                  />

                  {/* Learning Outcomes: personalized for dot-com, static for others */}
                  {isDotCom && isAtEnd && simulation.state.positions.length > 0 ? (
                    <PersonalizedOutcomes
                      scenario={selectedScenario}
                      positions={simulation.state.positions}
                      metrics={simulation.metrics}
                      currentDate={simulation.currentDate}
                    />
                  ) : (
                    <LearningOutcomes scenario={selectedScenario} />
                  )}

                  {/* Transparency note */}
                  <p className="text-[10px] text-muted-foreground text-center pt-2">
                    This simulation uses historical market data and is for learning purposes only. Not financial advice.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default ScenarioSimulator;
