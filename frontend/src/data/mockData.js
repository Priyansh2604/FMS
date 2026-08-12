export const notifications = [
  { id: 1, icon: "receipt_long", title: "New transaction posted", description: "Whole Foods Market · -$245.50", time: "2m ago", unread: true },
  { id: 2, icon: "trending_up", title: "Budget threshold reached", description: "Entertainment is at 85% of its monthly limit.", time: "1h ago", unread: true },
  { id: 3, icon: "payments", title: "Salary deposit received", description: "$8,500.00 from Salary Client A", time: "3h ago", unread: true },
  { id: 4, icon: "shield", title: "Security check passed", description: "New device sign-in verified successfully.", time: "1d ago", unread: false },
  { id: 5, icon: "insights", title: "Weekly report ready", description: "Your Q3 spending summary is available now.", time: "2d ago", unread: false }
];

export const calendarEvents = [
  { id: 1, day: 6, title: "Credit card bill due", amount: 12400 },
  { id: 2, day: 14, title: "Rent payment", amount: 28000 },
  { id: 3, day: 21, title: "Salary deposit", amount: 95000 },
  { id: 4, day: 27, title: "SIP mutual funds", amount: 2500 }
];

export const dashboardOverview = {
  balance: 84520,
  income: 12400,
  healthScore: "82%",
  insights: {
    title: "AI Insight: Unusual Spending Pattern",
    description: "We detected a 40% increase in dining expenses over the weekend compared to your usual baseline. Would you like to review these transactions?",
    cta: "Ask AI"
  }
};

export const spendingTimeline = [
  {
    date: "Today, Oct 12",
    total: 1240,
    transactions: [
      { id: 1, merchant: "Artisan Coffee", amount: 340 },
      { id: 2, merchant: "Whole Foods", amount: 900 }
    ]
  },
  {
    date: "Yesterday, Oct 11",
    total: 8500,
    transactions: [
      { id: 3, merchant: "Apple Store", amount: 8500 }
    ],
    highlight: true
  },
  {
    date: "Wed, Oct 10",
    total: 450,
    transactions: [
      { id: 4, merchant: "Uber", amount: 450 }
    ],
    muted: true
  }
];

export const recentTransactions = [
  {
    id: 101,
    merchant: "Le Bernardin",
    category: "Dining",
    amount: -4200,
    icon: "restaurant",
    isExpense: true
  },
  {
    id: 102,
    merchant: "Emirates Airlines",
    category: "Travel",
    amount: -62000,
    icon: "flight",
    isExpense: true,
    accentIcon: true
  }
];

export const budgetStatus = [
  {
    id: 201,
    category: "Home Office",
    spent: 15000,
    total: 20000,
    percentage: 75,
    strokeOffset: 62.8
  },
  {
    id: 202,
    category: "Entertainment",
    spent: 4000,
    total: 10000,
    percentage: 40,
    strokeOffset: 150.72,
    accentRing: true
  }
];

export const creditLocation = {
  score: 815,
  scoreLabel: "Equifax Score",
  location: "New York",
  mapUrl: "https://picsum.photos/seed/aura-map/800/400"
};

export const upcomingBills = [
  { id: 301, name: "AWS Hosting", amount: 2100, dotColor: "bg-primary" },
  { id: 302, name: "Adobe CC", amount: 4230, dotColor: "bg-tertiary-fixed" }
];

export const transactionLedger = {
  inflow: 42500,
  outflow: 18240.75,
  trend: "+12% vs last month",
  transactions: [
    { id: 401, merchant: "Le Bernardin", category: "Dining", amount: -120.0, date: "2026-08-04", icon: "restaurant" },
    { id: 402, merchant: "Whole Foods", category: "Groceries", amount: -245.5, date: "2026-08-04", icon: "shopping_cart" },
    { id: 403, merchant: "AWS Cloud", category: "Utilities", amount: -89.0, date: "2026-08-03", icon: "cloud" },
    { id: 404, merchant: "Emirates Airlines", category: "Travel", amount: -1200.0, date: "2026-08-02", icon: "flight" },
    { id: 405, merchant: "Salary Client A", category: "Income", amount: 8500.0, date: "2026-08-01", icon: "payments", isIncome: true }
  ]
};

export const portfolioCategories = [
  {
    id: 501,
    type: "Property",
    valuation: 4200000,
    percentage: "34.2%",
    trend: "+8.4% YTD",
    icon: "domain",
    bgImage: "https://picsum.photos/seed/aura-property/800/600",
    isLarge: true
  },
  {
    id: 502,
    type: "Equities",
    valuation: 5180000,
    percentage: "42.1%",
    sectors: [
      { name: "Tech Sector", value: "45%" },
      { name: "Healthcare", value: "30%" },
      { name: "Consumer", value: "25%" }
    ],
    icon: "candlestick_chart"
  },
  {
    id: 503,
    type: "Fixed Income",
    valuation: 1800000,
    label: "Yielding",
    description: "Targeting Capital Preservation",
    icon: "account_balance"
  },
  {
    id: 504,
    type: "Mutual Funds",
    valuation: 1900000,
    percentage: "15.5%",
    label: "Diversified Basket",
    icon: "pie_chart",
    isDark: true
  }
];

