import React, { useCallback, useEffect, useState } from "react";
import CategoryCard from "../components/ui/CategoryCard";
import SpendingChart from "../components/ui/SpendingChart";
import DonutChart from "../components/ui/DonutChart";
import { getCurrentUser } from "../auth";
import { formatCurrency } from "../utils/currency";
import { jsPDF } from "jspdf";

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

const typeIcons = {
  Stock: "candlestick_chart",
  "Mutual Fund": "pie_chart",
  ETF: "monitoring",
  Bond: "account_balance",
  "Fixed Deposit": "savings",
  Crypto: "currency_bitcoin",
  Other: "account_balance_wallet",
};

function formatPdfCurrency(value, currency) {
  return `${currency} ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function ReportsPage() {
  const userId = getCurrentUser()?.id || "";
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchInvestments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/investments?user_id=${encodeURIComponent(userId)}`);
      setInvestments(response.ok ? await response.json() : getLocalInvestments(userId));
    } catch {
      setInvestments(getLocalInvestments(userId));
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, userId]);

  useEffect(() => { fetchInvestments(); }, [fetchInvestments]);

  const grouped = investments.reduce((groups, investment) => {
    const type = investment.type || "Other";
    const group = groups[type] || { type, invested: 0, valuation: 0 };
    group.invested += Number(investment.invested_amount) || 0;
    group.valuation += Number(investment.current_value) || 0;
    groups[type] = group;
    return groups;
  }, {});
  const portfolio = Object.values(grouped);
  const totalInvested = portfolio.reduce((sum, item) => sum + item.invested, 0);
  const totalValue = portfolio.reduce((sum, item) => sum + item.valuation, 0);
  const totalGain = totalValue - totalInvested;
  const categories = portfolio.map((item, index) => ({
    ...item,
    id: item.type,
    percentage: totalValue ? `${((item.valuation / totalValue) * 100).toFixed(1)}%` : "0%",
    trend: `${item.valuation >= item.invested ? "+" : ""}${(item.invested ? ((item.valuation - item.invested) / item.invested) * 100 : 0).toFixed(1)}% return`,
    icon: typeIcons[item.type] || typeIcons.Other,
    isLarge: index === 0,
    isDark: index === portfolio.length - 1 && portfolio.length > 2,
  }));

  const handleExportPdf = () => {
    if (exporting || portfolio.length === 0) return;

    setExporting(true);
    try {
      const currency = getCurrentUser()?.currency || "INR";
      const document = new jsPDF();
      const generatedAt = new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      document.setFontSize(22);
      document.setTextColor(31, 41, 55);
      document.text("AURA Finance", 20, 24);
      document.setFontSize(14);
      document.text("Portfolio Analysis", 20, 34);
      document.setFontSize(9);
      document.setTextColor(107, 114, 128);
      document.text(`Generated ${generatedAt}`, 20, 42);

      document.setDrawColor(229, 231, 235);
      document.line(20, 48, 190, 48);
      document.setFontSize(11);
      document.setTextColor(31, 41, 55);
      document.text("Summary", 20, 60);

      const summary = [
        ["Invested", formatPdfCurrency(totalInvested, currency)],
        ["Current value", formatPdfCurrency(totalValue, currency)],
        ["Gain / loss", formatPdfCurrency(totalGain, currency)],
      ];
      summary.forEach(([label, value], index) => {
        const y = 72 + index * 10;
        document.setTextColor(107, 114, 128);
        document.text(label, 20, y);
        document.setTextColor(31, 41, 55);
        document.text(value, 100, y);
      });

      document.setTextColor(31, 41, 55);
      document.text("Allocation by investment type", 20, 112);
      document.setFontSize(9);
      document.setTextColor(107, 114, 128);
      document.text("Type", 20, 122);
      document.text("Invested", 85, 122);
      document.text("Current value", 125, 122);
      document.text("Allocation", 175, 122);

      categories.forEach((item, index) => {
        const y = 132 + index * 9;
        if (y > 275) return;
        document.setTextColor(31, 41, 55);
        document.text(String(item.type).slice(0, 25), 20, y);
        document.text(formatPdfCurrency(item.invested, currency), 85, y);
        document.text(formatPdfCurrency(item.valuation, currency), 125, y);
        document.text(item.percentage, 175, y);
      });

      const filename = `aura-portfolio-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.save(filename);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="px-6 lg:px-16 py-8 lg:py-12 max-w-[1280px] w-full mx-auto pb-24">
      <div className="mb-12 mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Live portfolio</p>
          <h2 className="font-display text-display text-primary tracking-tight">Portfolio Analysis</h2>
        </div>
        <div>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={loading || exporting || portfolio.length === 0}
            className="btn btn-outline disabled:opacity-50"
            title={portfolio.length === 0 ? "Add investments to export a report" : "Download portfolio report as PDF"}
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            {exporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {loading ? <p className="py-12 text-center font-sans text-on-surface-variant">Loading portfolio report...</p> : portfolio.length === 0 ? (
        <div className="editorial-card p-12 text-center mb-16">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">analytics</span>
          <h3 className="font-display text-headline-md text-primary mt-4">No portfolio data yet</h3>
          <p className="font-sans text-body-md text-on-surface-variant mt-2">Add investments to generate your report.</p>
        </div>
      ) : <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="editorial-card p-6"><span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Invested</span><p className="font-display text-headline-lg text-primary mt-2">{formatCurrency(totalInvested)}</p></div>
          <div className="editorial-card p-6"><span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Current value</span><p className="font-display text-headline-lg text-primary mt-2">{formatCurrency(totalValue)}</p></div>
          <div className="editorial-card p-6"><span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Gain / loss</span><p className={`font-display text-headline-lg mt-2 ${totalGain >= 0 ? "text-emerald-700" : "text-rose-700"}`}>{formatCurrency(totalGain)}</p></div>
        </div>
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            type={cat.type}
            valuation={cat.valuation}
            percentage={cat.percentage}
            trend={cat.trend}
            sectors={cat.sectors}
            label={cat.label}
            description={cat.description}
            icon={cat.icon}
            bgImage={cat.bgImage}
            isDark={cat.isDark}
            isLarge={cat.isLarge}
          />
        ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-t border-outline-variant/30 pt-12">
        <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/15 shadow-sm">
          <SpendingChart data={portfolio} />
        </div>
        <div className="lg:col-span-4">
          <DonutChart data={portfolio} total={totalValue} />
        </div>
        </section>
      </>}
    </div>
  );
}
