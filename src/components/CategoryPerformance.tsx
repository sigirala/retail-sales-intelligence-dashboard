import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Tag, PieChart as PieIcon, BarChart2, AlertCircle } from 'lucide-react';
import { CategoryPerformancePoint, formatCurrency } from '../utils/kpiCalculator';

interface CategoryPerformanceProps {
  data: CategoryPerformancePoint[];
}

const CATEGORY_COLORS = [
  '#4f46e5', // Indigo
  '#0284c7', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
];

export const CategoryPerformance: React.FC<CategoryPerformanceProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'donut' | 'bar'>('donut');

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item: CategoryPerformancePoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 min-w-44">
          <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between">
            <span>{item.category}</span>
            <span className="text-[10px] font-bold text-indigo-300">
              {item.sharePercent}% Share
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Net Sales:</span>
              <span className="font-semibold text-white">{formatCurrency(item.netSales)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Gross Sales:</span>
              <span>{formatCurrency(item.grossSales)}</span>
            </div>
            <div className="flex justify-between text-rose-300 text-[11px] pt-1 border-t border-slate-800">
              <span>Return Rate:</span>
              <span className="font-bold">{item.returnRate}%</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Units:</span>
              <span>{item.unitsSold.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item: CategoryPerformancePoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 min-w-44">
          <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1.5">
            {item.category}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Net Sales:</span>
              <span className="font-semibold text-white">{formatCurrency(item.netSales)}</span>
            </div>
            <div className="flex justify-between text-rose-300">
              <span>Returns:</span>
              <span className="font-semibold">{formatCurrency(item.returnAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <span>Return Rate:</span>
              <span className={item.returnRate > 10 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {item.returnRate}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Category Performance
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Product category revenue share & return rates
          </p>
        </div>

        {/* Toggle Pie / Bar */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
          <button
            type="button"
            onClick={() => setChartType('donut')}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              chartType === 'donut'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Pie / Donut View"
          >
            <PieIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              chartType === 'bar'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
            title="Bar Chart View"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No category data available.
          </div>
        ) : chartType === 'donut' ? (
          <div className="h-full flex flex-col sm:flex-row items-center">
            <div className="h-full w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={data}
                    dataKey="netSales"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend list */}
            <div className="w-full sm:w-1/2 space-y-1.5 text-xs overflow-y-auto max-h-56 pr-2">
              {data.map((item, idx) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-slate-700 truncate font-medium" title={item.category}>
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-slate-500">
                    <span className="font-semibold text-slate-800">{item.sharePercent}%</span>
                    {item.returnRate > 10 && (
                      <span
                        className="text-[10px] text-rose-600 bg-rose-50 px-1 py-0.2 rounded font-medium"
                        title={`High return rate: ${item.returnRate}%`}
                      >
                        {item.returnRate}% ret
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickFormatter={(val) => formatCurrency(val)}
              />
              <YAxis
                dataKey="category"
                type="category"
                width={110}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fontSize: 10, fill: '#475569' }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="netSales" name="Net Sales ($)" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