export const chatMessages = [
  {
    id: 601,
    sender: "user",
    text: "Can you break down my spending patterns for the last quarter? I feel like I've been overspending on dining and subscriptions."
  },
  {
    id: 602,
    sender: "ai",
    text: "Certainly. I've analyzed your transaction data for Q3. You are correct in your assessment; dining out and subscription services have seen a notable increase compared to the previous quarter.\n\nOverall Q3 spend increased by 12.4%. Here is the detailed breakdown of the variance:",
    hasCards: true,
    cards: [
      {
        id: 701,
        title: "DINING & ENTERTAINMENT",
        amount: "$3,450.00",
        percentage: 75,
        limitLabel: "75% of allocated budget ($4,600)",
        change: "+18%",
        icon: "restaurant",
        isAlert: true
      },
      {
        id: 702,
        title: "SUBSCRIPTIONS",
        amount: "$485.00",
        percentage: 110,
        limitLabel: "110% of allocated budget ($440)",
        change: "+8%",
        icon: "subscriptions",
        isAlert: true,
        useDarkProgress: true
      }
    ],
    followUpText: "I found 3 inactive subscriptions (charged but unused for 60+ days) totaling $42/month. Would you like me to initiate cancellations for these?"
  }
];

export const marketIndices = [
  { id: 901, name: "NIFTY 50", value: 24870, change: "+212.4", changePct: "+0.86%", icon: "show_chart", up: true },
  { id: 902, name: "SENSEX", value: 81341, change: "+598.2", changePct: "+0.74%", icon: "trending_up", up: true },
  { id: 903, name: "Gold (MCX)", value: 71240, change: "+228.0", changePct: "+0.32%", icon: "monitoring", up: true },
  { id: 904, name: "NIFTY Bank", value: 52160, change: "-215.5", changePct: "-0.41%", icon: "account_balance", up: false }
];

export const marketTrend = {
  period: "Last 6 months",
  labels: ["Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  series: [
    { id: "nifty", label: "NIFTY 50", color: "#000000", points: [22150, 23400, 23100, 24050, 24650, 24870] },
    { id: "sensex", label: "SENSEX", color: "#5d5f5f", points: [72800, 76200, 75400, 78900, 80600, 81341] },
    { id: "bank", label: "NIFTY Bank", color: "#fed488", points: [48200, 50400, 49600, 51200, 52300, 52160] },
    { id: "gold", label: "Gold (MCX)", color: "#dfc0b5", points: [64500, 66200, 68100, 69400, 70800, 71240] }
  ]
};

export const candleData = {
  symbol: "TCS",
  name: "Tata Consultancy Services",
  candles: [
    { day: "Jul 15", o: 3940, h: 3990, l: 3930, c: 3980 },
    { day: "Jul 16", o: 3980, h: 4015, l: 3960, c: 3970 },
    { day: "Jul 17", o: 3970, h: 3995, l: 3945, c: 3985 },
    { day: "Jul 20", o: 3985, h: 4050, l: 3975, c: 4040 },
    { day: "Jul 21", o: 4040, h: 4065, l: 4010, c: 4025 },
    { day: "Jul 22", o: 4025, h: 4045, l: 3990, c: 4008 },
    { day: "Jul 23", o: 4008, h: 4070, l: 4000, c: 4065 },
    { day: "Jul 24", o: 4065, h: 4110, l: 4050, c: 4100 },
    { day: "Jul 25", o: 4100, h: 4125, l: 4075, c: 4090 },
    { day: "Jul 28", o: 4090, h: 4150, l: 4085, c: 4140 },
    { day: "Jul 29", o: 4140, h: 4160, l: 4115, c: 4130 },
    { day: "Jul 30", o: 4130, h: 4155, l: 4080, c: 4095 },
    { day: "Jul 31", o: 4095, h: 4130, l: 4075, c: 4125 },
    { day: "Aug 01", o: 4125, h: 4150, l: 4100, c: 4110 },
    { day: "Aug 03", o: 4110, h: 4135, l: 4085, c: 4098 },
    { day: "Aug 05", o: 4098, h: 4130, l: 4090, c: 4120.5 }
  ]
};

export const investmentProfile = {
  savings: "₹84,520",
  monthlySavings: "₹18,500",
  riskProfile: "Moderate",
  aiNote:
    "Based on your current savings of ₹84,520 and a moderate risk appetite, this allocation balances growth potential with capital safety. Diversify across equity, SIPs, and fixed income to ride market cycles.",
  allocation: [
    { asset: "Stocks (Direct)", pct: 40, color: "#000000" },
    { asset: "SIP Mutual Funds", pct: 35, color: "#5d5f5f" },
    { asset: "Fixed Deposit", pct: 15, color: "#fed488" },
    { asset: "Gold", pct: 10, color: "#dfc0b5" }
  ]
};

