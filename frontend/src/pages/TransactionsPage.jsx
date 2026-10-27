import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../auth";
import { formatCurrency } from "../utils/currency";
import { fetchCategories } from "../services/marketApi";

const EXPENSE_CATEGORIES = [
  { value: "Food & Dining", label: "Food & Dining" },
  { value: "Groceries", label: "Groceries" },
  { value: "Fuel & Parking", label: "Fuel & Parking" },
  { value: "Transport", label: "Transport" },
  { value: "Shopping", label: "Shopping" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Bills & Recharge", label: "Bills & Recharge" },
  { value: "Utilities", label: "Utilities" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Education", label: "Education" },
  { value: "Travel", label: "Travel" },
  { value: "Rent", label: "Rent" },
  { value: "Insurance", label: "Insurance" },
  { value: "Subscriptions", label: "Subscriptions" },
  { value: "Personal Care", label: "Personal Care" },
  { value: "Home & Kitchen", label: "Home & Kitchen" },
  { value: "Electronics", label: "Electronics" },
  { value: "Gifts & Donations", label: "Gifts & Donations" },
  { value: "Taxes & Fees", label: "Taxes & Fees" },
  { value: "Professional Services", label: "Professional Services" },
  { value: "Pets", label: "Pets" },
  { value: "Kids & Baby", label: "Kids & Baby" },
  { value: "Sports & Fitness", label: "Sports & Fitness" },
  { value: "Other", label: "Other" },
];

const INCOME_CATEGORIES = [
  { value: "Salary", label: "Salary / Paycheck" },
  { value: "Freelance", label: "Freelance Income" },
  { value: "Investment", label: "Investment Returns" },
  { value: "Other", label: "Other Income" },
];

function getCategoryIcon(category) {
  const map = {
    "Food & Dining": "restaurant", Groceries: "shopping_cart", "Fuel & Parking": "local_gas_station",
    Transport: "local_taxi", Shopping: "shopping_bag", Entertainment: "movie",
    "Bills & Recharge": "receipt_long", Utilities: "cloud", Healthcare: "local_hospital",
    Education: "school", Travel: "flight", Rent: "home", Insurance: "shield",
    Subscriptions: "subscriptions", "Personal Care": "spa", "Home & Kitchen": "chair",
    Electronics: "devices", "Gifts & Donations": "redeem", "Taxes & Fees": "gavel",
    "Professional Services": "work", Pets: "pets", "Kids & Baby": "child_care",
    "Sports & Fitness": "fitness_center", Salary: "payments", Freelance: "work",
    Investment: "trending_up", Other: "receipt_long",
  };
  return map[category] || "receipt_long";
}

function getConfidenceBadge(conf) {
  if (conf >= 0.8) return { label: "High", color: "text-emerald-700 bg-emerald-50" };
  if (conf >= 0.5) return { label: "Medium", color: "text-amber-700 bg-amber-50" };
  return { label: "Low", color: "text-rose-700 bg-rose-50" };
}

function parseLineItems(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function localTransactionsKey(userId) {
  return `aura_transactions_${userId}`;
}

function getLocalTransactions(userId) {
  try {
    return JSON.parse(localStorage.getItem(localTransactionsKey(userId)) || "[]");
  } catch {
    return [];
  }
}

function saveLocalTransaction(userId, transaction) {
  const transactions = [transaction, ...getLocalTransactions(userId)];
  localStorage.setItem(localTransactionsKey(userId), JSON.stringify(transactions));
  return transactions;
}

function updateLocalTransaction(userId, transaction) {
  const transactions = getLocalTransactions(userId).map((item) =>
    item.id === transaction.id ? { ...item, ...transaction } : item
  );
  localStorage.setItem(localTransactionsKey(userId), JSON.stringify(transactions));
  return transactions;
}

function pinnedTransactionsKey(userId) {
  return `aura_pinned_transactions_${userId}`;
}

function getPinnedTransactions(userId) {
  try {
    const pinned = JSON.parse(localStorage.getItem(pinnedTransactionsKey(userId)) || "[]");
    return Array.isArray(pinned) ? pinned.map(String) : [];
  } catch {
    return [];
  }
}

function sortTransactions(transactions, pinnedIds) {
  return [...transactions].sort((a, b) => {
    const aPinned = pinnedIds.includes(String(a.id));
    const bPinned = pinnedIds.includes(String(b.id));
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    return new Date(b.created_at || b.expense_date || b.date) - new Date(a.created_at || a.expense_date || a.date);
  });
}

export default function TransactionsPage() {
  const user = getCurrentUser();
  const userId = user?.id || "";
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState("manual");
  const [modalOpen, setModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterCategory, setFilterCategory] = useState("");
  const [pinnedIds, setPinnedIds] = useState(() => getPinnedTransactions(userId));

  const [merchantName, setMerchantName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [transactionType, setTransactionType] = useState("expense");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [savingManual, setSavingManual] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [viewDetailTransaction, setViewDetailTransaction] = useState(null);
  const [receiptPreviewError, setReceiptPreviewError] = useState(false);
  const [receiptPreviewLoading, setReceiptPreviewLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCategories().then((data) => {
      if (data?.success && data?.categories) {
        setDynamicCategories(data.categories);
      }
    }).catch(() => {});
  }, []);

  const expenseCategories = dynamicCategories.length > 0
    ? dynamicCategories.filter((c) => c.value !== "Salary" && c.value !== "Investment")
    : EXPENSE_CATEGORIES;
  const incomeCategories = dynamicCategories.length > 0
    ? dynamicCategories.filter((c) => c.value === "Salary" || c.value === "Investment" || c.value === "Other")
    : INCOME_CATEGORIES;

  const fetchExpenses = useCallback(async (signal) => {
    if (!userId) return;
    setLoading(true);
    try {
      const loadAll = Boolean(searchQuery.trim() || filterCategory || pinnedIds.length > 0);
      const expenseLimit = loadAll ? 100 : 20;
      const params = new URLSearchParams({
        user_id: userId,
        page: String(loadAll ? 1 : page),
        limit: String(expenseLimit),
      });
      const [expenseRes, transactionRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/expenses?${params}`, { signal }),
        fetch(`${apiBaseUrl}/api/transactions?user_id=${encodeURIComponent(userId)}`, { signal }),
      ]);
      const expenseData = await expenseRes.json();
      const transactionData = await transactionRes.json();
      if (!expenseRes.ok) {
        throw new Error(expenseData.detail || expenseData.error?.message || "Could not load expenses.");
      }

      let receiptData = expenseData.expenses || [];
      if (loadAll && Number(expenseData.total) > expenseLimit) {
        const pageCount = Math.ceil(Number(expenseData.total) / expenseLimit);
        const remainingPages = await Promise.all(
          Array.from({ length: pageCount - 1 }, async (_, index) => {
            const nextParams = new URLSearchParams(params);
            nextParams.set("page", String(index + 2));
            const response = await fetch(`${apiBaseUrl}/api/expenses?${nextParams}`, { signal });
            const data = await response.json();
            if (!response.ok) {
              throw new Error(data.detail || data.error?.message || "Could not load all matching expenses.");
            }
            return data.expenses || [];
          })
        );
        receiptData = [...receiptData, ...remainingPages.flat()];
      }

      const manualTransactions = Array.isArray(transactionData)
        ? transactionData.map((tx) => ({
            ...tx,
            amount: tx.type === "income" ? Math.abs(Number(tx.amount)) : -Math.abs(Number(tx.amount)),
            expense_date: tx.date,
            source: "manual",
          }))
        : getLocalTransactions(userId).map((tx) => ({
            ...tx,
            amount: tx.type === "income" ? Math.abs(Number(tx.amount)) : -Math.abs(Number(tx.amount)),
            expense_date: tx.date,
            source: "manual",
          }));
      const storedTransactions = Array.isArray(transactionData) ? manualTransactions : getLocalTransactions(userId);
      if (expenseData.success || Array.isArray(expenseData.expenses) || storedTransactions.length > 0) {
        const receiptExpenses = receiptData.map((exp) => ({
          ...exp,
          line_items: parseLineItems(exp.line_items),
        }));
        setExpenses(sortTransactions([...manualTransactions, ...receiptExpenses], getPinnedTransactions(userId)));
        setTotal((expenseData.total || 0) + storedTransactions.length);
      }
    } catch (err) {
      if (!signal.aborted) console.error("Failed to fetch expenses:", err);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [userId, page, filterCategory, apiBaseUrl, searchQuery, pinnedIds]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => fetchExpenses(controller.signal), searchQuery.trim() ? 300 : 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchExpenses, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const hasActiveFilter = Boolean(searchQuery.trim() || filterCategory);
  const handleTogglePinned = (transaction) => {
    const id = String(transaction.id);
    const nextPinnedIds = pinnedIds.includes(id)
      ? pinnedIds.filter((pinnedId) => pinnedId !== id)
      : [...pinnedIds, id];

    try {
      localStorage.setItem(pinnedTransactionsKey(userId), JSON.stringify(nextPinnedIds));
      setPinnedIds(nextPinnedIds);
      setExpenses((current) => sortTransactions(current, nextPinnedIds));
      setPage(1);
      setUploadError("");
    } catch (error) {
      setUploadError(error.message || "Could not update pinned transactions.");
    }
  };
  const filteredExpenses = hasActiveFilter
    ? expenses.filter((e) =>
        (!filterCategory || e.category === filterCategory) &&
        [
          e.merchant,
          e.category,
          e.description,
          e.expense_date,
          e.date,
          e.amount,
          e.source,
          ...parseLineItems(e.line_items).flatMap((item) => [
            item?.name,
            item?.description,
          ]),
        ].some((field) =>
          String(field ?? "").toLowerCase().includes(searchQuery.trim().toLowerCase())
        )
      )
    : expenses;
  const displayedExpenses = hasActiveFilter
    ? filteredExpenses.slice((page - 1) * 20, page * 20)
    : pinnedIds.length > 0
      ? filteredExpenses.slice((page - 1) * 20, page * 20)
    : filteredExpenses;
  const resultCount = hasActiveFilter ? filteredExpenses.length : total;

  const handleSearchChange = (value) => {
    setPage(1);
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (value.trim()) nextParams.set("q", value);
      else nextParams.delete("q");
      return nextParams;
    }, { replace: true });
  };

  const openReceiptPreview = async (transaction) => {
    setViewDetailTransaction({ ...transaction, line_items: parseLineItems(transaction.line_items) });
    setReceiptPreviewError(false);
    setReceiptPreviewLoading(true);

    try {
      const params = new URLSearchParams({
        user_id: userId,
        page: String(page),
        limit: "20",
      });
      if (filterCategory) params.append("category", filterCategory);

      const response = await fetch(`${apiBaseUrl}/api/expenses?${params}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.detail || "Failed to refresh the receipt URL");
      }

      const refreshedTransaction = data.expenses?.find(
        (expense) => String(expense.id) === String(transaction.id)
      );
      if (refreshedTransaction?.receipt_url) {
        setViewDetailTransaction({ ...refreshedTransaction, line_items: parseLineItems(refreshedTransaction.line_items) });
      } else if (!transaction.receipt_url) {
        setReceiptPreviewError(true);
      }
    } catch (error) {
      console.error("Failed to refresh receipt preview:", error);
      if (!transaction.receipt_url) setReceiptPreviewError(true);
    } finally {
      setReceiptPreviewLoading(false);
    }
  };

  const resetManualForm = () => {
    setMerchantName(""); setAmount(""); setDate(""); setTransactionType("expense");
    setCategory(""); setNotes(""); setEditingTransaction(null);
  };

  const openAddTransaction = () => {
    resetManualForm();
    setUploadError("");
    setActiveTab("manual");
    setModalOpen(true);
  };

  const openEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setMerchantName(transaction.merchant || transaction.description || "");
    setAmount(String(Math.abs(Number(transaction.amount) || 0)));
    setDate(transaction.date || transaction.expense_date || "");
    setTransactionType(transaction.type || "expense");
    setCategory(transaction.category || "");
    setNotes(transaction.notes || transaction.description || "");
    setUploadError("");
    setActiveTab("manual");
    setModalOpen(true);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setUploadError("");
    if (!userId) {
      setUploadError("Please log in before adding a transaction.");
      return;
    }
    if (!merchantName || !amount || !date || !category) {
      setUploadError("Please complete the description, amount, date, and category.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setUploadError("Enter an amount greater than zero.");
      return;
    }
    const isIncome = transactionType === "income";
    const transactionPayload = {
      user_id: userId, merchant: merchantName, type: isIncome ? "income" : "expense",
      amount: parsedAmount, date, category, notes,
    };

    setSavingManual(true);
    try {
      const isEditing = Boolean(editingTransaction);
      const isLocal = isEditing && String(editingTransaction.id).startsWith("local-");
      if (isLocal) {
        updateLocalTransaction(userId, { ...editingTransaction, ...transactionPayload });
      } else {
        const res = await fetch(`${apiBaseUrl}/api/transactions${isEditing ? `/${encodeURIComponent(editingTransaction.id)}` : ""}`, {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transactionPayload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.details || data.error || `Failed to ${isEditing ? "update" : "save"} transaction`);
      }
      await fetchExpenses();
      setModalOpen(false);
      resetManualForm();
    } catch (err) {
      if (editingTransaction) {
        setUploadError(err.message || "Could not update transaction");
        setSavingManual(false);
        return;
      }
      const localTransaction = {
        id: `local-${Date.now()}`,
        user_id: userId,
        merchant: merchantName.trim(),
        type: isIncome ? "income" : "expense",
        category,
        amount: parsedAmount,
        date,
        notes: notes || null,
        created_at: new Date().toISOString(),
      };
      saveLocalTransaction(userId, localTransaction);
      await fetchExpenses();
      setModalOpen(false);
      resetManualForm();
    } finally {
      setSavingManual(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !userId) return;
    setUploading(true);
    setUploadError("");
    setUploadResult(null);

    const form = new FormData();
    form.append("file", uploadFile);
    form.append("user_id", userId);

    try {
      const res = await fetch(`${apiBaseUrl}/api/expenses/process?user_id=${userId}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.success && data.expense) {
        setUploadResult(data.expense);
        setExpenses((prev) => sortTransactions([data.expense, ...prev], pinnedIds));
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchCategories().then((d) => { if (d?.categories) setDynamicCategories(d.categories); }).catch(() => {});
      } else {
        setUploadError(data.error?.message || "Processing failed. Please try again.");
      }
    } catch (err) {
      setUploadError("Failed to connect to AI service. Is it running?");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTransaction = async (transaction) => {
    if (deletingId) return;
    if (!window.confirm(`Delete ${transaction.merchant || "this transaction"}?`)) return;

    setDeletingId(transaction.id);
    setUploadError("");
    try {
      if (String(transaction.id).startsWith("local-")) {
        const remaining = getLocalTransactions(userId).filter((item) => item.id !== transaction.id);
        localStorage.setItem(localTransactionsKey(userId), JSON.stringify(remaining));
      } else if (transaction.source === "receipt") {
        const response = await fetch(`${apiBaseUrl}/api/expenses/${encodeURIComponent(transaction.id)}?user_id=${encodeURIComponent(userId)}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Could not delete expense");
      } else {
        const response = await fetch(`${apiBaseUrl}/api/transactions/${encodeURIComponent(transaction.id)}?user_id=${encodeURIComponent(userId)}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.details || data.error || "Could not delete transaction");
      }

      setExpenses((current) => current.filter((item) => item.id !== transaction.id));
      if (pinnedIds.includes(String(transaction.id))) {
        const nextPinnedIds = pinnedIds.filter((id) => id !== String(transaction.id));
        setPinnedIds(nextPinnedIds);
        try {
          localStorage.setItem(pinnedTransactionsKey(userId), JSON.stringify(nextPinnedIds));
        } catch (error) {
          setUploadError(error.message || "Could not update pinned transactions.");
        }
      }
      setTotal((current) => Math.max(0, current - 1));
    } catch (error) {
      setUploadError(error.message || "Could not delete transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const totalOutflow = expenses
    .filter((e) => e.source === "receipt" ? Number(e.amount) > 0 : Number(e.amount) < 0)
    .reduce((sum, e) => sum + Math.abs(Number(e.amount)), 0);
  const totalInflow = expenses
    .filter((e) => e.source === "manual" && Number(e.amount) > 0)
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const remainingAmount = totalInflow - totalOutflow;

  return (
    <div className="px-6 lg:px-16 py-8 lg:py-12 max-w-[1280px] w-full mx-auto">
      {/* Header */}
      <div className="mb-12 flex justify-between items-end flex-wrap gap-4">
        <div>
          <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Ledger</p>
          <h2 className="font-display text-display text-primary tracking-tight">Expenses</h2>
          {searchQuery.trim() && (
            <p className="font-sans text-label-md text-on-surface-variant mt-2">
              {filteredExpenses.length} result{filteredExpenses.length === 1 ? "" : "s"} for{" "}
              <span className="text-primary font-semibold">"{searchQuery}"</span>
            </p>
          )}
        </div>
        <button onClick={openAddTransaction} className="btn btn-primary">Add Transaction</button>
      </div>

      <label className="flex items-center gap-3 mb-6 max-w-xl bg-surface-container-high/60 rounded-lg px-4 py-3 border border-outline-variant/40 focus-within:border-primary/50 transition-colors">
        <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          className="bg-transparent border-none outline-none w-full font-sans text-body-md text-primary placeholder:text-on-surface-variant/60"
          placeholder="Search by merchant, category, amount, date..."
          aria-label="Search transactions"
        />
      </label>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        <div className="editorial-card p-6 flex flex-col gap-2">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Total Expenses</span>
          <span className="font-display text-headline-lg text-primary">{total}</span>
        </div>
        <div className="editorial-card p-6 flex flex-col gap-2">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Income / Inflow</span>
          <span className="font-display text-headline-lg text-emerald-700">{formatCurrency(totalInflow)}</span>
        </div>
        <div className="editorial-card p-6 flex flex-col gap-2">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Remaining Amount</span>
          <span className={`font-display text-headline-lg ${remainingAmount >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {formatCurrency(remainingAmount)}
          </span>
        </div>
        <div className="editorial-card p-6 flex flex-col gap-2">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Total Spent</span>
          <span className="font-display text-headline-lg text-rose-700">{formatCurrency(totalOutflow)}</span>
        </div>
        <div className="editorial-card p-6 flex flex-col gap-2">
          <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Receipt Scanned</span>
          <span className="font-display text-headline-lg text-emerald-700">{expenses.filter((e) => e.source === "receipt").length}</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-sans text-label-sm text-on-surface-variant">Filter:</span>
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="bg-transparent border border-outline-variant rounded-lg px-3 py-1.5 font-sans text-body-sm text-primary appearance-none outline-none focus:border-primary"
        >
          <option value="">All categories</option>
          {expenseCategories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <span className="font-sans text-label-sm text-on-surface-variant ml-auto">{resultCount} total</span>
      </div>

      {/* Expense Table */}
      <div className="editorial-card overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-outline-variant/30 bg-surface-container/30 font-sans text-label-sm text-on-surface-variant uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">Merchant</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Source</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center font-sans text-on-surface-variant">Loading...</td></tr>
            ) : displayedExpenses.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-outline block mb-3">receipt_long</span>
                <p className="font-sans text-body-md text-on-surface-variant">No expenses yet. Upload a receipt to get started.</p>
              </td></tr>
            ) : displayedExpenses.map((tx) => {
              const conf = tx.ai_confidence;
              const badge = conf != null ? getConfidenceBadge(conf) : null;
              return (
                <tr key={tx.id} className="border-b border-outline-variant/20 hover:bg-surface-container/30 transition-colors font-sans text-body-md text-primary">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface-variant/80 flex items-center justify-center text-on-surface-variant shrink-0">
                      <span className="material-symbols-outlined text-[18px]">{getCategoryIcon(tx.category)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[200px]">{tx.merchant || tx.description || "Unknown"}</span>
                      {tx.description && tx.merchant && (
                        <span className="text-label-sm text-on-surface-variant truncate max-w-[200px]">{tx.description}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-surface-variant/80 text-on-surface-variant px-3 py-1 rounded-full text-label-sm tracking-wide">{tx.category}</span>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant font-medium whitespace-nowrap">{tx.expense_date || "—"}</td>
                  <td className="px-6 py-4 text-right font-display text-[20px] font-medium whitespace-nowrap text-primary">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-6 py-4">
                    {tx.source === "receipt" ? (
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">auto_awesome</span>
                        {badge && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`}>{badge.label}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-label-sm text-on-surface-variant">Manual</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {tx.source === "receipt" && (
                        <button
                          type="button"
                          onClick={() => openReceiptPreview(tx)}
                          className="btn btn-icon btn-ghost text-primary hover:bg-surface-variant"
                          title="View details"
                          aria-label={`View details for ${tx.merchant || "transaction"}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleTogglePinned(tx)}
                        className={`btn btn-icon btn-ghost ${pinnedIds.includes(String(tx.id)) ? "text-amber-500 hover:bg-amber-50" : "text-on-surface-variant hover:bg-surface-variant"}`}
                        title={pinnedIds.includes(String(tx.id)) ? "Unpin transaction" : "Pin transaction to top"}
                        aria-label={`${pinnedIds.includes(String(tx.id)) ? "Unpin" : "Pin"} ${tx.merchant || "transaction"} ${pinnedIds.includes(String(tx.id)) ? "from" : "to"} the top`}
                        aria-pressed={pinnedIds.includes(String(tx.id))}
                      >
                        <span className="material-symbols-outlined text-[20px]">{pinnedIds.includes(String(tx.id)) ? "star" : "star_outline"}</span>
                      </button>
                      {tx.source === "manual" && (
                        <button
                          type="button"
                          onClick={() => openEditTransaction(tx)}
                          className="btn btn-icon btn-ghost text-primary hover:bg-surface-variant"
                          title="Edit transaction"
                          aria-label={`Edit ${tx.merchant || "transaction"}`}
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteTransaction(tx)}
                        disabled={deletingId === tx.id}
                        className="btn btn-icon btn-ghost text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        title="Delete transaction"
                        aria-label={`Delete ${tx.merchant || "transaction"}`}
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {resultCount > 20 && (
        <div className="flex justify-center gap-4 mt-6">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn btn-outline btn-sm disabled:opacity-40">Prev</button>
          <span className="font-sans text-label-sm text-on-surface-variant self-center">Page {page} of {Math.ceil(resultCount / 20)}</span>
          <button disabled={page * 20 >= resultCount} onClick={() => setPage((p) => p + 1)} className="btn btn-outline btn-sm disabled:opacity-40">Next</button>
        </div>
      )}

      {/* Slide-over Modal */}
      {modalOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setModalOpen(false)} />}
      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-50 transform transition-transform duration-300 border-l border-outline-variant/30 flex flex-col ${modalOpen ? "translate-x-0" : "translate-x-full"}`}>
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface shrink-0">
          <div>
            <h2 className="font-sans text-headline-md text-primary">{editingTransaction ? "Edit Transaction" : "New Transaction"}</h2>
            <p className="font-sans text-label-sm text-on-surface-variant mt-1">{editingTransaction ? "Update the transaction details" : "Upload receipt or enter manually"}</p>
          </div>
          <button className="btn btn-icon btn-ghost shrink-0" onClick={() => setModalOpen(false)}>
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-4 flex gap-4 border-b border-outline-variant/30 shrink-0">
          {[
            { key: "receipt", label: "Upload Receipt", icon: "upload_file" },
            { key: "manual", label: "Manual Entry", icon: "edit" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`font-sans text-label-sm pb-3 flex items-center gap-1.5 transition-colors font-semibold border-b-2 ${
                activeTab === tab.key ? "text-primary border-primary" : "text-on-surface-variant border-transparent hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {/* UPLOAD RECEIPT TAB */}
          {activeTab === "receipt" && (
            <div className="space-y-6">
              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setUploadFile(f); }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  uploadFile ? "border-primary bg-primary/5" : "border-outline-variant hover:border-primary/50 hover:bg-surface-container/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files[0]; if (f) setUploadFile(f); }}
                />
                {uploadFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-[40px] text-primary">description</span>
                    <p className="font-sans text-body-md text-primary font-medium">{uploadFile.name}</p>
                    <p className="font-sans text-label-sm text-on-surface-variant">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-label-sm text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant">cloud_upload</span>
                    <p className="font-sans text-body-md text-primary font-medium">Drop receipt here or click to browse</p>
                    <p className="font-sans text-label-sm text-on-surface-variant">PDF, JPG, PNG, WEBP — max 10 MB</p>
                  </div>
                )}
              </div>

              {/* Upload button */}
              <button
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                className="btn btn-primary btn-block disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    Processing receipt...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    Scan & Extract Expense
                  </span>
                )}
              </button>

              {/* Processing steps */}
              {uploading && (
                <div className="bg-surface-container/50 rounded-xl p-4 space-y-3">
                  {["OCR text extraction (RapidOCR)", "AI expense mapping (LLM)", "Validation & storage"].map((step, i) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px] text-primary animate-pulse">radio_button_checked</span>
                      <span className="font-sans text-body-sm text-on-surface-variant">{step}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Success */}
              {uploadResult && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[20px] text-emerald-700">check_circle</span>
                    <p className="font-sans text-body-md text-emerald-800 font-semibold">Expense added</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-sans text-body-sm">
                    <span className="text-on-surface-variant">Merchant:</span><span className="text-primary font-medium">{uploadResult.merchant || "—"}</span>
                    <span className="text-on-surface-variant">Amount:</span><span className="text-primary font-medium">{formatCurrency(uploadResult.amount)}</span>
                    <span className="text-on-surface-variant">Category:</span><span className="text-primary font-medium">{uploadResult.category}</span>
                    <span className="text-on-surface-variant">Date:</span><span className="text-primary font-medium">{uploadResult.expense_date || "—"}</span>
                    {uploadResult.payment_method && (
                      <>
                        <span className="text-on-surface-variant">Payment:</span>
                        <span className="text-primary font-medium">{uploadResult.payment_method_detail || uploadResult.payment_method}</span>
                      </>
                    )}
                    {uploadResult.gst_amount != null && (
                      <>
                        <span className="text-on-surface-variant">GST:</span>
                        <span className="text-primary font-medium">{formatCurrency(uploadResult.gst_amount)} ({uploadResult.gst_percent || uploadResult.tax_rate || "—"}%)</span>
                      </>
                    )}
                    {uploadResult.line_items?.length > 0 && (
                      <>
                        <span className="text-on-surface-variant">Items:</span>
                        <span className="text-primary font-medium">{uploadResult.line_items.length} line items</span>
                      </>
                    )}
                    {uploadResult.ai_confidence != null && (
                      <>
                        <span className="text-on-surface-variant">Confidence:</span>
                        <span className={`font-medium ${uploadResult.ai_confidence >= 0.8 ? "text-emerald-700" : uploadResult.ai_confidence >= 0.5 ? "text-amber-700" : "text-rose-700"}`}>
                          {(uploadResult.ai_confidence * 100).toFixed(0)}%
                        </span>
                      </>
                    )}
                    {uploadResult.duplicate_detected && (
                      <p className="col-span-2 text-label-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 mt-1">
                        Possible duplicate expense detected.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Error */}
              {uploadError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-rose-700 mt-0.5">error</span>
                  <p className="font-sans text-body-sm text-rose-800">{uploadError}</p>
                </div>
              )}
            </div>
          )}

          {/* MANUAL ENTRY TAB */}
          {activeTab === "manual" && (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Source / Description</label>
                <input type="text" required value={merchantName} onChange={(e) => setMerchantName(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary placeholder:text-outline transition-colors outline-none"
                  placeholder="e.g. Swiggy, Amazon" />
              </div>
              <div className="space-y-2">
                <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Transaction Type</label>
                <select value={transactionType} onChange={(e) => { setTransactionType(e.target.value); setCategory(""); }}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary appearance-none outline-none">
                  <option value="expense">Expense</option>
                  <option value="income">Income / Inflow</option>
                </select>
              </div>
              <div className="flex gap-6 flex-wrap sm:flex-nowrap">
                <div className="space-y-2 flex-1 min-w-[120px]">
                  <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Amount</label>
                  <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary placeholder:text-outline transition-colors outline-none"
                    placeholder="0.00" />
                </div>
                <div className="space-y-2 flex-1 min-w-[120px]">
                  <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Date</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary transition-colors outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Category</label>
                <select required value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary appearance-none outline-none">
                  <option value="" disabled>Select category...</option>
                  {(transactionType === "income" ? incomeCategories : expenseCategories).map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 flex-1">
                <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Notes (Optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary px-0 py-2 font-sans text-body-md text-primary placeholder:text-outline transition-colors outline-none resize-none"
                  placeholder="Add details..." rows="2" />
              </div>
              {uploadError && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[20px] text-rose-700">error</span>
                  <p className="font-sans text-body-sm text-rose-800">{uploadError}</p>
                </div>
              )}
              <div className="pt-6 border-t border-outline-variant/30 flex gap-4 mt-auto">
                <button type="button" onClick={() => { setModalOpen(false); resetManualForm(); }} className="btn btn-outline flex-1">Cancel</button>
                <button type="submit" disabled={savingManual} className="btn btn-primary flex-1 disabled:opacity-50">{savingManual ? (editingTransaction ? "Updating..." : "Saving...") : (editingTransaction ? "Update" : "Add")}</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {viewDetailTransaction && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setViewDetailTransaction(null)} />
      )}
      {viewDetailTransaction && (
        <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-surface shadow-2xl z-50 transform transition-transform duration-300 border-l border-outline-variant/30 flex flex-col translate-x-0">
          <div className="px-8 py-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface shrink-0">
            <div>
              <h2 className="font-sans text-headline-md text-primary">Expense Details</h2>
              <p className="font-sans text-label-sm text-on-surface-variant mt-1">{viewDetailTransaction.merchant || "Receipt expense"}</p>
            </div>
            <button className="btn btn-icon btn-ghost shrink-0" onClick={() => setViewDetailTransaction(null)}>
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
            <div className="editorial-card p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Uploaded Receipt</h3>
                {viewDetailTransaction.receipt_url && (
                  <a
                    href={viewDetailTransaction.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-sans text-label-sm text-primary underline"
                  >
                    Open in new tab
                  </a>
                )}
              </div>
              {receiptPreviewLoading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  <span className="font-sans text-body-sm">Loading receipt...</span>
                </div>
              ) : viewDetailTransaction.receipt_url ? receiptPreviewError ? (
                <p className="font-sans text-body-sm text-rose-700">
                  The receipt preview could not be loaded. Try opening it in a new tab.
                </p>
              ) : (
                /\.pdf(?:$|[?#])/i.test(viewDetailTransaction.receipt_url) ? (
                  <iframe
                    src={viewDetailTransaction.receipt_url}
                    title={`Receipt for ${viewDetailTransaction.merchant || "expense"}`}
                    className="w-full h-[70vh] rounded-lg border border-outline-variant/30"
                  />
                ) : (
                  <img
                    src={viewDetailTransaction.receipt_url}
                    alt={`Receipt for ${viewDetailTransaction.merchant || "expense"}`}
                    className="w-full max-h-[70vh] min-h-48 object-contain rounded-lg bg-surface-container"
                    onError={() => setReceiptPreviewError(true)}
                  />
                )
              ) : (
                <p className="font-sans text-body-sm text-on-surface-variant">
                  No receipt file was saved for this transaction. Upload the receipt again to view it here.
                </p>
              )}
            </div>

            {/* Basic Info */}
            <div className="editorial-card p-5 space-y-4">
              <h3 className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-sans text-label-sm text-on-surface-variant">Merchant</p>
                  <p className="font-sans text-body-md text-primary font-medium">{viewDetailTransaction.merchant || "—"}</p>
                </div>
                <div>
                  <p className="font-sans text-label-sm text-on-surface-variant">Category</p>
                  <p className="font-sans text-body-md text-primary font-medium">{viewDetailTransaction.category}</p>
                </div>
                <div>
                  <p className="font-sans text-label-sm text-on-surface-variant">Amount</p>
                  <p className="font-display text-headline-md text-primary">{formatCurrency(viewDetailTransaction.amount)}</p>
                </div>
                <div>
                  <p className="font-sans text-label-sm text-on-surface-variant">Date</p>
                  <p className="font-sans text-body-md text-primary">{viewDetailTransaction.expense_date || "—"}</p>
                </div>
                <div>
                  <p className="font-sans text-label-sm text-on-surface-variant">Payment Method</p>
                  <p className="font-sans text-body-md text-primary">{viewDetailTransaction.payment_method_detail || viewDetailTransaction.payment_method || "—"}</p>
                </div>
                <div>
                  <p className="font-sans text-label-sm text-on-surface-variant">Source</p>
                  <p className="font-sans text-body-md text-primary">Receipt (AI Extracted)</p>
                </div>
                {viewDetailTransaction.description && (
                  <div className="col-span-2">
                    <p className="font-sans text-label-sm text-on-surface-variant">Description</p>
                    <p className="font-sans text-body-md text-primary">{viewDetailTransaction.description}</p>
                  </div>
                )}
                {viewDetailTransaction.invoice_number && (
                  <div>
                    <p className="font-sans text-label-sm text-on-surface-variant">Invoice #</p>
                    <p className="font-sans text-body-md text-primary">{viewDetailTransaction.invoice_number}</p>
                  </div>
                )}
                {viewDetailTransaction.vendor_gstin && (
                  <div>
                    <p className="font-sans text-label-sm text-on-surface-variant">Vendor GSTIN</p>
                    <p className="font-sans text-body-md text-primary">{viewDetailTransaction.vendor_gstin}</p>
                  </div>
                )}
                {viewDetailTransaction.receipt_number && (
                  <div>
                    <p className="font-sans text-label-sm text-on-surface-variant">Receipt #</p>
                    <p className="font-sans text-body-md text-primary">{viewDetailTransaction.receipt_number}</p>
                  </div>
                )}
                {viewDetailTransaction.store_address && (
                  <div className="col-span-2">
                    <p className="font-sans text-label-sm text-on-surface-variant">Store Address</p>
                    <p className="font-sans text-body-md text-primary">{viewDetailTransaction.store_address}</p>
                  </div>
                )}
                {viewDetailTransaction.store_phone && (
                  <div>
                    <p className="font-sans text-label-sm text-on-surface-variant">Store Phone</p>
                    <p className="font-sans text-body-md text-primary">{viewDetailTransaction.store_phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* GST Details */}
            {(viewDetailTransaction.gst_amount != null ||
              viewDetailTransaction.gst_percent != null ||
              viewDetailTransaction.cgst != null ||
              viewDetailTransaction.sgst != null ||
              viewDetailTransaction.igst != null ||
              viewDetailTransaction.subtotal != null) && (
              <div className="editorial-card p-5 space-y-4">
                <h3 className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">GST Breakdown</h3>
                <div className="grid grid-cols-2 gap-4">
                  {viewDetailTransaction.subtotal != null && (
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant">Subtotal</p>
                      <p className="font-sans text-body-md text-primary">{formatCurrency(viewDetailTransaction.subtotal)}</p>
                    </div>
                  )}
                  {viewDetailTransaction.gst_amount != null && (
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant">Total GST</p>
                      <p className="font-sans text-body-md text-primary">{formatCurrency(viewDetailTransaction.gst_amount)}</p>
                    </div>
                  )}
                  {viewDetailTransaction.gst_percent != null && (
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant">GST Rate</p>
                      <p className="font-sans text-body-md text-primary">{viewDetailTransaction.gst_percent}%</p>
                    </div>
                  )}
                  {viewDetailTransaction.cgst != null && (
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant">CGST</p>
                      <p className="font-sans text-body-md text-primary">{formatCurrency(viewDetailTransaction.cgst)}</p>
                    </div>
                  )}
                  {viewDetailTransaction.sgst != null && (
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant">SGST</p>
                      <p className="font-sans text-body-md text-primary">{formatCurrency(viewDetailTransaction.sgst)}</p>
                    </div>
                  )}
                  {viewDetailTransaction.igst != null && (
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant">IGST</p>
                      <p className="font-sans text-body-md text-primary">{formatCurrency(viewDetailTransaction.igst)}</p>
                    </div>
                  )}
                  {viewDetailTransaction.tax_rate != null && (
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant">Effective Tax Rate</p>
                      <p className="font-sans text-body-md text-primary">{viewDetailTransaction.tax_rate}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Line Items */}
            {viewDetailTransaction.line_items && viewDetailTransaction.line_items.length > 0 && (
              <div className="editorial-card p-5 space-y-4">
                <h3 className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Line Items ({viewDetailTransaction.line_items.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[400px]">
                    <thead>
                      <tr className="border-b border-outline-variant/30 font-sans text-label-sm text-on-surface-variant uppercase tracking-wider">
                        <th className="px-4 py-2 font-semibold">Item</th>
                        <th className="px-4 py-2 font-semibold text-right">Qty</th>
                        <th className="px-4 py-2 font-semibold text-right">Unit Price</th>
                        <th className="px-4 py-2 font-semibold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewDetailTransaction.line_items.map((item, idx) => (
                        <tr key={idx} className="border-b border-outline-variant/20 font-sans text-body-sm text-primary">
                          <td className="px-4 py-2">{item.name}</td>
                          <td className="px-4 py-2 text-right">{item.quantity || 1}</td>
                          <td className="px-4 py-2 text-right">{item.unit_price != null ? formatCurrency(item.unit_price) : "—"}</td>
                          <td className="px-4 py-2 text-right font-medium">{item.total != null ? formatCurrency(item.total) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Extras */}
            {(viewDetailTransaction.tip_amount != null ||
              viewDetailTransaction.discount_amount != null ||
              viewDetailTransaction.total_items != null) && (
              <div className="editorial-card p-5 space-y-4">
                <h3 className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Additional Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {viewDetailTransaction.tip_amount != null && (
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant">Tip</p>
                      <p className="font-sans text-body-md text-primary">{formatCurrency(viewDetailTransaction.tip_amount)}</p>
                    </div>
                  )}
                  {viewDetailTransaction.discount_amount != null && (
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant">Discount</p>
                      <p className="font-sans text-body-md text-primary">{formatCurrency(viewDetailTransaction.discount_amount)}</p>
                    </div>
                  )}
                  {viewDetailTransaction.total_items != null && (
                    <div>
                      <p className="font-sans text-label-sm text-on-surface-variant">Total Items</p>
                      <p className="font-sans text-body-md text-primary">{viewDetailTransaction.total_items}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confidence & Metadata */}
            <div className="editorial-card p-5 space-y-4">
              <h3 className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">AI Processing</h3>
              <div className="grid grid-cols-2 gap-4">
                {viewDetailTransaction.ai_confidence != null && (
                  <div>
                    <p className="font-sans text-label-sm text-on-surface-variant">AI Confidence</p>
                    <p className={`font-sans text-body-md font-medium ${viewDetailTransaction.ai_confidence >= 0.8 ? "text-emerald-700" : viewDetailTransaction.ai_confidence >= 0.5 ? "text-amber-700" : "text-rose-700"}`}>
                      {(viewDetailTransaction.ai_confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
                {viewDetailTransaction.duplicate_detected && (
                  <div className="col-span-2">
                    <p className="font-sans text-label-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">
                      Possible duplicate expense detected.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
