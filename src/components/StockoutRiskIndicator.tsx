import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Package,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { StockoutItem } from '../types';
import { formatCurrency, formatNumber } from '../utils/kpiCalculator';

interface StockoutRiskIndicatorProps {
  items: StockoutItem[];
}

export const StockoutRiskIndicator: React.FC<StockoutRiskIndicatorProps> = ({ items }) => {
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'Critical' | 'Warning'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const criticalCount = items.filter((i) => i.riskLevel === 'Critical').length;
  const warningCount = items.filter((i) => i.riskLevel === 'Warning').length;
  const healthyCount = items.filter((i) => i.riskLevel === 'Healthy').length;

  const totalLostSalesAtRisk = items
    .filter((i) => i.riskLevel === 'Critical')
    .reduce((acc, curr) => acc + curr.potentialLostSales, 0);

  const filteredItems = items
    .filter((i) => (riskFilter === 'ALL' ? true : i.riskLevel === riskFilter))
    .filter((i) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        i.storeName.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.region.toLowerCase().includes(q)
      );
    });

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      {/* Header & High-Level Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Stockout Risk Indicator
            </h3>
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 animate-pulse">
                {criticalCount} Critical
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time inventory velocity vs replenishment thresholds (Weeks of Supply = Current Stock / Weekly Units Sold)
          </p>
        </div>

        {/* Quick Summary Pill Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRiskFilter('Critical')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              riskFilter === 'Critical'
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Critical (&lt;1.0 WOS):</span>
            <span className="font-bold">{criticalCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setRiskFilter('Warning')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              riskFilter === 'Warning'
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Warning (1.0–1.8 WOS):</span>
            <span className="font-bold">{warningCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setRiskFilter('ALL')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              riskFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>View All ({items.length})</span>
          </button>
        </div>
      </div>

      {/* Potential Loss Banner if critical items exist */}
      {criticalCount > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50/50 border border-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-rose-900">
            <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Immediate Replenishment Trigger:</strong> {criticalCount} store-category combinations have less than 7 days of inventory on hand.
            </span>
          </div>
          <div className="text-right shrink-0">
            <span className="text-slate-500 mr-1">Estimated Sales at Risk:</span>
            <span className="font-bold text-rose-700">{formatCurrency(totalLostSalesAtRisk)}</span>
          </div>
        </div>
      )}

      {/* Risk Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-2.5 px-3">Store</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Current Stock</th>
              <th className="py-2.5 px-3">Weekly Velocity</th>
              <th className="py-2.5 px-3">Weeks of Supply</th>
              <th className="py-2.5 px-3">Risk Status</th>
              <th className="py-2.5 px-3 text-right">Potential Loss</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  No stockout risk items matching current criteria.
                </td>
              </tr>
            ) : (
              filteredItems.slice(0, 8).map((item, idx) => (
                <tr key={`${item.storeId}-${item.category}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{item.storeName}</div>
                    <div className="text-[10px] text-slate-400">
                      {item.region} • {item.storeId}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 font-medium">{item.category}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">{formatNumber(item.currentStock)} units</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{formatNumber(item.weeklyUnitsSold)}/wk</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            item.riskLevel === 'Critical'
                              ? 'bg-rose-500'
                              : item.riskLevel === 'Warning'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, (item.weeksOfSupply / 3.0) * 100)}%` }}
                        />
                      </div>
                      <span
                        className={`font-semibold font-mono ${
                          item.riskLevel === 'Critical'
                            ? 'text-rose-600'
                            : item.riskLevel === 'Warning'
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {item.weeksOfSupply} wks
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    {item.riskLevel === 'Critical' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3" /> Critical Stockout
                      </span>
                    ) : item.riskLevel === 'Warning' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">
                        <ShieldCheck className="w-3 h-3" /> Healthy
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium">
                    {item.potentialLostSales > 0 ? (
                      <span className="text-rose-600 font-bold">
                        {formatCurrency(item.potentialLostSales)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredItems.length > 8 && (
        <div className="mt-2.5 text-center text-xs text-slate-400">
          Showing top 8 of {filteredItems.length} filtered risk items
        </div>
      )}
    </div>
  );
};
