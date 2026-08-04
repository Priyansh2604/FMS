import React from "react";
import CategoryCard from "../components/ui/CategoryCard";
import SpendingChart from "../components/ui/SpendingChart";
import DonutChart from "../components/ui/DonutChart";
import { portfolioCategories } from "../data/mockData";

export default function ReportsPage() {
  return (
    <div className="px-6 lg:px-16 py-8 lg:py-12 max-w-[1280px] w-full mx-auto pb-24 select-none">
      {/* Page Header */}
      <div className="mb-12 mt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Q3 2024</p>
          <h2 className="font-display text-display text-primary tracking-tight">Portfolio Analysis</h2>
        </div>
        <div>
          <button className="px-6 py-2.5 border border-outline-variant hover:bg-surface-container-low transition-colors rounded font-sans text-label-sm font-semibold uppercase tracking-wider shadow-sm text-primary">
            Export PDF
          </button>
        </div>
      </div>

      {/* Bento Grid layout */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
        {portfolioCategories.map((cat) => (
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

      {/* Charts section matching both dashboard/analytics timelines */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-t border-outline-variant/30 pt-12">
        <div className="lg:col-span-8 bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/15 shadow-sm">
          <SpendingChart />
        </div>
        <div className="lg:col-span-4">
          <DonutChart />
        </div>
      </section>
    </div>
  );
}
