import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../auth";
import StatCard from "../components/ui/StatCard";
import TransactionRow from "../components/ui/TransactionRow";
import InsightCard from "../components/ui/InsightCard";
import { formatCurrency } from "../utils/currency";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const userId = user?.id || "";
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetch(`${apiBaseUrl}/api/expenses/summary?user_id=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSummary(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, apiBaseUrl]);

  const totalSpent = summary?.total_spent || 0;
  const totalExpenses = summary?.total_expenses || 0;
  const totalReceipts = summary?.total_receipts || 0;
  const categoryBreakdown = summary?.category_breakdown || [];
  const recentTransactions = summary?.recent_transactions || [];

  const topCategory = categoryBreakdown[0];
  const secondCategory = categoryBreakdown[1];

  return (
    <div className="px-6 lg:px-16 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-[1440px] w-full mx-auto">
      <div className="lg:col-span-8 flex flex-col gap-12 min-w-0">
        <section className="flex flex-col gap-6">
          <h1 className="font-display text-display-lg text-primary tracking-tight">
            Financial Overview
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-outline-variant/30 pt-8">
            <StatCard label="Total Spent" value={formatCurrency(totalSpent)} />
            <StatCard label="Total Expenses" value={String(totalExpenses)} isBordered />
            <StatCard
              label="Receipts Scanned"
              value={String(totalReceipts)}
              trend={totalReceipts > 0}
              showTrendUp={true}
              isBordered
            />
          </div>
        </section>

        {topCategory && (
<InsightCard
              title={`Top spending: ${topCategory.category}`}
              description={`Your highest expense category is ${topCategory.category} at ${formatCurrency(topCategory.amount)}.${secondCategory ? ` Followed by ${secondCategory.category} at ${formatCurrency(secondCategory.amount)}.` : ""}`}
              ctaLabel="View Transactions"
              onCtaClick={() => navigate("/dashboard/transactions")}
            />
        )}

        {categoryBreakdown.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="font-display text-headline-lg text-primary border-b border-outline-variant/30 pb-4">
              Spending by Category
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
              {categoryBreakdown.slice(0, 6).map((item) => {
                const pct = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
                return (
                  <div
                    key={item.category}
                    className="min-w-[200px] shrink-0 snap-start editorial-card p-5 flex flex-col gap-3"
                  >
                    <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="font-display text-headline-md text-primary font-medium">
                      {formatCurrency(item.amount)}
                    </span>
                    <div className="w-full bg-surface-variant/50 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="font-sans text-label-sm text-on-surface-variant">{pct}% of total</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-6">
          <h2 className="font-display text-headline-lg text-primary border-b border-outline-variant/30 pb-4">
            Recent Transactions
          </h2>
          <div className="w-full">
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-outline-variant/30 font-sans text-label-sm text-on-surface-variant uppercase tracking-wider">
              <div className="col-span-5">Merchant</div>
              <div className="col-span-4">Category</div>
              <div className="col-span-3 text-right">Amount</div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              {loading ? (
                <p className="font-sans text-body-md text-on-surface-variant py-8 text-center">Loading transactions...</p>
              ) : recentTransactions.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-[40px] text-outline block mb-3">receipt_long</span>
                  <p className="font-sans text-body-md text-on-surface-variant">No transactions yet. Upload a receipt to get started.</p>
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <TransactionRow
                    key={tx.id}
                    merchant={tx.merchant || tx.description || "Unknown"}
                    category={tx.category}
                    amount={formatCurrency(tx.amount)}
                    icon={getCategoryIcon(tx.category)}
                    isExpense={true}
                  />
                ))
              )}
            </div>
{recentTransactions.length > 0 && (
              <button onClick={() => navigate("/dashboard/transactions")} className="btn btn-ghost btn-sm justify-start !px-0 mt-4">
                View all transactions <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}
          </div>
        </section>
      </div>

      <aside className="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-[100px] min-w-0">
        <div className="editorial-card p-6 lg:p-8 flex flex-col gap-6">
          <h3 className="font-sans text-headline-sm text-primary">Category Breakdown</h3>
          <div className="flex flex-col gap-4">
            {categoryBreakdown.length === 0 ? (
              <p className="font-sans text-body-sm text-on-surface-variant">No data yet</p>
            ) : (
              categoryBreakdown.slice(0, 5).map((item) => {
                const pct = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
                return (
                  <div key={item.category} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                    <span className="font-sans text-body-md text-primary flex-1 truncate">{item.category}</span>
                    <span className="font-sans text-body-md text-primary font-medium shrink-0">{formatCurrency(item.amount)}</span>
                    <span className="font-sans text-label-sm text-on-surface-variant shrink-0 w-10 text-right">{pct}%</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="editorial-card p-6 lg:p-8 flex flex-col gap-4">
          <h3 className="font-sans text-headline-sm text-primary mb-2">Quick Stats</h3>
          <ul className="flex flex-col gap-4">
            <li className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-sans text-body-md text-primary">Total Spent</span>
              </div>
              <span className="font-sans text-body-md text-primary font-medium">{formatCurrency(totalSpent)}</span>
            </li>
            <li className="flex justify-between items-center pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="font-sans text-body-md text-primary">Receipts</span>
              </div>
              <span className="font-sans text-body-md text-primary font-medium">{totalReceipts}</span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                <span className="font-sans text-body-md text-primary">Manual</span>
              </div>
              <span className="font-sans text-body-md text-primary font-medium">{summary?.total_manual || 0}</span>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

function getCategoryIcon(category) {
  const map = {
    Food: "restaurant",
    Groceries: "shopping_cart",
    Transport: "local_taxi",
    Shopping: "shopping_bag",
    Entertainment: "movie",
    Bills: "receipt_long",
    Utilities: "cloud",
    Healthcare: "local_hospital",
    Education: "school",
    Travel: "flight",
    Rent: "home",
    Insurance: "shield",
    Subscriptions: "subscriptions",
    Salary: "payments",
    Freelance: "work",
    Investment: "trending_up",
    Other: "receipt_long",
  };
  return map[category] || "receipt_long";
}
