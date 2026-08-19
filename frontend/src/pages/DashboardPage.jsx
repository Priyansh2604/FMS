import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/ui/StatCard";
import TransactionRow from "../components/ui/TransactionRow";
import { getCurrentUser } from "../auth";
import { formatCurrency } from "../utils/currency";

export default function DashboardPage() {
  const navigate = useNavigate();
  const userId = getCurrentUser()?.id || "";
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/transactions?user_id=${encodeURIComponent(userId)}`);
      if (response.ok) {
        setTransactions(await response.json());
        return;
      }
      throw new Error("Could not load transactions");
    } catch {
      try {
        setTransactions(JSON.parse(localStorage.getItem(`aura_transactions_${userId}`) || "[]"));
      } catch {
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, userId]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const income = transactions.filter((transaction) => transaction.type === "income").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const expenses = transactions.filter((transaction) => transaction.type === "expense").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const balance = income - expenses;

  return (
    <div className="px-6 lg:px-16 py-8 lg:py-12 max-w-[1440px] w-full mx-auto">
      <section className="flex flex-col gap-6 mb-12">
        <div>
          <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Your account</p>
          <h1 className="font-display text-display-lg text-primary tracking-tight">Financial Overview</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-outline-variant/30 pt-8">
          <StatCard label="Current Balance" value={formatCurrency(balance)} />
          <StatCard label="Total Income" value={formatCurrency(income)} isBordered />
          <StatCard label="Total Expenses" value={formatCurrency(expenses)} isBordered />
        </div>
      </section>

      <section className="mb-12 border-b border-outline-variant/30 pb-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-headline-lg text-primary">Recent Transactions</h2>
            <p className="font-sans text-body-md text-on-surface-variant mt-2">Only transactions you create will appear here.</p>
          </div>
          <button onClick={() => navigate("/dashboard/transactions")} className="btn btn-primary">Create Transaction</button>
        </div>
        <div className="mt-6">
          {loading ? <p className="py-8 font-sans text-body-md text-on-surface-variant">Loading transactions...</p> : transactions.length === 0 ? (
            <div className="editorial-card p-10 text-center"><span className="material-symbols-outlined text-[44px] text-on-surface-variant">receipt_long</span><h3 className="font-display text-headline-md text-primary mt-4">No transactions yet</h3><p className="font-sans text-body-md text-on-surface-variant mt-2">Create an income or expense to start your dashboard.</p></div>
          ) : (
            <div className="flex flex-col gap-3">{transactions.slice(0, 5).map((transaction) => <TransactionRow key={transaction.id} merchant={transaction.merchant} category={transaction.category} amount={formatCurrency(transaction.type === "expense" ? -Number(transaction.amount) : Number(transaction.amount))} icon={transaction.type === "expense" ? "receipt_long" : "payments"} isExpense={transaction.type === "expense"} />)}</div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="editorial-card p-8"><h2 className="font-display text-headline-lg text-primary">Spending Timeline</h2><p className="font-sans text-body-md text-on-surface-variant mt-3">Your spending timeline will appear after you add transactions.</p><button onClick={() => navigate("/dashboard/transactions")} className="btn btn-outline mt-6">Go to Transactions</button></div>
        <div className="editorial-card p-8"><h2 className="font-display text-headline-lg text-primary">Budget Status</h2><p className="font-sans text-body-md text-on-surface-variant mt-3">Create transactions first, then set budgets from your real spending.</p><button onClick={() => navigate("/dashboard/transactions")} className="btn btn-outline mt-6">Add Spending</button></div>
      </section>
    </div>
  );
}