import React, { useCallback, useEffect, useState } from "react";
import { getCurrentUser } from "../auth";
import { formatCurrency } from "../utils/currency";

const INVESTMENT_TYPES = ["Stock", "Mutual Fund", "ETF", "Bond", "Fixed Deposit", "Crypto", "Other"];

function investmentsStorageKey(userId) {
  return `aura_investments_${userId}`;
}

function getLocalInvestments(userId) {
  try {
    return JSON.parse(localStorage.getItem(investmentsStorageKey(userId)) || "[]");
  } catch {
    return [];
  }
}

function saveLocalInvestment(userId, investment) {
  const investments = [investment, ...getLocalInvestments(userId)];
  localStorage.setItem(investmentsStorageKey(userId), JSON.stringify(investments));
  return investments;
}

export default function InvestmentsPage() {
  const userId = getCurrentUser()?.id || "";
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", type: "Stock", quantity: "1", investedAmount: "", currentValue: "", purchaseDate: "", notes: "" });

  const fetchInvestments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/investments?user_id=${encodeURIComponent(userId)}`);
      if (response.ok) {
        setInvestments(await response.json());
      } else {
        setInvestments(getLocalInvestments(userId));
      }
    } catch {
      setInvestments(getLocalInvestments(userId));
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, userId]);

  useEffect(() => { fetchInvestments(); }, [fetchInvestments]);

  const updateField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) {
      setError("Please log in before adding an investment.");
      return;
    }
    const quantity = Number(form.quantity || 1);
    const investedAmount = Number(form.investedAmount);
    const currentValue = Number(form.currentValue);
    if (!form.name.trim() || !form.purchaseDate || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(investedAmount) || investedAmount <= 0 || !Number.isFinite(currentValue) || currentValue < 0) {
      setError("Enter a name, date, positive quantity, invested amount, and current value.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/investments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId, name: form.name, type: form.type, quantity,
          invested_amount: investedAmount, current_value: currentValue,
          purchase_date: form.purchaseDate, notes: form.notes,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save investment");
      setInvestments((current) => [data, ...current]);
      setForm({ name: "", type: "Stock", quantity: "1", investedAmount: "", currentValue: "", purchaseDate: "", notes: "" });
      setFormOpen(false);
    } catch (err) {
      const localInvestment = {
        id: `local-investment-${Date.now()}`,
        user_id: userId,
        name: form.name.trim(),
        type: form.type,
        quantity,
        invested_amount: investedAmount,
        current_value: currentValue,
        purchase_date: form.purchaseDate,
        notes: form.notes || null,
        created_at: new Date().toISOString(),
      };
      saveLocalInvestment(userId, localInvestment);
      setInvestments((current) => [localInvestment, ...current]);
      setForm({ name: "", type: "Stock", quantity: "1", investedAmount: "", currentValue: "", purchaseDate: "", notes: "" });
      setFormOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const removeInvestment = async (id) => {
    if (id.startsWith("local-investment-")) {
      const remaining = getLocalInvestments(userId).filter((investment) => investment.id !== id);
      localStorage.setItem(investmentsStorageKey(userId), JSON.stringify(remaining));
      setInvestments((current) => current.filter((investment) => investment.id !== id));
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl}/api/investments/${id}?user_id=${encodeURIComponent(userId)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete investment");
      setInvestments((current) => current.filter((investment) => investment.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const investedTotal = investments.reduce((sum, investment) => sum + Number(investment.invested_amount), 0);
  const currentTotal = investments.reduce((sum, investment) => sum + Number(investment.current_value), 0);
  const gain = currentTotal - investedTotal;

  return (
    <div className="px-6 lg:px-16 py-8 lg:py-12 max-w-[1280px] w-full mx-auto">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Portfolio</p>
          <h2 className="font-display text-display text-primary tracking-tight">My Investments</h2>
          <p className="font-sans text-body-md text-on-surface-variant mt-2">Track the investments you add to your account.</p>
        </div>
        <button onClick={() => { setError(""); setFormOpen(true); }} className="btn btn-primary">Add Investment</button>
      </div>

      {error && <p className="mb-6 rounded-lg bg-rose-50 px-4 py-3 font-sans text-body-sm text-rose-800">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="editorial-card p-6"><span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Invested</span><p className="font-display text-headline-lg text-primary mt-2">{formatCurrency(investedTotal)}</p></div>
        <div className="editorial-card p-6"><span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Current Value</span><p className="font-display text-headline-lg text-primary mt-2">{formatCurrency(currentTotal)}</p></div>
        <div className="editorial-card p-6"><span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Gain / Loss</span><p className={`font-display text-headline-lg mt-2 ${gain >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatCurrency(gain)}</p></div>
      </div>

      {loading ? <p className="py-12 text-center font-sans text-on-surface-variant">Loading investments...</p> : investments.length === 0 ? (
        <div className="editorial-card p-12 text-center"><span className="material-symbols-outlined text-[48px] text-on-surface-variant">trending_up</span><h3 className="font-display text-headline-md text-primary mt-4">Your portfolio is empty</h3><p className="font-sans text-body-md text-on-surface-variant mt-2">Add your first investment to start tracking its value.</p></div>
      ) : (
        <div className="editorial-card overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead><tr className="border-b border-outline-variant/30 font-sans text-label-sm text-on-surface-variant uppercase tracking-wider"><th className="px-6 py-4">Investment</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Purchased</th><th className="px-6 py-4 text-right">Invested</th><th className="px-6 py-4 text-right">Current Value</th><th className="px-6 py-4"></th></tr></thead><tbody>{investments.map((investment) => <tr key={investment.id} className="border-b border-outline-variant/20 font-sans text-body-md text-primary"><td className="px-6 py-4 font-medium">{investment.name}<span className="block text-label-sm text-on-surface-variant">{investment.quantity} units</span></td><td className="px-6 py-4">{investment.type}</td><td className="px-6 py-4 text-on-surface-variant">{investment.purchase_date}</td><td className="px-6 py-4 text-right">{formatCurrency(investment.invested_amount)}</td><td className="px-6 py-4 text-right font-medium">{formatCurrency(investment.current_value)}</td><td className="px-6 py-4 text-right"><button onClick={() => removeInvestment(investment.id)} className="text-label-sm text-rose-600 hover:underline">Delete</button></td></tr>)}</tbody></table></div>
      )}

      {formOpen && <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setFormOpen(false)} />}
      <div className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-outline-variant/30 bg-surface shadow-2xl transition-transform ${formOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-8 py-6"><h2 className="font-sans text-headline-md text-primary">Add Investment</h2><button className="btn btn-icon btn-ghost" onClick={() => setFormOpen(false)}><span className="material-symbols-outlined">close</span></button></div>
        <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto px-8 py-8">
          <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Name<input required value={form.name} onChange={updateField("name")} className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 font-sans text-body-md text-primary outline-none focus:border-primary" placeholder="e.g. Reliance Industries" /></label>
          <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Type<select value={form.type} onChange={updateField("type")} className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 font-sans text-body-md text-primary outline-none">{INVESTMENT_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
          <div className="flex gap-6"><label className="flex-1 font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Quantity<input required min="0" step="any" type="number" value={form.quantity} onChange={updateField("quantity")} className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 text-primary outline-none" /></label><label className="flex-1 font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Purchase Date<input required type="date" value={form.purchaseDate} onChange={updateField("purchaseDate")} className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 text-primary outline-none" /></label></div>
          <div className="flex gap-6"><label className="flex-1 font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Invested Amount<input required min="0" step="0.01" type="number" value={form.investedAmount} onChange={updateField("investedAmount")} className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 text-primary outline-none" /></label><label className="flex-1 font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Current Value<input required min="0" step="0.01" type="number" value={form.currentValue} onChange={updateField("currentValue")} className="mt-2 w-full border-b border-outline-variant bg-transparent py-2 text-primary outline-none" /></label></div>
          <label className="block font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Notes<textarea value={form.notes} onChange={updateField("notes")} rows="3" className="mt-2 w-full resize-none border-b border-outline-variant bg-transparent py-2 text-primary outline-none focus:border-primary" /></label>
          <button disabled={saving} type="submit" className="btn btn-primary btn-block disabled:opacity-50">{saving ? "Saving..." : "Save Investment"}</button>
        </form>
      </div>
    </div>
  );
}