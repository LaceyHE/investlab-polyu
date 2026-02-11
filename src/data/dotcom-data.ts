// ============================================================
// Dot-Com Bubble Simulation Data (Jan 1999 – Oct 2002)
// ============================================================

export type Sentiment = 'Optimistic' | 'Euphoria' | 'Concern' | 'Stress' | 'Panic';

export interface StockDef {
  ticker: string;
  name: string;
  sector: 'Established Tech' | 'Internet Leaders' | 'Speculative' | 'Telecom' | 'Defensive';
  startPrice: number;
  peakPrice: number;
  peakMonth: number;
  endPrice: number;
  bankruptMonth?: number;
  hasEarnings: boolean;
  revenueGrowth: string;
  narrativeTag: string;
  volatility: 'Low' | 'Medium' | 'High';
}

export interface DecisionEvent {
  month: number;
  headline: string;
  context: string;
  ticker?: string;
  options: { label: string; action: 'buy_more' | 'hold' | 'reduce' | 'sell_all' | 'cash_all' }[];
}

// ---- 20 stocks ----
export const STOCKS: StockDef[] = [
  // Established Tech
  { ticker: 'MSFT', name: 'Microsoft', sector: 'Established Tech', startPrice: 90, peakPrice: 119, peakMonth: 12, endPrice: 28, hasEarnings: true, revenueGrowth: '+15%', narrativeTag: 'Software Giant', volatility: 'Medium' },
  { ticker: 'INTC', name: 'Intel', sector: 'Established Tech', startPrice: 62, peakPrice: 75, peakMonth: 14, endPrice: 16, hasEarnings: true, revenueGrowth: '+12%', narrativeTag: 'Chipmaker', volatility: 'Medium' },
  { ticker: 'CSCO', name: 'Cisco', sector: 'Established Tech', startPrice: 50, peakPrice: 82, peakMonth: 15, endPrice: 10, hasEarnings: true, revenueGrowth: '+25%', narrativeTag: 'Internet Infrastructure', volatility: 'High' },
  { ticker: 'SUNW', name: 'Sun Microsystems', sector: 'Established Tech', startPrice: 42, peakPrice: 64, peakMonth: 14, endPrice: 4, hasEarnings: true, revenueGrowth: '+20%', narrativeTag: 'Server Dominance', volatility: 'High' },
  { ticker: 'QCOM', name: 'Qualcomm', sector: 'Established Tech', startPrice: 25, peakPrice: 100, peakMonth: 12, endPrice: 15, hasEarnings: true, revenueGrowth: '+30%', narrativeTag: 'Wireless Revolution', volatility: 'High' },
  // Internet Leaders
  { ticker: 'AMZN', name: 'Amazon', sector: 'Internet Leaders', startPrice: 50, peakPrice: 113, peakMonth: 12, endPrice: 18, hasEarnings: false, revenueGrowth: '+80%', narrativeTag: 'E-Commerce Pioneer', volatility: 'High' },
  { ticker: 'YHOO', name: 'Yahoo', sector: 'Internet Leaders', startPrice: 90, peakPrice: 250, peakMonth: 12, endPrice: 10, hasEarnings: false, revenueGrowth: '+60%', narrativeTag: 'Portal Dominance', volatility: 'High' },
  { ticker: 'AOL', name: 'AOL', sector: 'Internet Leaders', startPrice: 70, peakPrice: 95, peakMonth: 12, endPrice: 15, hasEarnings: true, revenueGrowth: '+25%', narrativeTag: 'Online Subscribers', volatility: 'High' },
  { ticker: 'EBAY', name: 'eBay', sector: 'Internet Leaders', startPrice: 35, peakPrice: 80, peakMonth: 14, endPrice: 30, hasEarnings: true, revenueGrowth: '+45%', narrativeTag: 'Auction Marketplace', volatility: 'Medium' },
  // High-Growth Speculative
  { ticker: 'IPET', name: 'Pets.com', sector: 'Speculative', startPrice: 11, peakPrice: 14, peakMonth: 13, endPrice: 0, bankruptMonth: 22, hasEarnings: false, revenueGrowth: '+200%', narrativeTag: 'Online Pet Supplies', volatility: 'High' },
  { ticker: 'WBVN', name: 'Webvan', sector: 'Speculative', startPrice: 15, peakPrice: 24, peakMonth: 12, endPrice: 0, bankruptMonth: 30, hasEarnings: false, revenueGrowth: '+150%', narrativeTag: 'Online Groceries', volatility: 'High' },
  { ticker: 'PCLN', name: 'Priceline', sector: 'Speculative', startPrice: 50, peakPrice: 165, peakMonth: 12, endPrice: 8, hasEarnings: false, revenueGrowth: '+90%', narrativeTag: 'Name Your Price', volatility: 'High' },
  { ticker: 'CMGI', name: 'CMGI', sector: 'Speculative', startPrice: 46, peakPrice: 163, peakMonth: 12, endPrice: 1, hasEarnings: false, revenueGrowth: '+100%', narrativeTag: 'Internet Incubator', volatility: 'High' },
  { ticker: 'JDSU', name: 'JDS Uniphase', sector: 'Speculative', startPrice: 25, peakPrice: 153, peakMonth: 14, endPrice: 3, hasEarnings: false, revenueGrowth: '+70%', narrativeTag: 'Fiber Optics Boom', volatility: 'High' },
  // Telecom
  { ticker: 'LU', name: 'Lucent', sector: 'Telecom', startPrice: 55, peakPrice: 84, peakMonth: 12, endPrice: 2, hasEarnings: true, revenueGrowth: '+10%', narrativeTag: 'Telecom Equipment', volatility: 'High' },
  { ticker: 'NT', name: 'Nortel', sector: 'Telecom', startPrice: 40, peakPrice: 89, peakMonth: 14, endPrice: 1, hasEarnings: true, revenueGrowth: '+15%', narrativeTag: 'Networking Giant', volatility: 'High' },
  // Defensive / Old Economy
  { ticker: 'KO', name: 'Coca-Cola', sector: 'Defensive', startPrice: 67, peakPrice: 67, peakMonth: 0, endPrice: 52, hasEarnings: true, revenueGrowth: '+3%', narrativeTag: 'Consumer Staple', volatility: 'Low' },
  { ticker: 'PG', name: 'Procter & Gamble', sector: 'Defensive', startPrice: 92, peakPrice: 92, peakMonth: 0, endPrice: 88, hasEarnings: true, revenueGrowth: '+4%', narrativeTag: 'Household Brands', volatility: 'Low' },
  { ticker: 'XOM', name: 'Exxon', sector: 'Defensive', startPrice: 36, peakPrice: 45, peakMonth: 30, endPrice: 35, hasEarnings: true, revenueGrowth: '+5%', narrativeTag: 'Energy Major', volatility: 'Low' },
  { ticker: 'WMT', name: 'Walmart', sector: 'Defensive', startPrice: 50, peakPrice: 70, peakMonth: 36, endPrice: 56, hasEarnings: true, revenueGrowth: '+8%', narrativeTag: 'Retail Giant', volatility: 'Low' },
];

