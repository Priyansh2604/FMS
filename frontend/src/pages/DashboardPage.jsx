import React from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/ui/StatCard";
import InsightCard from "../components/ui/InsightCard";
import TransactionRow from "../components/ui/TransactionRow";
import BudgetRing from "../components/ui/BudgetRing";
import {
  dashboardOverview,
  spendingTimeline,
  recentTransactions,
  budgetStatus,
  creditLocation,
  upcomingBills,
} from "../data/mockData";
import { formatCurrency } from "../utils/currency";

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="px-6 lg:px-16 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-[1440px] w-full mx-auto">
      {/* Left major column */}
      <div className="lg:col-span-8 flex flex-col gap-12 min-w-0">
        {/* Header section */}
        <section className="flex flex-col gap-6">
          <h1 className="font-display text-display-lg text-primary tracking-tight">
            Financial Overview
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-outline-variant/30 pt-8">
            <StatCard label="Current Balance" value={formatCurrency(dashboardOverview.balance)} />
            <StatCard label="Monthly Income" value={formatCurrency(dashboardOverview.income)} isBordered />
            <StatCard
              label="Health Score"
              value={dashboardOverview.healthScore}
              trend={true}
              showTrendUp={true}
              isBordered
            />
          </div>
        </section>

        {/* AI Insight banner */}
        <InsightCard
          title={dashboardOverview.insights.title}
          description={dashboardOverview.insights.description}
          ctaLabel={dashboardOverview.insights.cta}
          onCtaClick={() => navigate("/advisor")}
        />

        {/* Spending timeline horizontal list */}
        <section className="flex flex-col gap-6">
          <h2 className="font-display text-headline-lg text-primary border-b border-outline-variant/30 pb-4">
            Spending Timeline
          </h2>
          <div className="flex gap-8 overflow-x-auto pb-4 snap-x">
            {spendingTimeline.map((item) => (
              <div
                key={item.date}
                className={`min-w-[280px] shrink-0 snap-start flex flex-col gap-6 ${item.muted ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col">
                  <span className="font-sans text-label-md text-primary">{item.date}</span>
                  <span className="font-sans text-body-md text-on-surface-variant mt-1">
                    {formatCurrency(item.total)} Total
                  </span>
                </div>
                <div
                  className={`flex flex-col gap-4 border-l-2 pl-4 ${
                    item.highlight ? "border-primary" : "border-surface-variant"
                  }`}
                >
                  {item.transactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center gap-4">
                      <span className="font-sans text-body-md text-primary truncate">
                        {tx.merchant}
                      </span>
                      <span className="font-display text-headline-md text-primary font-medium shrink-0">
                        {formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Transactions list */}
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
              {recentTransactions.map((tx) => (
                <TransactionRow
                  key={tx.id}
                  merchant={tx.merchant}
                  category={tx.category}
                  amount={formatCurrency(tx.amount)}
                  icon={tx.icon}
                  accentIcon={tx.accentIcon}
                  isExpense={tx.isExpense}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Right widgets column */}
      <aside className="lg:col-span-4 flex flex-col gap-8 lg:sticky lg:top-[100px] min-w-0">
        {/* Budget Status Widget */}
        <div className="editorial-card p-6 lg:p-8 flex flex-col gap-6">
          <h3 className="font-sans text-headline-sm text-primary">Budget Status</h3>
          <div className="flex flex-col gap-6">
            {budgetStatus.map((item) => (
              <BudgetRing
                key={item.id}
                category={item.category}
                spent={item.spent}
                total={item.total}
                percentage={item.percentage}
                strokeOffset={item.strokeOffset}
                accentRing={item.accentRing}
              />
            ))}
          </div>
        </div>

        {/* Credit & Location Map widget */}
        <div className="editorial-card p-6 lg:p-8 flex flex-col gap-6">
          <h3 className="font-sans text-headline-sm text-primary">
            Credit &amp; Location
          </h3>
          <div className="w-full h-48 rounded-xl overflow-hidden relative border border-outline-variant/20 shadow-sm">
            <img
              src={creditLocation.mapUrl}
              alt="Map location representation"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md p-4 rounded-xl border border-outline-variant/25 shadow-sm flex flex-col gap-1">
              <span className="font-sans text-label-sm text-on-surface-variant uppercase">
                {creditLocation.scoreLabel}
              </span>
              <span className="font-display text-headline-sm text-primary font-semibold">
                {creditLocation.score}
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Bills widget */}
        <div className="editorial-card p-6 lg:p-8 flex flex-col gap-4">
          <h3 className="font-sans text-headline-sm text-primary mb-2">Upcoming Bills</h3>
            <ul className="flex flex-col gap-4">
            {upcomingBills.map((bill) => (
              <li
                key={bill.id}
                className="flex justify-between items-center pb-4 border-b border-outline-variant/20 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${bill.dotColor}`} />
                  <span className="font-sans text-body-md text-primary">
                    {bill.name}
                  </span>
                </div>
                <span className="font-sans text-body-md text-primary font-medium">
                  {formatCurrency(bill.amount)}
                </span>
              </li>
            ))}
          </ul>
          <button className="btn btn-ghost btn-sm justify-start !px-0 mt-2">
            View all scheduled <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
