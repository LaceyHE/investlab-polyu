import { useState, useEffect, useRef, useMemo } from "react";
import { dotcomStocks, type RiskCategory } from "@/data/dotcom-stocks";
import type { Position, PortfolioMetrics } from "@/hooks/useScenarioSimulation";
import type { ScenarioEvent } from "@/data/scenario-presets";

export interface PushMessage {
  id: string;
  type: 'warning' | 'info' | 'suggestion';
  text: string;
  timestamp: number;
}

interface UsePushMessagesParams {
  positions: Position[];
  metrics: PortfolioMetrics;
  currentEvent: ScenarioEvent | null;
  enabled: boolean;
}

export function usePushMessages({ positions, metrics, currentEvent, enabled }: UsePushMessagesParams) {
  const [messages, setMessages] = useState<PushMessage[]>([]);
  const lastMessageTime = useRef(0);
  const lastEventId = useRef<string | null>(null);

  const analysis = useMemo(() => {
    // Sector concentration
    const sectorWeights: Record<string, number> = {};
    let failedWeight = 0;
    let totalWeight = 0;

    positions.forEach(pos => {
      const stock = dotcomStocks.find(s => s.ticker === pos.ticker);
      if (stock) {
        sectorWeights[stock.industry] = (sectorWeights[stock.industry] || 0) + pos.weight;
        if (stock.riskCategory === 'failed') failedWeight += pos.weight;
        totalWeight += pos.weight;
      }
    });

    const maxSector = Object.entries(sectorWeights).sort((a, b) => b[1] - a[1])[0];
    const maxSectorPct = maxSector ? (maxSector[1] / Math.max(totalWeight, 1)) * 100 : 0;
    const hasResilient = positions.some(p => dotcomStocks.find(s => s.ticker === p.ticker)?.riskCategory === 'resilient');

    return { sectorWeights, failedWeight, totalWeight, maxSector, maxSectorPct, hasResilient };
  }, [positions]);

  useEffect(() => {
    if (!enabled || positions.length === 0) return;

    const now = Date.now();
    if (now - lastMessageTime.current < 10000) return; // 10s debounce

    const newMessages: PushMessage[] = [];

    // Concentration warning
    if (analysis.maxSector && analysis.maxSectorPct > 50) {
      newMessages.push({
        id: `conc-${now}`,
        type: 'warning',
        text: `Your portfolio is concentrated in ${analysis.maxSector[0]} (${analysis.maxSectorPct.toFixed(0)}%). Historically, sector concentration amplified losses during crashes.`,
        timestamp: now,
      });
    }

    // All failed stocks warning
    if (analysis.failedWeight > 0 && !analysis.hasResilient && analysis.totalWeight > 20) {
      newMessages.push({
        id: `risk-${now}`,
        type: 'suggestion',
        text: 'Consider diversifying into less volatile sectors to reduce potential drawdown.',
        timestamp: now,
      });
    }

    // High return + high drawdown
    if (metrics.totalReturn > 20 && metrics.maxDrawdown < -25 && metrics.sharpeRatio < 0.5) {
      newMessages.push({
        id: `hrd-${now}`,
        type: 'warning',
        text: `Your portfolio shows high returns, but drawdown reached ${metrics.maxDrawdown.toFixed(1)}%, and Sharpe is only ${metrics.sharpeRatio.toFixed(2)}, indicating excessive risk.`,
        timestamp: now,
      });
    }

    if (newMessages.length > 0) {
      lastMessageTime.current = now;
      setMessages(prev => [...newMessages, ...prev].slice(0, 5));
    }
  }, [analysis, metrics, enabled, positions.length]);

  // Event-based messages
  useEffect(() => {
    if (!enabled || !currentEvent) return;
    const eventKey = currentEvent.date + currentEvent.label;
    if (lastEventId.current === eventKey) return;
    lastEventId.current = eventKey;

    const now = Date.now();
    setMessages(prev => [{
      id: `evt-${now}`,
      type: 'info',
      text: `Market this month: ${currentEvent.label}. ${currentEvent.description}`,
      timestamp: now,
    }, ...prev].slice(0, 5));
  }, [currentEvent, enabled]);

  const dismissMessage = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return { messages, dismissMessage };
}