// ---- Nasdaq monthly closes (46 months) ----
export const NASDAQ_MONTHLY: number[] = [
  2505, 2288, 2461, 2543, 2471, 2686, 2639, 2739, 2746, 2816, 3336, 4069, // 1999
  3940, 4697, 4572, 3321, 3205, 3966, 3766, 4043, 3672, 3369, 2598, 2470, // 2000
  2772, 2151, 1840, 2116, 2110, 2160, 1876, 1805, 1498, 1690, 1930, 1950, // 2001
  1934, 1731, 1845, 1688, 1615, 1463, 1328, 1314, 1172, 1329,             // 2002 (Jan-Oct)
];

// ---- Tech average P/E ----
export const TECH_PE: number[] = [
  45, 42, 48, 50, 52, 55, 58, 60, 62, 65, 70, 75, // 1999
  72, 80, 78, 60, 55, 62, 58, 60, 52, 48, 42, 38, // 2000
  40, 35, 30, 33, 32, 32, 28, 27, 24, 26, 28, 28, // 2001
  27, 24, 25, 23, 22, 20, 19, 18, 17, 18,          // 2002
];

// ---- Sentiment per month ----
export const SENTIMENT: Sentiment[] = [
  'Optimistic','Optimistic','Optimistic','Optimistic','Optimistic','Optimistic',
  'Optimistic','Optimistic','Optimistic','Euphoria','Euphoria','Euphoria',     // 1999
  'Euphoria','Euphoria','Euphoria','Concern','Concern','Concern',
  'Concern','Concern','Concern','Stress','Stress','Stress',                    // 2000
  'Stress','Stress','Panic','Stress','Stress','Stress',
  'Panic','Panic','Panic','Panic','Stress','Stress',                           // 2001
  'Stress','Panic','Stress','Panic','Panic','Panic','Panic','Panic','Panic','Panic', // 2002
];