export const stockRecommendations = [
  {
    id: 1001,
    symbol: "TCS",
    name: "Tata Consultancy Services",
    sector: "IT Services",
    price: 4120.5,
    changePct: "+1.24%",
    riskScore: 62,
    expectedReturn: "12–14% p.a.",
    allocate: 13500,
    icon: "code",
    rationale:
      "Large-cap leader with strong free cash flow and consistent dividends. A stable core position that fits a moderate-risk portfolio."
  },
  {
    id: 1002,
    symbol: "HDFCBANK",
    name: "HDFC Bank",
    sector: "Banking",
    price: 1540.3,
    changePct: "+0.62%",
    riskScore: 52,
    expectedReturn: "10–12% p.a.",
    allocate: 11000,
    icon: "account_balance",
    rationale:
      "Top-tier private bank with robust asset quality and steady earnings growth. Lower volatility, dependable dividends."
  },
  {
    id: 1003,
    symbol: "RELIANCE",
    name: "Reliance Industries",
    sector: "Energy / Retail",
    price: 2980.0,
    changePct: "+0.94%",
    riskScore: 58,
    expectedReturn: "11–13% p.a.",
    allocate: 9500,
    icon: "local_gas_station",
    rationale:
      "Diversified conglomerate with growth engines across energy, telecom, and retail. Good long-term compounder."
  },
  {
    id: 1004,
    symbol: "ZOMATO",
    name: "Zomato",
    sector: "Consumer Tech",
    price: 182.4,
    changePct: "+3.10%",
    riskScore: 82,
    expectedReturn: "18–24% p.a.",
    allocate: 3800,
    icon: "delivery_dining",
    rationale:
      "High-growth but volatile. Recommended only as a small satellite position from your risk budget — not a core holding."
  }
];

export const mutualFundRecommendations = [
  {
    id: 2001,
    name: "HDFC Top 100 Fund",
    category: "Large Cap",
    nav: 842.1,
    sipMonthly: 2000,
    riskScore: 55,
    expectedReturn: "12–14% p.a.",
    icon: "pie_chart",
    rationale:
      "Direct equity exposure to India's top blue chips — a steady SIP alternative to buying individual large-cap stocks."
  },
  {
    id: 2002,
    name: "Parag Parikh Flexi Cap",
    category: "Flexi Cap",
    nav: 61.25,
    sipMonthly: 3000,
    riskScore: 58,
    expectedReturn: "13–15% p.a.",
    icon: "diversity_2",
    rationale:
      "Well-diversified flexi-cap fund with a proven long-term track record across market cycles."
  },
  {
    id: 2003,
    name: "SBI Blue Chip Fund",
    category: "Large Cap",
    nav: 68.9,
    sipMonthly: 1500,
    riskScore: 50,
    expectedReturn: "11–13% p.a.",
    icon: "shield",
    rationale:
      "Low-cost exposure to large, stable companies — ideal if you prefer smoother SIP journeys with less volatility."
  },
  {
    id: 2004,
    name: "Mirae Asset Large & Midcap",
    category: "Large & Mid Cap",
    nav: 142.6,
    sipMonthly: 2500,
    riskScore: 60,
    expectedReturn: "13–16% p.a.",
    icon: "equalizer",
    rationale:
      "Blends blue-chip stability with mid-cap growth — a good middle-ground risk profile for a moderate investor."
  }
];

export const alternativeInstruments = [
  {
    id: 3001,
    name: "Fixed Deposit",
    returns: "7.1% p.a.",
    minAmount: "₹10,000",
    lockIn: "1–5 years",
    riskLabel: "Low",
    icon: "savings",
    description: "Guaranteed returns with deposit insurance cover up to ₹5 lakh."
  },
  {
    id: 3002,
    name: "Public Provident Fund",
    returns: "7.1% (tax-free)",
    minAmount: "₹500/yr",
    lockIn: "15 years",
    riskLabel: "Low",
    icon: "shield",
    description: "Sovereign-backed savings with EEE tax benefits on interest and maturity."
  },
  {
    id: 3003,
    name: "ELSS Tax Saver",
    returns: "12–15% p.a.",
    minAmount: "₹500",
    lockIn: "3 years",
    riskLabel: "Moderate",
    icon: "request_quote",
    description: "Equity mutual fund with tax deduction under Section 80C (up to ₹1.5L/yr)."
  },
  {
    id: 3004,
    name: "Sovereign Gold Bond",
    returns: "2.5% + gold price",
    minAmount: "₹1,000",
    lockIn: "8 years",
    riskLabel: "Moderate",
    icon: "monitoring",
    description: "Gold investment with periodic interest and no making charges."
  },
  {
    id: 3005,
    name: "Corporate Bonds",
    returns: "8–9% p.a.",
    minAmount: "₹10,000",
    lockIn: "Till maturity",
    riskLabel: "Moderate",
    icon: "account_balance",
    description: "Higher yield than a fixed deposit, with credit risk tied to the issuer."
  }
];
