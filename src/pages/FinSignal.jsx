import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  BookOpen, X, ChevronRight, Zap, TrendingUp, Sparkles,
  RefreshCw, Key, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Minus, Globe, Clock, Tag, Activity, Cpu, Settings, BarChart2, Brain
} from 'lucide-react';

import AppLayout from '@/components/AppLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/* 🔸 NEW — import the Financial Statements page */
import FinancialStatements from '@/pages/FinancialStatements';

/* ───────────── Financial Concepts Dictionary (35+) ───────────── */
const CONCEPTS = {
  MBO: {
    name: 'MBO', full: 'Management Buyout',
    definition: 'A transaction where the existing management team acquires a controlling equity stake, typically using external financing.',
    signal: ['Management believes the company is undervalued', 'Likely to delist from exchange', 'Usually short-term bullish for share price'],
    aliases: ['management buyout', 'management-led buyout', 'management bid']
  },
  LBO: {
    name: 'LBO', full: 'Leveraged Buyout',
    definition: 'An acquisition funded primarily with borrowed money, using the target company\'s assets or cash flows as collateral.',
    signal: ['High debt load increases financial risk', 'Often leads to cost-cutting and restructuring', 'Can signal private equity interest in the sector'],
    aliases: ['leveraged buyout', 'leveraged acquisition', 'debt-funded acquisition']
  },
  IPO: {
    name: 'IPO', full: 'Initial Public Offering',
    definition: 'The first time a private company sells shares to the public on a stock exchange.',
    signal: ['Company seeking growth capital', 'Increased public scrutiny and transparency', 'Often indicates strong market confidence'],
    aliases: ['initial public offering', 'public debut', 'going public', 'stock market debut', 'public listing']
  },
  SPAC: {
    name: 'SPAC', full: 'Special Purpose Acquisition Company',
    definition: 'A shell company formed to raise capital through an IPO to acquire an existing company. Also called a "blank check company".',
    signal: ['Alternative path to going public', 'May indicate weaker fundamentals than traditional IPO', 'Watch for redemption rates and sponsor dilution'],
    aliases: ['spac', 'special purpose acquisition', 'blank check company', 'blank-check']
  },
  SHORT_SELLING: {
    name: 'Short Selling', full: 'Short Selling / Short Interest',
    definition: 'Borrowing shares to sell them, betting the price will fall so you can buy them back cheaper and pocket the difference.',
    signal: ['Bearish conviction from sophisticated investors', 'Can trigger short squeezes if price rises', 'High short interest signals controversy about valuation'],
    aliases: ['short selling', 'short seller', 'short interest', 'shorting', 'short position', 'bearish bet', 'short squeeze']
  },
  MERGER: {
    name: 'M&A', full: 'Merger & Acquisition',
    definition: 'The consolidation of companies through various financial transactions including mergers, acquisitions, and takeovers.',
    signal: ['Industry consolidation trend — fewer competitors', 'Premium typically paid over market price (20-40%)', 'Regulatory approval risk can delay or block deals'],
    aliases: ['merger', 'acquisition', 'takeover', 'buyout', 'deal', 'm&a', 'consolidation', 'takeover bid', 'hostile takeover', 'friendly merger']
  },
  DIVIDEND: {
    name: 'Dividend', full: 'Dividend Distribution',
    definition: 'A payment made by a corporation to its shareholders from profits or reserves, usually on a quarterly basis.',
    signal: ['Sign of financial health and stable cash flows', 'Attractive to income-focused investors', 'Dividend cuts are a major red flag — signals financial distress'],
    aliases: ['dividend', 'dividend yield', 'payout', 'distribution', 'special dividend', 'dividend cut', 'dividend increase', 'ex-dividend']
  },
  STOCK_BUYBACK: {
    name: 'Buyback', full: 'Share Repurchase Program',
    definition: 'When a company purchases its own shares from the open market, reducing the number of outstanding shares and increasing ownership concentration.',
    signal: ['Management believes shares are undervalued', 'Increases earnings per share (EPS) mechanically', 'Alternative to dividends for returning capital — more tax-efficient'],
    aliases: ['buyback', 'share repurchase', 'stock repurchase', 'repurchase program', 'share buyback']
  },
  BOND_YIELD: {
    name: 'Bond Yield', full: 'Bond Yield & Treasury Rates',
    definition: 'The return an investor realizes on a bond. Treasury yields serve as the benchmark "risk-free" rate for all financial assets.',
    signal: ['Rising yields make stocks less attractive (higher discount rate)', 'Inverted yield curve (short > long) historically predicts recession', 'Falling yields signal flight to safety — investors are worried'],
    aliases: ['bond yield', 'treasury yield', 'yield curve', 'bond rate', '10-year yield', 'government bond', 'treasury rate', 'bond market', 'yield inversion']
  },
  EARNINGS: {
    name: 'Earnings', full: 'Earnings Report / Quarterly Results',
    definition: 'A quarterly or annual report showing a company\'s revenue, expenses, and profit. The most important regular event for any public stock.',
    signal: ['Beat or miss versus analyst expectations drives price', 'Forward guidance often more important than past results', 'Watch revenue growth vs cost-cutting profits — quality matters'],
    aliases: ['earnings', 'earnings report', 'quarterly results', 'profit report', 'revenue', 'earnings beat', 'earnings miss', 'guidance', 'quarterly earnings', 'annual results', 'profit warning', 'earnings surprise']
  },
  INFLATION: {
    name: 'Inflation', full: 'Inflation / Consumer Price Index',
    definition: 'The rate at which the general level of prices for goods and services is rising, eroding purchasing power over time.',
    signal: ['Central banks raise interest rates to fight inflation', 'Erodes purchasing power — hurts consumers and bondholders', 'Benefits borrowers (repay with cheaper dollars) and hard asset owners'],
    aliases: ['inflation', 'cpi', 'consumer price index', 'price growth', 'inflationary', 'deflation', 'disinflation', 'core inflation', 'pce', 'price index']
  },
  INTEREST_RATE: {
    name: 'Interest Rate', full: 'Interest Rate / Monetary Policy',
    definition: 'The rate charged by central banks for lending to commercial banks, which cascades through the entire economy affecting mortgages, loans, and asset prices.',
    signal: ['Rate hikes cool economy and pressure stock valuations', 'Rate cuts stimulate borrowing and spending — usually bullish for stocks', 'Forward guidance on rates often moves markets more than actual changes'],
    aliases: ['interest rate', 'rate hike', 'rate cut', 'fed rate', 'federal reserve', 'monetary policy', 'basis points', 'central bank', 'fed funds', 'policy rate', 'benchmark rate', 'rate decision', 'hawkish', 'dovish']
  },
  ETF: {
    name: 'ETF', full: 'Exchange-Traded Fund',
    definition: 'A basket of securities that trades on an exchange like a single stock, offering diversified exposure to sectors, indices, or themes.',
    signal: ['Large inflows signal sector popularity and momentum', 'New ETF launches indicate emerging investment themes', 'Liquidity and low fees attract institutional capital at scale'],
    aliases: ['etf', 'exchange-traded fund', 'index fund', 'fund flow', 'passive investing', 'etf inflow', 'etf outflow']
  },
  PE_RATIO: {
    name: 'P/E Ratio', full: 'Price-to-Earnings Ratio',
    definition: 'Stock price divided by earnings per share. The most common valuation metric — tells you how much investors pay per dollar of profit.',
    signal: ['High P/E = investors expect high growth (or stock is overvalued)', 'Low P/E = bargain or the market expects declining profits', 'Compare to sector average — a P/E of 30 is cheap for tech but expensive for utilities'],
    aliases: ['p/e ratio', 'pe ratio', 'price-to-earnings', 'price to earnings', 'earnings multiple', 'trading at', 'times earnings', 'forward pe', 'trailing pe', 'valuation multiple']
  },
  MARKET_CAP: {
    name: 'Market Cap', full: 'Market Capitalization',
    definition: 'The total market value of a company\'s outstanding shares. Calculated as share price × total shares. Defines whether a company is small-cap, mid-cap, or large-cap.',
    signal: ['Large-cap ($10B+) = more stable, less growth potential', 'Small-cap (<$2B) = higher risk, higher potential return', 'Market cap changes reflect investor sentiment, not business fundamentals directly'],
    aliases: ['market cap', 'market capitalization', 'market value', 'valuation', 'billion-dollar', 'trillion-dollar', 'mega-cap', 'large-cap', 'small-cap', 'mid-cap']
  },
  BULL_BEAR: {
    name: 'Bull / Bear', full: 'Bull Market & Bear Market',
    definition: 'A bull market is a sustained period of rising prices (typically 20%+ gain). A bear market is a sustained decline (20%+ drop from peak).',
    signal: ['Bull markets driven by optimism, growth, and easy money', 'Bear markets driven by fear, recession risk, and tightening', 'Most money is lost not in bear markets, but in trying to time them'],
    aliases: ['bull market', 'bear market', 'bullish', 'bearish', 'bull run', 'bear territory', 'market rally', 'market crash', 'market downturn', 'market surge', 'sell-off', 'selloff', 'correction']
  },
  HEDGE_FUND: {
    name: 'Hedge Fund', full: 'Hedge Fund',
    definition: 'A private investment fund that uses aggressive strategies (leverage, short selling, derivatives) to generate returns. Only available to accredited investors.',
    signal: ['Hedge fund buying = smart money validation', 'Activist hedge funds push for changes that can unlock value', 'Hedge fund crowding in a stock increases crash risk'],
    aliases: ['hedge fund', 'hedgefund', 'activist investor', 'institutional investor', 'smart money', 'fund manager', 'asset manager', 'hedge fund manager']
  },
  OPTIONS: {
    name: 'Options', full: 'Options & Derivatives',
    definition: 'Contracts giving the right (not obligation) to buy (call) or sell (put) an asset at a set price before expiration. Used for hedging and speculation.',
    signal: ['Heavy call buying = bullish bets from sophisticated traders', 'Heavy put buying = hedging or bearish bets', 'Options expiration dates can cause unusual stock price movements'],
    aliases: ['options', 'call option', 'put option', 'derivatives', 'options trading', 'strike price', 'expiration', 'options contract', 'implied volatility', 'options market']
  },
  RECESSION: {
    name: 'Recession', full: 'Economic Recession',
    definition: 'Two consecutive quarters of declining GDP. Characterized by rising unemployment, falling consumer spending, and declining corporate profits.',
    signal: ['Stocks typically fall 20-40% during recessions', 'Defensive sectors (utilities, healthcare, staples) outperform', 'Recessions create buying opportunities — markets recover before economies do'],
    aliases: ['recession', 'economic downturn', 'economic contraction', 'recessionary', 'economic slowdown', 'hard landing', 'soft landing', 'economic decline']
  },
  GDP: {
    name: 'GDP', full: 'Gross Domestic Product',
    definition: 'The total value of all goods and services produced in a country. The broadest measure of economic health and growth.',
    signal: ['GDP growth > 3% = strong economy, good for corporate profits', 'GDP growth < 1% = weakness, potential recession ahead', 'GDP surprises (vs expectations) move markets more than absolute numbers'],
    aliases: ['gdp', 'gross domestic product', 'economic growth', 'economic output', 'gdp growth', 'gdp report']
  },
  VOLATILITY: {
    name: 'Volatility', full: 'Volatility / VIX',
    definition: 'A measure of how much prices fluctuate. The VIX index (fear gauge) measures expected S&P 500 volatility over 30 days.',
    signal: ['VIX above 30 = high fear, potential buying opportunity', 'VIX below 15 = complacency, potential for surprise shocks', 'Volatility spikes at market bottoms, falls during rallies'],
    aliases: ['volatility', 'vix', 'fear index', 'fear gauge', 'volatile', 'market volatility', 'implied volatility', 'turbulence', 'market turbulence', 'whipsaw']
  },
  STOCK_SPLIT: {
    name: 'Stock Split', full: 'Stock Split / Reverse Split',
    definition: 'Dividing existing shares into more shares (e.g., 4-for-1) to lower the price per share. Does not change the company\'s value.',
    signal: ['Forward splits signal confidence — stock price has risen significantly', 'Makes shares more accessible to retail investors', 'Reverse splits (combining shares) often signal distress — avoiding delisting'],
    aliases: ['stock split', 'share split', 'reverse split', 'split ratio', 'forward split']
  },
  INSIDER_TRADING: {
    name: 'Insider Activity', full: 'Insider Buying & Selling',
    definition: 'When company executives, directors, or major shareholders buy or sell their own company\'s stock. Legal when reported, illegal when based on non-public information.',
    signal: ['Insider buying is a strong bullish signal — they know the business best', 'Insider selling is less meaningful — could be diversification or taxes', 'Cluster insider buying (multiple executives) is especially bullish'],
    aliases: ['insider trading', 'insider buying', 'insider selling', 'insider transaction', 'insider activity', 'executive purchase', 'director buying', 'sec filing', '10b5']
  },
  BANKRUPTCY: {
    name: 'Bankruptcy', full: 'Bankruptcy / Chapter 11',
    definition: 'Legal process when a company cannot pay its debts. Chapter 11 allows reorganization; Chapter 7 means liquidation. Shareholders usually lose everything.',
    signal: ['Shareholders typically wiped out — equity goes to zero', 'Bondholders may recover partial value depending on seniority', 'Chapter 11 can create opportunities if company successfully restructures'],
    aliases: ['bankruptcy', 'chapter 11', 'chapter 7', 'insolvency', 'insolvent', 'creditor protection', 'debt restructuring', 'default', 'filing for bankruptcy', 'bankrupt']
  },
  CREDIT_RATING: {
    name: 'Credit Rating', full: 'Credit Rating / Downgrade',
    definition: 'Assessment of creditworthiness by agencies (S&P, Moody\'s, Fitch). Ratings range from AAA (safest) to D (default). Affects borrowing costs.',
    signal: ['Downgrades increase borrowing costs and signal deterioration', 'Upgrades reduce costs and signal improvement', 'A downgrade to "junk" status forces many funds to sell — price crash'],
    aliases: ['credit rating', 'credit downgrade', 'credit upgrade', 'rating agency', 'moody', 'fitch', 'standard & poor', 's&p rating', 'investment grade', 'junk bond', 'junk status', 'high yield', 'credit outlook']
  },
  PRIVATE_EQUITY: {
    name: 'Private Equity', full: 'Private Equity (PE)',
    definition: 'Investment firms that buy companies (often using debt), restructure them, and sell for profit. Typical holding period is 3-7 years.',
    signal: ['PE acquisition usually offers premium to market price', 'Targets companies with stable cash flows and improvement potential', 'Heavy debt loading can stress the acquired company'],
    aliases: ['private equity', 'pe firm', 'buyout firm', 'pe fund', 'private equity fund', 'pe-backed', 'financial sponsor', 'pe acquisition']
  },
  VENTURE_CAPITAL: {
    name: 'Venture Capital', full: 'Venture Capital (VC)',
    definition: 'Funding provided to early-stage, high-potential startups in exchange for equity. VCs expect most investments to fail but a few to return 10-100x.',
    signal: ['Large funding rounds signal confidence in growth potential', 'Down rounds (lower valuation) signal trouble', 'VC-backed IPOs draw attention but may be unprofitable'],
    aliases: ['venture capital', 'vc funding', 'series a', 'series b', 'series c', 'funding round', 'startup funding', 'seed round', 'venture-backed', 'vc-backed', 'venture capitalist']
  },
  ESG: {
    name: 'ESG', full: 'Environmental, Social & Governance',
    definition: 'A framework for evaluating companies on environmental impact, social responsibility, and corporate governance practices.',
    signal: ['High ESG scores attract institutional capital — growing mandates', 'ESG controversies can trigger fund selling and reputational damage', 'Regulatory push for ESG disclosure creates compliance costs and opportunities'],
    aliases: ['esg', 'environmental social governance', 'sustainable investing', 'green bond', 'carbon neutral', 'net zero', 'climate risk', 'sustainability', 'responsible investing', 'impact investing']
  },
  QE: {
    name: 'QE', full: 'Quantitative Easing / Tightening',
    definition: 'Central bank buying (QE) or selling (QT) government bonds to inject or drain money from the financial system.',
    signal: ['QE floods system with liquidity — pushes asset prices up', 'QT drains liquidity — creates headwinds for stocks and bonds', 'QE is essentially money printing — weakens currency, helps exporters'],
    aliases: ['quantitative easing', 'quantitative tightening', 'qe', 'qt', 'bond buying', 'asset purchase', 'balance sheet', 'tapering', 'taper', 'money printing', 'fed balance sheet']
  },
  FOREX: {
    name: 'Forex', full: 'Foreign Exchange / Currency',
    definition: 'The global market for trading currencies. Exchange rates affect international trade, corporate profits, and investment returns.',
    signal: ['Strong dollar hurts US exporters but helps importers', 'Currency weakness signals economic trouble or loose monetary policy', 'Currency wars: countries devalue to boost exports competitively'],
    aliases: ['forex', 'foreign exchange', 'currency', 'exchange rate', 'dollar strength', 'dollar weakness', 'strong dollar', 'weak dollar', 'currency devaluation', 'yuan', 'euro', 'yen', 'pound', 'fx market']
  },
  COMMODITIES: {
    name: 'Commodities', full: 'Commodities Market',
    definition: 'Raw materials traded on exchanges: oil, gold, copper, wheat, etc. Prices reflect supply/demand and serve as economic indicators.',
    signal: ['Rising oil = inflationary pressure, hurts consumers', 'Rising gold = fear and inflation hedge demand', 'Rising copper ("Dr. Copper") = economic optimism, industrial demand'],
    aliases: ['commodity', 'commodities', 'oil price', 'gold price', 'crude oil', 'natural gas', 'copper', 'precious metals', 'raw materials', 'brent', 'wti', 'opec']
  },
  MARGIN: {
    name: 'Margin', full: 'Margin Trading / Margin Call',
    definition: 'Borrowing money from your broker to buy securities. Amplifies both gains and losses. A margin call forces you to add funds or sell positions.',
    signal: ['Rising margin debt signals aggressive speculation — late-cycle warning', 'Margin calls force selling — can cascade into market crashes', 'Margin levels at record highs preceded 2000, 2008, and 2021 selloffs'],
    aliases: ['margin', 'margin call', 'margin trading', 'margin debt', 'leverage', 'leveraged position', 'margin requirement', 'forced selling', 'deleveraging']
  },
  ANALYST_RATING: {
    name: 'Analyst Rating', full: 'Analyst Upgrades & Downgrades',
    definition: 'Wall Street analysts publish buy/sell/hold ratings and price targets for stocks. Changes in ratings often move stock prices.',
    signal: ['Upgrades often cause short-term price pops', 'Downgrades cause drops — especially from respected analysts', 'Consensus price targets give a range of expected value — but are often wrong'],
    aliases: ['analyst', 'upgrade', 'downgrade', 'price target', 'buy rating', 'sell rating', 'hold rating', 'overweight', 'underweight', 'outperform', 'underperform', 'wall street', 'analyst consensus']
  },
  DEBT_CEILING: {
    name: 'Debt Ceiling', full: 'US Debt Ceiling',
    definition: 'The legal limit on how much the US government can borrow. Periodic political fights over raising it create market anxiety.',
    signal: ['Debt ceiling crises create uncertainty and volatility spikes', 'US default would be catastrophic — never actually happened', 'Market typically recovers quickly once resolved — buy the fear'],
    aliases: ['debt ceiling', 'debt limit', 'government shutdown', 'fiscal cliff', 'government default', 'treasury default', 'debt crisis']
  },
  REGULATION: {
    name: 'Regulation', full: 'Government Regulation & Antitrust',
    definition: 'Government rules affecting business operations. Antitrust actions prevent monopolies. Regulatory changes create winners and losers across sectors.',
    signal: ['New regulations increase compliance costs — hurts smaller players more', 'Antitrust actions can force break-ups or block mergers', 'Deregulation benefits incumbents — can trigger sector rallies'],
    aliases: ['regulation', 'regulatory', 'antitrust', 'sec', 'ftc', 'regulator', 'compliance', 'deregulation', 'sanctions', 'trade war', 'tariff', 'trade policy', 'ban', 'crackdown', 'probe', 'investigation', 'fine', 'penalty', 'lawsuit']
  },
  CRYPTO: {
    name: 'Crypto', full: 'Cryptocurrency & Digital Assets',
    definition: 'Decentralized digital currencies (Bitcoin, Ethereum) and related technologies (blockchain, DeFi, NFTs). Highly volatile and speculative.',
    signal: ['Crypto rallies often coincide with risk-on sentiment in stocks', 'Regulatory crackdowns create sharp selloffs', 'Institutional adoption (ETFs, corporate treasury) adds legitimacy but also volatility'],
    aliases: ['crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'blockchain', 'digital asset', 'digital currency', 'defi', 'web3', 'token', 'stablecoin', 'crypto exchange', 'mining']
  },
  LAYOFF: {
    name: 'Layoffs', full: 'Layoffs & Restructuring',
    definition: 'When companies reduce their workforce to cut costs. Can signal trouble or strategic restructuring to improve profitability.',
    signal: ['Layoffs often boost stock price short-term — lower costs = higher margins', 'Mass layoffs across a sector signal industry-wide slowdown', 'Restructuring charges are one-time — look through them to underlying trends'],
    aliases: ['layoff', 'layoffs', 'job cuts', 'workforce reduction', 'restructuring', 'downsizing', 'headcount reduction', 'cost-cutting', 'redundancies', 'firing', 'let go', 'staff reduction']
  }
};

/* ───────────── Demo News (fallback when no API key) ───────────── */
const DEMO_NEWS = [
  {
    title: "Tech Giant Announces $5B Share Buyback Program Amid Strong Earnings",
    summary: "Following quarterly earnings that beat analyst expectations by 15%, the company announced a massive share repurchase program, signaling management confidence in future growth. Revenue grew 22% year-over-year while maintaining healthy profit margins. The P/E ratio remains below the sector average, suggesting the stock may still be undervalued despite the rally.",
    source: "DEMO DATA",
    date: "2025-04-01T10:00:00Z",
    url: "#",
    sentiment: "Bullish",
    sentimentScore: 0.85,
    topics: ["Earnings", "Technology"]
  },
  {
    title: "Federal Reserve Signals Potential Rate Cut Amid Cooling Inflation",
    summary: "The central bank indicated that falling consumer price index data may warrant a shift in monetary policy. Bond yields dropped sharply as markets priced in two rate cuts by year-end, with the 10-year treasury yield falling 15 basis points. The dovish tone boosted both stocks and commodities, while the dollar weakened against major currencies.",
    source: "DEMO DATA",
    date: "2025-04-01T08:30:00Z",
    url: "#",
    sentiment: "Bullish",
    sentimentScore: 0.65,
    topics: ["Economy", "Federal Reserve"]
  },
  {
    title: "Major Pharmaceutical Merger Creates $80B Healthcare Giant",
    summary: "The acquisition, valued at a 35% premium to the target's closing price, will consolidate two leading drug makers. Regulators are expected to scrutinize the deal for antitrust concerns, particularly in the oncology treatment space. Hedge fund activists had been pushing for the deal, citing the company's undervaluation relative to its P/E ratio and strong pipeline.",
    source: "DEMO DATA",
    date: "2025-03-31T14:00:00Z",
    url: "#",
    sentiment: "Neutral",
    sentimentScore: 0.1,
    topics: ["Healthcare", "M&A"]
  },
  {
    title: "Electric Vehicle Startup Files for IPO Targeting $2B Valuation",
    summary: "The venture-backed company plans its stock market debut on NASDAQ next month, seeking to raise $400M to fund factory expansion. Short sellers have already expressed skepticism about the company's path to profitability given increasing competition. The IPO comes amid volatile market conditions, with the VIX fear gauge elevated above 25.",
    source: "DEMO DATA",
    date: "2025-03-31T11:00:00Z",
    url: "#",
    sentiment: "Somewhat-Bullish",
    sentimentScore: 0.35,
    topics: ["IPO", "Automotive"]
  },
  {
    title: "Retail Chain Cuts Dividend as Consumer Spending Weakens",
    summary: "The company reduced its quarterly dividend by 40%, citing declining revenue and rising inventory costs. The stock fell 12% in after-hours trading as income-focused investors exited positions. Analysts downgraded the stock to underperform, lowering price targets by an average of 25%. The move signals growing recession fears in the consumer discretionary sector.",
    source: "DEMO DATA",
    date: "2025-03-30T16:00:00Z",
    url: "#",
    sentiment: "Bearish",
    sentimentScore: -0.72,
    topics: ["Retail", "Dividend"]
  },
  {
    title: "Private Equity Firm Launches Hostile Takeover Bid for Software Company",
    summary: "The leveraged buyout offer values the target at $15B, representing a 28% premium. The PE firm plans to fund the acquisition primarily through debt, using the company's strong cash flows as collateral. The board has adopted a poison pill defense while insider buying from several directors suggests they believe the offer undervalues the company.",
    source: "DEMO DATA",
    date: "2025-03-30T09:00:00Z",
    url: "#",
    sentiment: "Somewhat-Bullish",
    sentimentScore: 0.45,
    topics: ["Technology", "M&A"]
  },
  {
    title: "Crypto Markets Surge as SEC Approves New Bitcoin ETF Products",
    summary: "Bitcoin rallied 15% following regulatory approval of three new exchange-traded fund products, opening the door to broader institutional adoption. Trading volumes hit record levels as margin debt in crypto markets expanded significantly. However, critics warn that leverage and volatility remain key risks for retail investors entering at elevated prices.",
    source: "DEMO DATA",
    date: "2025-03-29T13:00:00Z",
    url: "#",
    sentiment: "Bullish",
    sentimentScore: 0.60,
    topics: ["Crypto", "Regulation"]
  },
  {
    title: "Tech Sector Layoffs Accelerate as Companies Focus on AI Restructuring",
    summary: "Over 30,000 jobs have been cut across major technology firms this quarter as companies restructure to prioritize artificial intelligence investments. Despite the workforce reductions, stock prices have generally risen as Wall Street analysts upgrade ratings on improved margin expectations. The layoffs raise concerns about a broader economic slowdown even as GDP growth remains positive.",
    source: "DEMO DATA",
    date: "2025-03-29T07:00:00Z",
    url: "#",
    sentiment: "Neutral",
    sentimentScore: 0.05,
    topics: ["Technology", "Economy"]
  }
];

/* ───────────── Concept Detection Engine ───────────── */
function detectConcepts(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [key, concept] of Object.entries(CONCEPTS)) {
    for (const alias of concept.aliases) {
      if (lower.includes(alias)) {
        found.push({ key, ...concept });
        break;
      }
    }
  }
  return found;
}