// ---- Bubble level 0–10 ----
export const BUBBLE_LEVEL: number[] = [
  5, 4.5, 5.5, 6, 6, 6.5, 6.5, 7, 7, 7.5, 8.5, 9.5, // 1999
  9, 10, 9.8, 7, 6.5, 7.5, 7, 7.5, 6.5, 6, 5, 4.5,   // 2000
  5, 4, 3, 3.5, 3.5, 3.5, 2.5, 2, 1.5, 2, 2.5, 2.5,   // 2001
  2.5, 2, 2, 1.5, 1.5, 1, 0.5, 0.5, 0, 0.5,            // 2002
];

// ---- IPO Activity ----
export const IPO_ACTIVITY: string[] = [
  'High','Moderate','High','High','High','High','High','High','Very High','Very High','Extreme','Extreme',
  'Extreme','Extreme','Extreme','Moderate','Moderate','Moderate','Low','Low','Low','Low','Low','Low',
  'Low','Low','Low','Low','Low','Low','Low','Low','Low','Low','Low','Low',
  'Low','Low','Low','Low','Low','Low','Low','Low','Low','Low',
];

// ---- Month labels ----
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTH_LABELS: string[] = Array.from({ length: 46 }, (_, i) => {
  return `${MONTH_NAMES[i % 12]} ${1999 + Math.floor(i / 12)}`;
});

// ---- News headlines (key months, others get generic) ----
const SPECIFIC_NEWS: Record<number, string[]> = {
  0: ["Amazon expands aggressively despite losses", "Cisco powers the internet backbone", "Online retail seen as the future of commerce"],
  3: ["Internet IPOs surge past expectations", "Qualcomm stock up 400% in 6 months", "Dot-com startups attract record venture funding"],
  6: ["Day trading surges among retail investors", "AOL–Time Warner merger rumors swirl", "Internet advertising revenues double year-over-year"],
  9: ["Nasdaq crosses 2,800 for the first time", "Tech mutual funds see record inflows", "Everyone is getting rich—even your neighbor"],
  11: ["Nasdaq closes year above 4,000", "Y2K fears briefly shake markets", "Analysts predict Nasdaq 6,000 by mid-2000"],
  13: ["Nasdaq hits record high above 5,000", "Pets.com IPO surges 150% on first day", "Analysts raise price targets on tech leaders"],
  14: ["Nasdaq peaks near 5,050—is this the top?", "Warren Buffett called 'out of touch' for avoiding tech", "New IPOs priced at 100x revenue"],
  15: ["Nasdaq plunges 25% from peak in weeks", "Margin calls force retail liquidation", "Is this just a healthy correction?"],
  17: ["Markets stage relief rally—Nasdaq bounces 20%", "Buy the dip mentality returns", "Several dot-coms miss revenue targets quietly"],
  20: ["High-profile IPOs begin to collapse", "Venture funding slows dramatically", "Webvan burns through cash reserves"],
  22: ["Pets.com announces shutdown after burning $300M", "Multiple dot-coms file for bankruptcy", "The 'internet economy' narrative cracks"],
  24: ["AOL–Time Warner merger completed amid losses", "Cisco announces first-ever layoffs", "Tech earnings disappoint across the board"],
  25: ["Nasdaq falls below 2,200—down 55% from peak", "Amazon trades at $12—analysts debate survival", "Internet startups burn through remaining cash"],
  27: ["Brief rally gives false hope", "Fed cuts rates but tech keeps falling", "Bankruptcy filings accelerate"],
  30: ["Lucent restates earnings—accounting scandal", "Webvan shuts down operations", "Enterprise tech spending collapses"],
  32: ["September 11 attacks close markets for days", "Markets reopen to massive selling", "Fear grips all asset classes"],
  35: ["Enron collapse adds to corporate distrust", "Year-end rally fails to materialize", "Nasdaq ends 2001 down 21%"],
  38: ["WorldCom accounting fraud revealed", "Corporate governance crisis deepens", "Investor trust at multi-year lows"],
  41: ["Markets hit new post-bubble lows", "S&P 500 enters bear market territory", "Is there a bottom in sight?"],
  44: ["Nasdaq hits 1,172—down 78% from peak", "Technology spending at decade lows", "Survivors emerge: Amazon, eBay find footing"],
  45: ["Markets attempt stabilization", "The dot-com era is officially over", "Lessons emerge from the wreckage"],
};

