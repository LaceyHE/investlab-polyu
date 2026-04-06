import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import type { ScenarioStock } from "@/data/scenario-stocks";
import type { Position, PortfolioMetrics } from "@/hooks/useScenarioSimulation";
import type { ScenarioEvent } from "@/data/scenario-presets";

export type PushMessageType = 'warning' | 'info' | 'suggestion' | 'crash' | 'rally' | 'volatility' | 'bubble';

export interface PushMessage {
  id: string;
  type: PushMessageType;
  text: string;
  timestamp: number;
  ttl: number; // milliseconds until auto-dismiss
}

interface UsePushMessagesParams {
  positions: Position[];
  metrics: PortfolioMetrics;
  currentEvent: ScenarioEvent | null;
  enabled: boolean;
  stocks: ScenarioStock[];
}

const DEFAULT_TTL = 6000;

export function usePushMessages({ positions, metrics, currentEvent, enabled, stocks }: UsePushMessagesParams) {
  const [messages, setMessages] = useState<PushMessage[]>([]);
  const lastMessageTime = useRef(0);
  const lastEventId = useRef<string | null>(null);

  // Auto-dismiss expired messages
  useEffect(() => {
    if (messages.length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      setMessages(prev => prev.filter(m => now - m.timestamp < m.ttl));
    }, 500);
    return () => clearInterval(interval);
  }, [messages.length]);

  const analysis = useMemo(() => {
    const sectorWeights: Record<string, number> = {};
    let failedWeight = 0;
    let totalWeight = 0;

    positions.forEach(pos => {
      const stock = stocks.find(s => s.ticker === pos.ticker);
      if (stock) {
        sectorWeights[stock.industry] = (sectorWeights[stock.industry] || 0) + pos.weight;
        if (stock.riskCategory === 'failed') failedWeight += pos.weight;
        totalWeight += pos.weight;
      }
    });

    const maxSector = Object.entries(sectorWeights).sort((a, b) => b[1] - a[1])[0];
    const maxSectorPct = maxSector ? (maxSector[1] / Math.max(totalWeight, 1)) * 100 : 0;
    const hasResilient = positions.some(p => stocks.find(s => s.ticker === p.ticker)?.riskCategory === 'resilient');

    return { sectorWeights, failedWeight, totalWeight, maxSector, maxSectorPct, hasResilient };
  }, [positions]);

  useEffect(() => {
    if (!enabled || positions.length === 0) return;

    const now = Date.now();
    if (now - lastMessageTime.current < 10000) return;

    const newMessages: PushMessage[] = [];

    // Concentration warning
    if (analysis.maxSector && analysis.maxSectorPct > 50) {
      newMessages.push({
        id: `conc-${now}`,
        type: 'warning',
        text: `Your portfolio is concentrated in ${analysis.maxSector[0]} (${analysis.maxSectorPct.toFixed(0)}%). Historically, sector concentration amplified losses during crashes.`,
        timestamp: now,
        ttl: DEFAULT_TTL,
      });
    }

    // All failed stocks suggestion
    if (analysis.failedWeight > 0 && !analysis.hasResilient && analysis.totalWeight > 20) {
      newMessages.push({
        id: `risk-${now}`,
        type: 'suggestion',
        text: 'Consider diversifying into less volatile sectors to reduce potential drawdown.',
        timestamp: now,
        ttl: DEFAULT_TTL,
      });
    }

    // High return + high drawdown
    if (metrics.totalReturn > 20 && metrics.maxDrawdown < -25 && metrics.sharpeRatio < 0.5) {
      newMessages.push({
        id: `hrd-${now}`,
        type: 'warning',
        text: `Your portfolio shows high returns, but drawdown reached ${metrics.maxDrawdown.toFixed(1)}%, and Sharpe is only ${metrics.sharpeRatio.toFixed(2)}, indicating excessive risk.`,
        timestamp: now,
        ttl: DEFAULT_TTL,
      });
    }

    // High volatility
    if (metrics.volatility > 35) {
      newMessages.push({
        id: `vol-${now}`,
        type: 'volatility',
        text: `Portfolio volatility is ${metrics.volatility.toFixed(1)}% — well above typical levels. Market stress may be rising; consider diversifying.`,
        timestamp: now,
        ttl: DEFAULT_TTL,
      });
    }

    if (newMessages.length > 0) {
      lastMessageTime.current = now;
      setMessages(prev => [...newMessages, ...prev].slice(0, 5));
    }
  }, [analysis, metrics, enabled, positions.length]);

  // Event-based messages with type mapping
  useEffect(() => {
    if (!enabled || !currentEvent) return;
    const eventKey = currentEvent.date + currentEvent.label;
    if (lastEventId.current === eventKey) return;
    lastEventId.current = eventKey;

    const now = Date.now();
    const label = currentEvent.label.toLowerCase();

    let msgType: PushMessageType = 'info';
    if (label.includes('crash') || label.includes('collapse') || label.includes('bust')) msgType = 'crash';
    else if (label.includes('rally') || label.includes('surge') || label.includes('boom')) msgType = 'rally';
    else if (label.includes('bubble') || label.includes('mania') || label.includes('euphoria')) msgType = 'bubble';
    else if (label.includes('volatil') || label.includes('fear') || label.includes('panic')) msgType = 'volatility';

    const msg: PushMessage = {
      id: `evt-${now}`,
      type: msgType,
      text: `Market this month: ${currentEvent.label}. ${currentEvent.description}`,
      timestamp: now,
      ttl: DEFAULT_TTL,
    };
    setMessages(prev => [msg, ...prev].slice(0, 5));
  }, [currentEvent, enabled]);

  const dismissMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  return { messages, dismissMessage };
}
