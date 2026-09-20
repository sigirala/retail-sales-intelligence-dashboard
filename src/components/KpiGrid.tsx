import React from 'react';
import {
  DollarSign,
  Target,
  ShoppingBag,
  RotateCcw,
  Percent,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DashboardKpis } from '../types';
import { formatCurrency, formatNumber } from '../utils/kpiCalculator';

interface KpiGridProps {
  kpis: DashboardKpis;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ kpis }) => {
  const isTargetAchieved = kpis.targetAchievementRate >= 100;
  const isTargetClose = kpis.targetAchievementRate >= 90 && kpis.targetAchievementRate < 100;
  const isHighReturn = kpis.returnRate > 10;
  const isHighDiscount = kpis.discountRate > 12;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Net Sales */}
      <div
        id="kpi-net-sales"
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Net Sales
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {formatCurrency(kpis.totalNetSales)}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Gross: {formatCurrency(kpis.totalGrossSales)}</span>
          <span className="font-medium text-slate-700">{formatNumber(kpis.totalUnitsSold)} units</span>
        </div>
      </div>

      {/* 2. Target Achievement Rate */}
      <div
        id="kpi-target-achievement"
        className={`bg-white border rounded-xl p-4 shadow-2xs transition-all flex flex-col justify-between ${
          isTargetAchieved
            ? 'border-emerald-200 hover:border-emerald-300'
            : isTargetClose
            ? 'border-amber-200 hover:border-amber-300'
            : 'border-rose-200 hover:border-rose-300'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Target Achievement
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isTargetAchieved
                  ? 'bg-emerald-50 text-emerald-700'
                  : isTargetClose
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight ${
                isTargetAchieved
                  ? 'text-emerald-700'
                  : isTargetClose
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {kpis.targetAchievementRate.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              vs Target
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                isTargetAchieved
                  ? 'bg-emerald-600'
                  : isTargetClose
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, kpis.targetAchievementRate))}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Target: {formatCurrency(kpis.totalTargetSales)}</span>
            <span className="font-medium text-slate-600">
              {isTargetAchieved ? (
                <span className="text-emerald-600 flex items-center gap-0.5 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Met
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-0.5 font-medium">
                  <AlertTriangle className="w-3 h-3" /> Gap: {formatCurrency(kpis.totalTargetSales - kpis.totalNetSales)}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Average Transaction Value (ATV) */}
      <div
        id="kpi-atv"
        className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Average Transaction (ATV)
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              ${kpis.averageTransactionValue.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400">/ order</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Transactions:</span>
          <span className="font-semibold text-slate-700">{formatNumber(kpis.totalTransactions)}</span>
        </div>
      </div>

      {/* 4. Return Rate */}
      <div
        id="kpi-return-rate"
        className={`bg-white border rounded-xl p-4 shadow-2xs transition-all flex flex-col justify-between ${
          isHighReturn ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Return Rate
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isHighReturn ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold tracking-tight ${
                isHighReturn ? 'text-rose-700' : 'text-slate-900'
              }`}
            >
              {kpis.returnRate.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400">of Net Sales</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Returned:</span>
          <span className="font-semibold text-rose-600">{formatCurrency(kpis.totalReturnAmount)}</span>
        </div>
      </div>

      {/* 5. Discount Rate */}
      <div
        id="kpi-discount-rate"
        className={`bg-white border rounded-xl p-4 shadow-2xs transition-all flex flex-col justify-between ${
          isHighDiscount ? 'border-amber-200 hover:border-amber-300' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Discount Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {kpis.discountRate.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400">of Gross Sales</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Total Discount:</span>
          <span className="font-semibold text-slate-700">{formatCurrency(kpis.totalDiscountAmount)}</span>
        </div>
      </div>
    </div>
  );
};