const GENERIC_NEWS: Record<Sentiment, string[][]> = {
  'Optimistic': [
    ["Tech stocks continue upward momentum", "IPO market remains active", "Internet adoption accelerates"],
    ["Venture capital flows into dot-com startups", "Retail investors flock to tech funds", "E-commerce revenues grow rapidly"],
  ],
  'Euphoria': [
    ["Day traders report record profits", "New tech IPOs oversubscribed", "Analysts raise targets across the board"],
    ["Internet stocks defy gravity", "Record retail participation in markets", "Tech mutual funds see massive inflows"],
  ],
  'Concern': [
    ["Market volatility increases", "Mixed signals from tech earnings", "Some analysts urge caution"],
    ["Rotation from growth to value begins", "IPO market cools slightly", "Earnings expectations adjusted lower"],
  ],
  'Stress': [
    ["Tech layoffs begin to mount", "Venture funding dries up", "Revenue misses become common"],
    ["Bear market warnings increase", "Consumer confidence weakens", "More dot-coms face cash crunch"],
  ],
  'Panic': [
    ["Liquidation accelerates across tech sector", "Margin debt unwinds violently", "No safe haven in tech"],
    ["Investor capitulation deepens", "Fund redemptions force selling", "Corporate bankruptcies accelerate"],
  ],
};

export function getNewsForMonth(month: number): string[] {
  if (SPECIFIC_NEWS[month]) return SPECIFIC_NEWS[month];
  const sentiment = SENTIMENT[month];
  const options = GENERIC_NEWS[sentiment];
  return options[month % options.length];
}

