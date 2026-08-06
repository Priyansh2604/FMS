import React from "react";
import MarketIndexCard from "../components/ui/MarketIndexCard";
import MarketChart from "../components/ui/MarketChart";
import CandleChart from "../components/ui/CandleChart";
import StockRecommendationCard from "../components/ui/StockRecommendationCard";
import MutualFundCard from "../components/ui/MutualFundCard";
import InstrumentCard from "../components/ui/InstrumentCard";
import {
  marketIndices,
  marketTrend,
  candleData,
  investmentProfile,
  stockRecommendations,
  mutualFundRecommendations,
  alternativeInstruments,
} from "../data/mockData";

export default function InvestmentsPage() {
  return (
    <div className="px-6 lg:px-16 py-8 lg:py-12 max-w-[1280px] w-full mx-auto">
      {/* Header */}
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest mb-2">Markets</p>
          <h2 className="font-display text-display text-primary tracking-tight">Investment Advisor</h2>
        </div>
        <div className="flex items-center gap-2 pb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-sans text-label-sm text-on-surface-variant">Mock market data · live feed coming soon</span>
        </div>
      </div>

      {/* Market Overview */}
      <section className="mb-14">
        <h3 className="font-display text-headline-lg text-primary border-b border-outline-variant/30 pb-4 mb-6">
          Market Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketIndices.map((idx) => (
            <MarketIndexCard key={idx.id} {...idx} />
          ))}
        </div>
      </section>

      {/* Market Trends */}
      <section className="mb-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/30 pb-4 mb-6">
          <h3 className="font-display text-headline-lg text-primary">Market Trends</h3>
          <p className="font-sans text-label-sm text-on-surface-variant">
            {marketTrend.period} · click legend to toggle · hover to inspect
          </p>
        </div>
        <MarketChart data={marketTrend} />
      </section>

      {/* Candle Chart */}
      <section className="mb-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/30 pb-4 mb-6">
          <h3 className="font-display text-headline-lg text-primary">Candle Chart</h3>
          <p className="font-sans text-label-sm text-on-surface-variant">
            Daily open · high · low · close for {candleData.symbol} · hover to inspect
          </p>
        </div>
        <CandleChart data={candleData} />
      </section>

      {/* AI Allocation Plan */}
      <section className="editorial-card p-6 lg:p-8 mb-14 bg-tertiary-fixed/10 border-tertiary-fixed/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-72 bg-tertiary-fixed/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start justify-between">
          <div className="max-w-lg">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm shrink-0">
                <span className="material-symbols-outlined text-[22px]">smart_toy</span>
              </div>
              <div>
                <h3 className="font-display text-headline-sm text-primary font-semibold">AI Allocation Plan</h3>
                <p className="font-sans text-label-sm text-on-surface-variant">
                  Based on your savings · {investmentProfile.riskProfile} risk
                </p>
              </div>
            </div>

            <p className="font-sans text-body-md text-on-surface-variant mt-5 leading-relaxed">
              {investmentProfile.aiNote}
            </p>

            <div className="flex flex-wrap gap-x-10 gap-y-4 mt-6">
              <div className="flex flex-col gap-1">
                <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Current Savings</span>
                <span className="font-display text-headline-lg text-primary font-semibold">{investmentProfile.savings}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-sans text-label-sm text-on-surface-variant uppercase tracking-widest">Monthly Savings</span>
                <span className="font-display text-headline-lg text-primary font-semibold">{investmentProfile.monthlySavings}</span>
              </div>
            </div>
          </div>

          {/* Allocation breakdown */}
          <div className="w-full lg:w-96 flex flex-col gap-5">
            <div className="w-full h-3 rounded-full overflow-hidden flex border border-outline-variant/30 bg-surface-container-low">
              {investmentProfile.allocation.map((a) => (
                <div
                  key={a.asset}
                  style={{ width: `${a.pct}%`, backgroundColor: a.color }}
                  title={`${a.asset} · ${a.pct}%`}
                />
              ))}
            </div>
            <ul className="flex flex-col gap-2.5">
              {investmentProfile.allocation.map((a) => (
                <li key={a.asset} className="flex items-center justify-between font-sans text-label-md">
                  <span className="flex items-center gap-2.5 text-on-surface-variant">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                    {a.asset}
                  </span>
                  <span className="text-primary font-bold">{a.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* AI Stock Picks */}
      <section className="mb-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/30 pb-4 mb-6">
          <h3 className="font-display text-headline-lg text-primary">AI Stock Picks</h3>
          <p className="font-sans text-label-sm text-on-surface-variant">Ranked by risk-adjusted fit for your savings</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {stockRecommendations.map((stock) => (
            <StockRecommendationCard key={stock.id} stock={stock} />
          ))}
        </div>
      </section>

      {/* Equivalent SIP Mutual Funds */}
      <section className="mb-14">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/30 pb-4 mb-6">
          <h3 className="font-display text-headline-lg text-primary">Equivalent SIP Mutual Funds</h3>
          <p className="font-sans text-label-sm text-on-surface-variant">Same exposure, spread out monthly</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mutualFundRecommendations.map((fund) => (
            <MutualFundCard key={fund.id} fund={fund} />
          ))}
        </div>
      </section>

      {/* Other Options */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant/30 pb-4 mb-6">
          <h3 className="font-display text-headline-lg text-primary">Other Options</h3>
          <p className="font-sans text-label-sm text-on-surface-variant">Safe havens &amp; fixed-income alternatives</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {alternativeInstruments.map((instrument) => (
            <InstrumentCard key={instrument.id} instrument={instrument} />
          ))}
        </div>
      </section>
    </div>
  );
}
