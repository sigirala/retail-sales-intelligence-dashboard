import React from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RotateCcw,
  Store,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
} from 'lucide-react';
import { BusinessInsights } from '../types';
import { formatCurrency } from '../utils/kpiCalculator';

interface BusinessInsightSummaryProps {
  insights: BusinessInsights;
}

export const BusinessInsightSummary: React.FC<BusinessInsightSummaryProps> = ({ insights }) => {
  const {
    bestRegion,
    worstRegion,
    storesMissingTarget,
    topPerformingStores,
    highReturnCategories,
    stockoutRisksCount,
  } = insights;

  const totalShortfall = storesMissingTarget.reduce((sum, s) => sum + s.shortfall, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs mb-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Executive Business Insight Summary
            </h2>
            <p className="text-xs text-slate-500 mt-0.2">
              Automated intelligence identifying regional leaders, store target shortfalls, and return rate anomalies
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-auto">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Live Rule-Based Synthesis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Regional Performance Variance */}
        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Regional Performance
            </span>

            {/* Best Region */}
            <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  Top Region: {bestRegion.name}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                  {bestRegion.achievement}%
                </span>
              </div>
              <div className="text-[11px] text-emerald-800 mt-1">
                Generated {formatCurrency(bestRegion.netSales)} in Net Sales, outperforming planned sales quota.
              </div>
            </div>

            {/* Worst Region */}
            <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50/70 border border-rose-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-950 flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                  Lagging: {worstRegion.name}
                </span>
                <span className="text-xs font-bold text-rose-700 bg-white px-1.5 py-0.5 rounded shadow-2xs">
                  {worstRegion.achievement}%
                </span>
              </div>
              <div className="text-[11px] text-rose-800 mt-1">
                Recorded {formatCurrency(worstRegion.netSales)}. Requires promotional review and localized merchandising adjustments.
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-200">
            Variance spread: {(bestRegion.achievement - worstRegion.achievement).toFixed(1)}% between top & bottom region
          </div>
        </div>

        {/* Card 2: Stores Missing Target */}
        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Stores Missing Target
              </span>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                {storesMissingTarget.length} Stores
              </span>
            </div>

            {storesMissingTarget.length === 0 ? (
              <div className="mt-4 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                All active stores in the filtered selection are achieving 100%+ of target!
              </div>
            ) : (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                {storesMissingTarget.slice(0, 4).map((s) => (
                  <div
                    key={s.storeId}
                    className="p-2 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div className="truncate mr-2">
                      <div className="font-semibold text-slate-800 truncate" title={s.storeName}>
                        {s.storeName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {s.region} • Achieved {s.achievement}%
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-rose-600">
                        -{formatCurrency(s.shortfall)}
                      </div>
                      <div className="text-[9px] text-slate-400">shortfall</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {storesMissingTarget.length > 0 && (
            <div className="mt-3 pt-2 text-[11px] text-slate-500 border-t border-slate-200 flex justify-between">
              <span>Total Revenue Gap:</span>
              <span className="font-bold text-rose-600">-{formatCurrency(totalShortfall)}</span>
            </div>
          )}
        </div>

        {/* Card 3: High Return Categories & Inventory Risks */}
        <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Category Returns & Stock Alerts
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Action Items
              </span>
            </div>

            {/* High Return Category Alert */}
            <div className="mt-3 space-y-2">
              {highReturnCategories.length === 0 ? (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                  Return rates across all categories remain below the 8% target ceiling.
                </div>
              ) : (
                highReturnCategories.slice(0, 2).map((cat) => (
                  <div
                    key={cat.category}
                    className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-rose-950">
                      <span className="truncate">{cat.category}</span>
                      <span className="text-rose-700 font-bold">{cat.returnRate}% Returns</span>
                    </div>
                    <div className="text-[11px] text-rose-800/90 mt-0.5">
                      {formatCurrency(cat.returnAmount)} returned. Audit sizing charts, fit guidelines, and packaging integrity.
                    </div>
                  </div>
                ))
              )}

              {/* Stockout Risk Callout */}
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                <div className="flex items-center justify-between font-semibold text-amber-950">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Inventory Replenishment
                  </span>
                  <span className="font-bold text-amber-800">
                    {stockoutRisksCount.critical} Critical
                  </span>
                </div>
                <div className="text-[11px] text-amber-800/90 mt-0.5">
                  {stockoutRisksCount.critical > 0
                    ? `Expedite transfer orders for ${stockoutRisksCount.critical} store departments with under 1 week of stock.`
                    : 'Inventory stock levels healthy across filtered categories.'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[10px] text-slate-400 border-t border-slate-200">
            Recommended Action: Review Footwear & Apparel returns and restock critical electronics
          </div>
        </div>
      </div>
    </div>
  );
};