// ---- Decision events ----
export const DECISION_EVENTS: DecisionEvent[] = [
  {
    month: 14,
    headline: "Nasdaq hits all-time high above 5,000",
    context: "Every tech stock is soaring. Your portfolio is up significantly. Friends are quitting jobs to day-trade. Do you add more?",
    options: [
      { label: "Add more tech exposure", action: 'buy_more' },
      { label: "Hold current positions", action: 'hold' },
      { label: "Take some profits", action: 'reduce' },
      { label: "Move entirely to cash", action: 'cash_all' },
    ],
  },
  {
    month: 15,
    headline: "Market crashes 25% in three weeks",
    context: "The Nasdaq just dropped from 5,000 to 3,300. Margin calls everywhere. TV pundits say 'buy the dip.' Others say this is the beginning of the end.",
    ticker: 'CSCO',
    options: [
      { label: "Buy the dip aggressively", action: 'buy_more' },
      { label: "Hold and wait", action: 'hold' },
      { label: "Reduce exposure", action: 'reduce' },
      { label: "Sell everything", action: 'cash_all' },
    ],
  },
  {
    month: 22,
    headline: "Pets.com shuts down. The narrative cracks.",
    context: "Pets.com burned through $300M and is gone. Other dot-coms are failing. But Amazon is still growing revenues 80% YoY—still unprofitable though.",
    ticker: 'AMZN',
    options: [
      { label: "Double down on Amazon", action: 'buy_more' },
      { label: "Hold what I have", action: 'hold' },
      { label: "Reduce speculative bets", action: 'reduce' },
      { label: "Exit all internet stocks", action: 'sell_all' },
    ],
  },
  {
    month: 25,
    headline: "Cisco warns about slowing demand",
    context: "Cisco—once the most valuable company in the world—issues its first profit warning. The stock is down 60% from peak. Is it cheap now?",
    ticker: 'CSCO',
    options: [
      { label: "Buy Cisco at these levels", action: 'buy_more' },
      { label: "Hold current position", action: 'hold' },
      { label: "Cut position in half", action: 'reduce' },
      { label: "Exit Cisco entirely", action: 'sell_all' },
    ],
  },
  {
    month: 32,
    headline: "9/11 adds chaos to an already broken market",
    context: "Markets closed for days. Reopening brings massive selling across every sector. Nasdaq is now down 70% from peak. Do you have the stomach for this?",
    options: [
      { label: "Stay invested—long-term view", action: 'hold' },
      { label: "Reduce to minimal positions", action: 'reduce' },
      { label: "Move everything to cash", action: 'cash_all' },
    ],
  },
  {
    month: 44,
    headline: "Nasdaq hits 1,172. Down 78% from peak.",
    context: "The bottom may be near—or there's more pain ahead. Some companies like Amazon and eBay are showing real business progress. Most tech is decimated.",
    options: [
      { label: "Start buying survivors", action: 'buy_more' },
      { label: "Hold remaining positions", action: 'hold' },
      { label: "Capitulate—sell everything", action: 'cash_all' },
    ],
  },
];

// ---- Stock price generation ----
export function generateStockPrices(stock: StockDef): number[] {
  const prices: number[] = [];
  const totalMonths = 46;

  for (let m = 0; m < totalMonths; m++) {
    if (stock.bankruptMonth !== undefined && m >= stock.bankruptMonth) {
      prices.push(0);
      continue;
    }

    let basePrice: number;
    if (m <= stock.peakMonth) {
      // Rising phase — quadratic ease-in
      const t = stock.peakMonth > 0 ? m / stock.peakMonth : 1;
      basePrice = stock.startPrice + (stock.peakPrice - stock.startPrice) * (1 - Math.pow(1 - t, 2));
    } else {
      // Falling phase — linear decline to end
      const endMonth = stock.bankruptMonth !== undefined ? stock.bankruptMonth - 1 : totalMonths - 1;
      const range = endMonth - stock.peakMonth;
      const t = range > 0 ? (m - stock.peakMonth) / range : 1;
      const target = stock.bankruptMonth !== undefined ? 0.5 : stock.endPrice;
      basePrice = stock.peakPrice + (target - stock.peakPrice) * Math.min(t, 1);
    }

    // Deterministic noise ±4%
    const noise = Math.sin(m * 7.3 + stock.ticker.charCodeAt(0) * 1.7) * 0.04;
    prices.push(Math.max(0.01, +(basePrice * (1 + noise)).toFixed(2)));
  }

  return prices;
}

// ---- P/E generation per stock per month ----
export function getStockPE(stock: StockDef, month: number, price: number): string {
  if (!stock.hasEarnings) return 'No Earnings';
  // Simulated earnings per share that slowly grows
  const baseEPS = stock.startPrice / 30; // rough starting P/E of 30
  const epsGrowth = 1 + (month / 46) * 0.3;
  const eps = baseEPS * epsGrowth;
  if (eps <= 0) return 'No Earnings';
  return `${Math.round(price / eps)}x`;
}

// ---- Trend direction based on recent prices ----
export function getTrend(prices: number[], month: number): 'Up' | 'Flat' | 'Down' {
  if (month < 2) return 'Up';
  const curr = prices[month];
  const prev = prices[month - 2];
  if (prev === 0 || curr === 0) return 'Down';
  const change = (curr - prev) / prev;
  if (change > 0.05) return 'Up';
  if (change < -0.05) return 'Down';
  return 'Flat';
}
