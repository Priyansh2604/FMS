export const userProfile = {
  name: "Julian Vane",
  tier: "Premium Member",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsfabcq-bealQ9y_ItAEaNppRSRggBW8ap34miT6RIWTXta-SeNPieZZ6wWFIGuTGB0iE9ONMY1ruel9_XLunlCGGNxTG52a6d-O8zsQtfA6jo0xeNkp1RXN7BruV0PFHIByhsozWIHhxrAGbOmS0b1K_rjDIcE2K0vRlFp57LjoiFKbXI2p5eKhr78xKiqPqp4-KHFk8YGNZd2EzqpHLb1rNH4RKR8vjSoQQ7B8GEUCNK8W8R8a1PNg"
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
  mapUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCc92OnvIY5VKQ7T50lHl1NTLbLldAgm6fGJsJEAyMVeZ5dTqCULEcG1bVcvOPk84lRy8zsBBkzDEBdq6eU2pvsc1Kf954yr-LohqYgp0lNYuLgaG6oX_RCy_KZFWer07uwOLJCmCKjqFmzblKXqqrP6mMwhaJ5Dy_Ul0gDygds_TCYXS7NPcem9kLllAk0ubfmA-OjKIvzhjOdTSTDT26qWE5Gv3A1zwrJuI4XeXTDIGN--hUeltDyw"
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
    bgImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpvvUbpjleEMA2dPznm1Up_6VTtpeWu1V5lH5X1iySUyVcSO-SV0Vr1Yq1yXj-TZiHgvGc-3HrFMHKXPg8HNDa8u6lkU_AvSkUr_YDPV1An-6r9RWq6-FB_W6dALoX0f0MtrMHIbQE5kTiYlOxBz7MaDtTYCz-p7aqpAsTF8wQM3P5zDPso1zxoekH4eVGIt_54Cuxl_5oWFaugtf3mPfaBp_kuVMRtDOuyVLhenrZSiLkOWzSEsFzEQ",
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