/* ───────────── In-Text Highlighting Engine ───────────── */
function highlightConcepts(text, onClickConcept) {
  const parts = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliestIndex = remaining.length;
    let earliestMatch = null;
    let matchedConcept = null;

    for (const [key, concept] of Object.entries(CONCEPTS)) {
      for (const alias of concept.aliases) {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?:^|[\\s,;.!?("'])${escaped}(?=[\\s,;.!?)"']|$)`, 'i');
        const match = remaining.match(regex);
        if (match) {
          const wsLen = match[0].length - alias.length;
          const realIndex = match.index + wsLen;
          if (realIndex < earliestIndex || (realIndex === earliestIndex && alias.length > (earliestMatch || '').length)) {
            earliestIndex = realIndex;
            earliestMatch = remaining.substring(realIndex, realIndex + alias.length);
            matchedConcept = { key, ...concept };
          }
        }
      }
    }

    if (earliestMatch && matchedConcept) {
      if (earliestIndex > 0) {
        parts.push(remaining.substring(0, earliestIndex));
      }
      const concept = matchedConcept;
      const matched = earliestMatch;
      parts.push(
        <button
          key={`hl-${parts.length}`}
          onClick={(e) => { e.stopPropagation(); onClickConcept(concept); }}
          className="text-amber-700 font-semibold bg-amber-50 hover:bg-amber-100 underline decoration-amber-300 underline-offset-2 transition cursor-pointer rounded px-0.5 -mx-0.5"
          title={`📖 Click to learn: ${concept.full}`}
        >
          {matched}
        </button>
      );
      remaining = remaining.substring(earliestIndex + matched.length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return parts;
}

/* ───────────── Sentiment Helpers ───────────── */
function getSentimentColor(label) {
  const map = {
    'Bullish': 'text-emerald-700', 'Somewhat-Bullish': 'text-emerald-600',
    'Neutral': 'text-muted-foreground', 'Somewhat-Bearish': 'text-orange-600', 'Bearish': 'text-red-600'
  };
  return map[label] || 'text-muted-foreground';
}

function getSentimentBg(label) {
  const map = {
    'Bullish': 'bg-emerald-50 border-emerald-200',
    'Somewhat-Bullish': 'bg-emerald-50 border-emerald-100',
    'Neutral': 'bg-background border-border',
    'Somewhat-Bearish': 'bg-orange-50 border-orange-200',
    'Bearish': 'bg-red-50 border-red-200'
  };
  return map[label] || 'bg-background border-border';
}

function SentimentIcon({ label }) {
  if (label === 'Bullish' || label === 'Somewhat-Bullish') return <ArrowUpRight className="w-4 h-4" />;
  if (label === 'Bearish' || label === 'Somewhat-Bearish') return <ArrowDownRight className="w-4 h-4" />;
  return <Minus className="w-4 h-4" />;
}

/* ───────────── Main App Component ───────────── */
export default function FinSignal() {
  const [articles, setArticles] = useState(DEMO_NEWS);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avKey, setAvKey] = useState(import.meta.env.VITE_ALPHAVANTAGE_KEY || '');
  // DeepSeek key from env
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [view, setView] = useState('news');
  const [showSettings, setShowSettings] = useState(false);
  const [llmResults, setLlmResults] = useState({});
  const [llmLoading, setLlmLoading] = useState({});
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [searchTopic, setSearchTopic] = useState('');

  /* ── Fetch Real News ── */
  const fetchNews = useCallback(async () => {
    if (!avKey.trim()) { setError('Please enter your Alpha Vantage API key in Settings'); return; }
    setLoading(true); setError('');
    try {
      const topicParam = searchTopic.trim() ? `&topics=${encodeURIComponent(searchTopic.trim())}` : '';
      const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT${topicParam}&apikey=${avKey.trim()}&limit=20`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.Information) { setError('API limit reached. Try again in 1 minute.'); setLoading(false); return; }
      if (!data.feed || data.feed.length === 0) { setError('No articles returned. Try a different topic.'); setLoading(false); return; }
      const mapped = data.feed.map(a => ({
        title: a.title,
        summary: a.summary,
        source: a.source,
        date: a.time_published,
        url: a.url,
        sentiment: a.overall_sentiment_label || 'Neutral',
        sentimentScore: parseFloat(a.overall_sentiment_score) || 0,
        topics: (a.topics || []).map(t => t.topic)
      }));
      setArticles(mapped);
      setIsLive(true);
      setLlmResults({});
    } catch (e) {
      setError('Failed to fetch news. Check your API key and connection.');
    }
    setLoading(false);
  }, [avKey, searchTopic]);

  /* ── LLM Analysis ── */
  const analyzeLLM = useCallback(async (index) => {
    if (llmResults[index]) { setExpandedArticle(expandedArticle === index ? null : index); return; }
    setLlmLoading(p => ({ ...p, [index]: true }));
    setExpandedArticle(index);
    try {
      const article = articles[index];
      const { data, error: fnError } = await supabase.functions.invoke('deepseek-proxy', {
        body: {
          title: article.title,
          summary: article.summary,
          sentiment: article.sentiment,
          sentimentScore: article.sentimentScore,
        },
      });
      if (fnError) { setError(`Analysis error: ${fnError.message}`); }
      else if (data?.error) { setError(`Analysis error: ${data.error}`); }
      else { setLlmResults(p => ({ ...p, [index]: data.analysis })); }
    } catch (e) {
      setError('Failed to analyze article. Please try again.');
    }
    setLlmLoading(p => ({ ...p, [index]: false }));
  }, [articles, llmResults, expandedArticle]);

  /* ── Analytics Data ── */
  const analytics = useMemo(() => {
    const sentimentCounts = {};
    let totalScore = 0;
    const conceptCounts = {};

    articles.forEach(a => {
      sentimentCounts[a.sentiment] = (sentimentCounts[a.sentiment] || 0) + 1;
      totalScore += a.sentimentScore;
      const concepts = detectConcepts(a.title + ' ' + a.summary);
      concepts.forEach(c => { conceptCounts[c.name] = (conceptCounts[c.name] || 0) + 1; });
    });

    const sentimentData = Object.entries(sentimentCounts).map(([name, value]) => ({ name, value }));
    const conceptData = Object.entries(conceptCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    const avgScore = articles.length ? totalScore / articles.length : 0;
    const totalConcepts = Object.values(conceptCounts).reduce((s, c) => s + c, 0);

    return { sentimentData, conceptData, avgScore, totalConcepts };
  }, [articles]);

  const CHART_COLORS = ['#10b981', '#34d399', '#6b7280', '#f97316', '#ef4444'];

  /* ── UI ── */
  return (
    <AppLayout><div className="bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">FinSignal</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Financial News Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={isLive ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-amber-300 bg-amber-50 text-amber-700'}>
              {isLive ? '● LIVE' : '● DEMO'}
            </Badge>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="hidden">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Search & Fetch Bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-center">
            <Input value={searchTopic} onChange={e => setSearchTopic(e.target.value)} placeholder="Filter by topic (e.g. technology, finance, earnings)" className="flex-1" />
            <Button onClick={fetchNews} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Fetching...' : 'Fetch News'}
            </Button>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>
      </div>

      {/* Tabs + Main Content */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-6">
        <Tabs value={view} onValueChange={setView}>
          <TabsList>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Globe className="w-4 h-4" /> News Feed
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="concepts" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Concept Library
            </TabsTrigger>
            {/* 🔸 NEW — Financial Statements tab trigger */}
            <TabsTrigger value="statements" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Financial Statements
            </TabsTrigger>
          </TabsList>

          {/* ════════ NEWS VIEW ════════ */}
          <TabsContent value="news" className="mt-6 space-y-4">
            {!isLive && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-medium">Demo Mode — Showing sample data</p>
                  <p className="text-amber-600 mt-1">Click "Fetch News" to load real-time news. <strong className="text-amber-800">Highlighted words</strong> in articles are financial concepts — click them to learn what they mean!</p>
                </div>
              </div>
            )}

            {articles.map((article, i) => {
              const concepts = detectConcepts(article.title + ' ' + article.summary);
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card>
                    <CardContent className="p-5">
                      {/* Source + Date + Sentiment */}
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {article.source}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(article.date).toLocaleDateString()}</span>
                        </div>
                        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border ${getSentimentBg(article.sentiment)} ${getSentimentColor(article.sentiment)}`}>
                          <SentimentIcon label={article.sentiment} /> {article.sentiment} ({article.sentimentScore > 0 ? '+' : ''}{article.sentimentScore.toFixed(2)})
                        </div>
                      </div>

                      {/* Title with highlights */}
                      <h3 className="text-base font-semibold mb-2 leading-snug text-foreground">
                        {article.url !== '#' ? (
                          <a href={article.url} target="_blank" rel="noreferrer" className="hover:text-blue-600 transition">
                            {highlightConcepts(article.title, setSelectedConcept)}
                          </a>
                        ) : highlightConcepts(article.title, setSelectedConcept)}
                      </h3>

                      {/* Summary with highlights */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {highlightConcepts(article.summary, setSelectedConcept)}
                      </p>

                      {/* Topics */}
                      {article.topics && article.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {article.topics.map((t, ti) => (
                            <Badge key={ti} variant="secondary" className="text-xs font-normal">
                              <Tag className="w-3 h-3 mr-1" /> {t}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Detected Concepts Summary */}
                      {concepts.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> {concepts.length} Financial Concept{concepts.length > 1 ? 's' : ''} Detected — click highlighted text above or buttons below to learn:</p>
                          <div className="flex flex-wrap gap-2">
                            {concepts.map((c, ci) => (
                              <Button key={ci} variant="outline" size="sm" onClick={() => setSelectedConcept(c)}
                                className="text-xs h-auto py-1.5 px-3 text-blue-600 border-blue-200 hover:bg-blue-50">
                                <BookOpen className="w-3 h-3 mr-1" /> {c.name} <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* LLM Analysis Button */}
                      <Button variant="outline" size="sm" onClick={() => analyzeLLM(i)}
                        className="text-xs h-auto py-1.5 px-3 text-purple-600 border-purple-200 hover:bg-purple-50">
                        <Cpu className="w-3 h-3 mr-1" />
                        {llmLoading[i] ? 'Analyzing...' : llmResults[i] ? (expandedArticle === i ? 'Hide AI Analysis' : 'Show AI Analysis') : 'AI Deep Analysis'}
                      </Button>

                      {/* LLM Result */}
                      <AnimatePresence>
                        {expandedArticle === i && llmResults[i] && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                              <p className="text-xs font-medium text-purple-700 mb-2 flex items-center gap-1"><Brain className="w-3 h-3" /> AI Analysis</p>
                              <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">{llmResults[i]}</div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </TabsContent>

          {/* ════════ ANALYTICS VIEW ════════ */}
          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Articles', value: articles.length, icon: Globe, color: 'text-blue-600' },
                { label: 'Avg Sentiment', value: (analytics.avgScore > 0 ? '+' : '') + analytics.avgScore.toFixed(2), icon: Activity, color: analytics.avgScore > 0 ? 'text-emerald-600' : analytics.avgScore < 0 ? 'text-red-600' : 'text-muted-foreground' },
                { label: 'Concepts Found', value: analytics.totalConcepts, icon: Sparkles, color: 'text-purple-600' },
                { label: 'Density', value: articles.length ? (analytics.totalConcepts / articles.length).toFixed(1) + '/article' : '0', icon: TrendingUp, color: 'text-orange-600' },
              ].map((kpi, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                      <span className="text-xs text-muted-foreground">{kpi.label}</span>
                    </div>
                    <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                    <Activity className="w-4 h-4 text-blue-600" /> Sentiment Distribution
                  </h3>
                  {analytics.sentimentData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={analytics.sentimentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                          {analytics.sentimentData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-sm">No data</p>}
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {analytics.sentimentData.map((s, i) => (
                      <span key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}></span>
                        {s.name} ({s.value})
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-foreground">
                    <Sparkles className="w-4 h-4 text-purple-600" /> Concept Frequency
                  </h3>
                  {analytics.conceptData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analytics.conceptData} layout="vertical" margin={{ left: 80 }}>
                        <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} allowDecimals={false} />
                        <YAxis type="category" dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} width={75} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#1f2937' }} />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-muted-foreground text-sm">No concepts detected</p>}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ════════ CONCEPT LIBRARY VIEW ════════ */}
          <TabsContent value="concepts" className="mt-6">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              <p className="font-medium mb-1">📚 Financial Concept Library — {Object.keys(CONCEPTS).length} concepts</p>
              <p className="text-blue-600">Click any card to learn the definition, what it signals for investors, and how to interpret it when you see it in the news.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(CONCEPTS).map((c, i) => (
                <motion.div key={i} onClick={() => setSelectedConcept(c)}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="cursor-pointer group">
                  <Card className="h-full hover:border-blue-300 hover:shadow-md transition">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-blue-600">{c.name}</h3>
                          <p className="text-xs text-muted-foreground">{c.full}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{c.definition}</p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3" /> {c.signal.length} signal{c.signal.length > 1 ? 's' : ''}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* 🔸 NEW — Financial Statements tab content */}
          <TabsContent value="statements" className="mt-6">
            <FinancialStatements />
          </TabsContent>
        </Tabs>
      </div>

      {/* ════════ Concept Detail Dialog ════════ */}
      <Dialog open={!!selectedConcept} onOpenChange={(open) => { if (!open) setSelectedConcept(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedConcept && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-blue-600">{selectedConcept.name}</DialogTitle>
                <p className="text-sm text-muted-foreground">{selectedConcept.full}</p>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">📖 Definition</h4>
                  <p className="text-sm text-foreground leading-relaxed">{selectedConcept.definition}</p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">⚡ What This Signals for Investors</h4>
                  <div className="space-y-2">
                    {selectedConcept.signal.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-foreground bg-background rounded-lg p-3">
                        <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">🔍 Trigger Words in News</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedConcept.aliases.map((a, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-amber-700 border-amber-200 bg-amber-50">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </AppLayout>
  );
}