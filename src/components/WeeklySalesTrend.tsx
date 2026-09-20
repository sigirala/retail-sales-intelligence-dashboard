import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';
import { WeeklyTrendPoint } from '../utils/kpiCalculator';
import { formatCurrency } from '../utils/kpiCalculator';

interface WeeklySalesTrendProps {
  data: WeeklyTrendPoint[];
}

export const WeeklySalesTrend: React.FC<WeeklySalesTrendProps> = ({ data }) => {
  const [metricView, setMetricView] = useState<'sales' | 'achievement'>('sales');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item: WeeklyTrendPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 min-w-44">
          <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1.5 mb-1.5 flex items-center justify-between">
            <span>Week {label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                item.achievement >= 100
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                  : 'bg-rose-950 text-rose-400 border border-rose-700'
              }`}
            >
              {item.achievement}% Target
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                Net Sales:
              </span>
              <span className="font-semibold text-white">{formatCurrency(item.netSales)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                Target:
              </span>
              <span className="font-semibold text-slate-300">{formatCurrency(item.targetSales)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <span>Units Sold:</span>
              <span>{item.unitsSold.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-rose-300 text-[11px]">
              <span>Returns:</span>
              <span>{formatCurrency(item.returns)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Weekly Sales Trend
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Net Sales performance vs Target Sales trajectory across weeks
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMetricView('sales')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              metricView === 'sales'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales vs Target ($)
          </button>
          <button
            type="button"
            onClick={() => setMetricView('achievement')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              metricView === 'achievement'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Target Achievement (%)
          </button>
        </div>
      </div>

      <div className="h-68 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No weekly data matching the current filter selection.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="week"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => (metricView === 'sales' ? formatCurrency(val) : `${val}%`)}
                domain={metricView === 'achievement' ? [60, 'auto'] : ['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              {metricView === 'sales' ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="netSales"
                    name="Net Sales ($)"
                    stroke="#4f46e5"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: '#4f46e5', strokeWidth: 1.5, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#4f46e5' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="targetSales"
                    name="Target Sales ($)"
                    stroke="#94a3b8"
                    strokeWidth={1.75}
                    strokeDasharray="4 4"
                    dot={{ r: 2.5, fill: '#94a3b8' }}
                  />
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey="achievement"
                  name="Achievement (%)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 1.5, stroke: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
