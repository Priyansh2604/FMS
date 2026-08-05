export const userProfile = {
  name: "Julian Vane",
  tier: "Premium Member",
  avatar: "https://i.pravatar.cc/160?img=12"
};

export const dashboardOverview = {
  balance: "₹84,520",
  income: "₹12,400",
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
    total: "₹1,240",
    transactions: [
      { id: 1, merchant: "Artisan Coffee", amount: "₹340" },
      { id: 2, merchant: "Whole Foods", amount: "₹900" }
    ]
  },
  {
    date: "Yesterday, Oct 11",
    total: "₹8,500",
    transactions: [
      { id: 3, merchant: "Apple Store", amount: "₹8,500" }
    ],
    highlight: true
  },
  {
    date: "Wed, Oct 10",
    total: "₹450",
    transactions: [
      { id: 4, merchant: "Uber", amount: "₹450" }
    ],
    muted: true
  }
];

export const recentTransactions = [
  {
    id: 101,
    merchant: "Le Bernardin",
    category: "Dining",
    amount: "-₹4,200",
    icon: "restaurant",
    isExpense: true
  },
  {
    id: 102,
    merchant: "Emirates Airlines",
    category: "Travel",
    amount: "-₹62,000",
    icon: "flight",
    isExpense: true,
    accentIcon: true
  }
];

export const budgetStatus = [
  {
    id: 201,
    category: "Home Office",
    spent: "₹15k",
    total: "₹20k",
    percentage: 75,
    strokeOffset: 62.8
  },
  {
    id: 202,
    category: "Entertainment",
    spent: "₹4k",
    total: "₹10k",
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
  { id: 301, name: "AWS Hosting", amount: "₹2,100", dotColor: "bg-primary" },
  { id: 302, name: "Adobe CC", amount: "₹4,230", dotColor: "bg-tertiary-fixed" }
];

export const transactionLedger = {
  inflow: "$42,500.00",
  outflow: "$18,240.75",
  trend: "+12% vs last month",
  transactions: [
    { id: 401, merchant: "Le Bernardin", category: "Dining", amount: "-$120.00", date: "2026-08-04", icon: "restaurant" },
    { id: 402, merchant: "Whole Foods", category: "Groceries", amount: "-$245.50", date: "2026-08-04", icon: "shopping_cart" },
    { id: 403, merchant: "AWS Cloud", category: "Utilities", amount: "-$89.00", date: "2026-08-03", icon: "cloud" },
    { id: 404, merchant: "Emirates Airlines", category: "Travel", amount: "-$1,200.00", date: "2026-08-02", icon: "flight" },
    { id: 405, merchant: "Salary Client A", category: "Income", amount: "+$8,500.00", date: "2026-08-01", icon: "payments", isIncome: true }
  ]
};

export const portfolioCategories = [
  {
    id: 501,
    type: "Property",
    valuation: "$4.2M",
    percentage: "34.2%",
    trend: "+8.4% YTD",
    icon: "domain",
    bgImage: "https://picsum.photos/seed/aura-property/800/600",
    isLarge: true
  },
  {
    id: 502,
    type: "Equities",
    valuation: "$5.18M",
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
    valuation: "$1.8M",
    label: "Yielding",
    description: "Targeting Capital Preservation",
    icon: "account_balance"
  },
  {
    id: 504,
    type: "Mutual Funds",
    valuation: "$1.9M",
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
