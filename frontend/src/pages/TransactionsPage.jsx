import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { transactionLedger } from "../data/mockData";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(transactionLedger.transactions);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const filteredTransactions = searchQuery
    ? transactions.filter((tx) =>
        [tx.merchant, tx.category].some((field) =>
          field.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : transactions;

  // Form states
  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [transactionType, setTransactionType] = useState("expense");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("checking");
  const [notes, setNotes] = useState("");

  const getTransactionId = (tx) => tx._id || tx.id;

  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!merchantName || !amount || !date || !category) return;

    const parsedAmount = parseFloat(amount);
    const isIncome = transactionType === "income";
    const amountPrefix = isIncome ? "+" : "-";

    const newTx = {
      id: Date.now(),
      merchant: merchantName,
      category: formatCategoryLabel(category),
      amount: `${amountPrefix}$${parsedAmount.toFixed(2)}`,
      date: date,
      icon: getCategoryIcon(category),
      isIncome,
      isExpense: !isIncome
    };

    setTransactions((currentTransactions) => [newTx, ...currentTransactions]);
    setModalOpen(false);

    // Reset fields
    setMerchantName("");
    setAmount("");
    setDate("");
    setTransactionType("expense");
    setCategory("");
    setAccount("checking");
    setNotes("");
  };

  const handleDeleteTransaction = async (transactionId) => {
    setTransactions((currentTransactions) =>
      currentTransactions.filter((tx) => getTransactionId(tx) !== transactionId)
    );

    try {
      await fetch(`${apiBaseUrl}/api/transactions/${transactionId}`, {
        method: "DELETE"
      });
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const formatCategoryLabel = (cat) => {
    return cat
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "dining":
      case "salary":
      case "freelance":
        return "payments";
      case "groceries": return "shopping_cart";
      case "shopping": return "shopping_bag";
      case "travel": return "flight";
      case "utilities": return "cloud";
      case "stock profit":
      case "investment returns":
      case "property deals":
        return "trending_up";
      default: return "receipt_long";
    }
  };

  const categoryOptions = transactionType === "income"
    ? [
        { value: "salary", label: "Salary / Paycheck" },
        { value: "freelance", label: "Freelance Income" },
        { value: "stock profit", label: "Stock Profit" },
        { value: "investment returns", label: "Investment Returns" },
        { value: "property deals", label: "Property Deals / Selling" },
        { value: "other income", label: "Other Income" }
      ]
    : [
        { value: "dining", label: "Dining & Drinks" },
        { value: "groceries", label: "Groceries" },
        { value: "shopping", label: "Shopping" },
        { value: "travel", label: "Travel" },
        { value: "utilities", label: "Utilities" },
        { value: "rent", label: "Rent" },
        { value: "subscriptions", label: "Subscriptions" },
        { value: "other expense", label: "Other Expense" }
      ];

  return (
    <div className="px-6 lg:px-16 py-8 lg:py-12 max-w-[1280px] w-full mx-auto">
      {/* Title Header */}
      <div className="mb-12 flex justify-between items-end flex-wrap gap-4">
        <div>
          <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Ledger</p>
          <h2 className="font-display text-display text-primary tracking-tight">Transactions</h2>
          {searchQuery && (
            <p className="font-sans text-label-md text-on-surface-variant mt-2">
              {filteredTransactions.length} result{filteredTransactions.length === 1 ? "" : "s"} for{" "}
              <span className="text-primary font-semibold">"{searchQuery}"</span>
            </p>
          )}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn btn-primary"
        >
          Add Transaction
        </button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="editorial-card p-6 flex flex-col gap-2">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Total Inflow</span>
          <span className="font-display text-headline-lg text-emerald-700">{transactionLedger.inflow}</span>
        </div>
        <div className="editorial-card p-6 flex flex-col gap-2">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Total Outflow</span>
          <span className="font-display text-headline-lg text-rose-700">{transactionLedger.outflow}</span>
        </div>
        <div className="editorial-card p-6 flex flex-col gap-2 justify-center">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Monthly Trend</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-[24px] text-emerald-700">trending_up</span>
            <span className="font-sans text-body-md text-emerald-700 font-semibold">{transactionLedger.trend}</span>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="editorial-card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container/30 font-sans text-label-sm text-on-surface-variant uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Merchant</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold text-right">Amount</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors font-sans text-body-md text-primary"
              >
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-variant/80 flex items-center justify-center text-on-surface-variant shrink-0">
                    <span className="material-symbols-outlined text-[18px]">{tx.icon}</span>
                  </div>
                  <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{tx.merchant}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-surface-variant/80 text-on-surface-variant px-3 py-1 rounded-full text-label-sm tracking-wide">
                    {tx.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-on-surface-variant font-medium whitespace-nowrap">
                  {tx.date}
                </td>
                <td className={`px-6 py-4 text-right font-display text-[20px] font-medium whitespace-nowrap ${
                  tx.isIncome ? "text-emerald-700" : "text-primary"
                }`}>
                  {tx.amount}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteTransaction(getTransactionId(tx))}
                    className="inline-flex items-center justify-center rounded-full p-2 text-rose-700 transition-colors hover:bg-rose-100 hover:text-rose-900"
                    aria-label={`Delete ${tx.merchant}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <span className="material-symbols-outlined text-[40px] text-outline block mb-3">search_off</span>
                  <p className="font-sans text-body-md text-on-surface-variant">
                    No transactions found for "{searchQuery}".
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-over Modal Backdrop */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setModalOpen(false)}
        />
      )}

      {/* Slide-over Modal Content */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 transform transition-transform duration-300 border-l border-outline-variant/30 flex flex-col ${
          modalOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface shrink-0">
          <div>
            <h2 className="font-sans text-headline-md text-primary">New Transaction</h2>
            <p className="font-sans text-label-sm text-on-surface-variant mt-1">Manual entry or data sync</p>
          </div>
          <button
            className="btn btn-icon btn-ghost shrink-0"
            onClick={() => setModalOpen(false)}
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="flex gap-4 mb-8 border-b border-outline-variant/30 pb-4 shrink-0">
            <button
              onClick={() => setActiveTab("manual")}
              className={`font-sans text-label-sm pb-2 flex-1 text-center transition-colors font-semibold ${
                activeTab === "manual" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab("sync")}
              className={`font-sans text-label-sm pb-2 flex-1 text-center transition-colors font-semibold ${
                activeTab === "sync" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Add via Data Sync
            </button>
          </div>

          {activeTab === "manual" ? (
            <form onSubmit={handleAddTransaction} className="space-y-6 flex flex-col min-h-[min-content]">
              {/* Merchant Name */}
              <div className="space-y-2 shrink-0">
                <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Source / Description
                </label>
                <input
                  type="text"
                  required
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary placeholder:text-outline transition-colors outline-none"
                  placeholder="e.g. Stock sale or property deal"
                />
              </div>

              {/* Transaction Type */}
              <div className="space-y-2 shrink-0">
                <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Transaction Type
                </label>
                <div className="relative">
                  <select
                    value={transactionType}
                    onChange={(e) => {
                      setTransactionType(e.target.value);
                      setCategory("");
                    }}
                    className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary appearance-none outline-none"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income / Inflow</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Amount & Date */}
              <div className="flex gap-6 shrink-0 flex-wrap sm:flex-nowrap">
                <div className="space-y-2 flex-1 min-w-[120px]">
                  <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                    Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-0 top-2 font-sans text-on-surface-variant">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-transparent border-b border-outline-variant focus:border-primary pl-4 py-2 font-sans text-body-md text-primary placeholder:text-outline transition-colors outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2 flex-1 min-w-[120px]">
                  <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary transition-colors outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2 shrink-0">
                <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                  {transactionType === "income" ? "Income Category" : "Expense Category"}
                </label>
                <div className="relative">
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary appearance-none outline-none"
                  >
                    <option value="" disabled>Select category...</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Account */}
              <div className="space-y-2 shrink-0">
                <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Account
                </label>
                <div className="relative">
                  <select
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary appearance-none outline-none"
                  >
                    <option value="checking">Aura Checking (...1234)</option>
                    <option value="savings">Aura Savings (...5678)</option>
                    <option value="credit">Platinum Credit (...9012)</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-0 top-2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2 flex-1">
                <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary placeholder:text-outline transition-colors outline-none resize-none"
                  placeholder="Add details..."
                  rows="2"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-outline-variant/30 flex gap-4 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  Add
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center select-none h-full">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">sync</span>
              <p className="font-sans text-body-lg text-primary font-medium">Connect bank statement sync</p>
              <p className="font-sans text-body-md text-on-surface-variant mt-2 max-w-[240px]">
                Link checking, savings, or investment accounts directly.
              </p>
              <button className="mt-8 btn btn-primary">Setup Plaid Sync</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
