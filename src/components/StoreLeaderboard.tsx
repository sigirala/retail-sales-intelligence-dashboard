import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Trophy, ArrowUpDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { StoreLeaderboardItem, formatCurrency } from '../utils/kpiCalculator';

interface StoreLeaderboardProps {
  data: StoreLeaderboardItem[];
}

export const StoreLeaderboard: React.FC<StoreLeaderboardProps> = ({ data }) => {
  const [sortBy, setSortBy] = useState<'sales' | 'achievement'>('sales');
  const [displayCount, setDisplayCount] = useState<number>(8);

  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'sales') {
      return b.netSales - a.netSales;
    }
    return b.achievement - a.achievement;
  });

  const displayData = sortedData.slice(0, displayCount);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: StoreLeaderboardItem = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 min-w-48">
          <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between">
            <span className="truncate max-w-36">{item.storeName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {item.storeId}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Region:</span>
              <span className="text-white font-medium">{item.region} • {item.city}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Format:</span>
              <span className="text-indigo-300">{item.storeFormat}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Net Sales:</span>
              <span className="font-semibold text-white">{formatCurrency(item.netSales)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Target:</span>
              <span>{formatCurrency(item.targetSales)}</span>
            </div>
            <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800">
              <span>Target Achievement:</span>
              <span
                className={`font-bold ${
                  item.achievement >= 100 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {item.achievement}%
              </span>
            </div>
            {item.shortfall > 0 && (
              <div className="flex justify-between text-rose-300 text-[11px]">
                <span>Target Shortfall:</span>
                <span className="font-semibold">-{formatCurrency(item.shortfall)}</span>
              </div>
            )}
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
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900">
              Store Leaderboard
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Store performance ranking across sales volume and target attainment
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setSortBy('sales')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                sortBy === 'sales'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Net Sales ($)
            </button>
            <button
              type="button"
              onClick={() => setSortBy('achievement')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                sortBy === 'achievement'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Target %
            </button>
          </div>

          <select
            value={displayCount}
            onChange={(e) => setDisplayCount(Number(e.target.value))}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value={5}>Top 5</option>
            <option value={8}>Top 8</option>
            <option value={15}>Top 15</option>
            <option value={50}>All Stores</option>
          </select>
        </div>
      </div>

      <div className="h-72 w-full">
        {displayData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No store data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => (sortBy === 'sales' ? formatCurrency(val) : `${val}%`)}
              />
              <YAxis
                dataKey="storeName"
                type="category"
                width={140}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fontSize: 11, fill: '#334155' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey={sortBy === 'sales' ? 'netSales' : 'achievement'}
                name={sortBy === 'sales' ? 'Net Sales ($)' : 'Achievement (%)'}
                radius={[0, 4, 4, 0]}
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.achievement >= 100
                        ? '#10b981' // Emerald
                        : entry.achievement >= 90
                        ? '#4f46e5' // Indigo
                        : '#f43f5e' // Rose
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Quick Legend / Stat Footer */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            ≥100% Target Met
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
            90-99% Near Target
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            &lt;90% Behind Target
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Showing {displayData.length} of {data.length} stores
        </span>
      </div>
    </div>
  );
};
