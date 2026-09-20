import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { MapPin } from 'lucide-react';
import { RegionSalesPoint, formatCurrency } from '../utils/kpiCalculator';

interface RegionSalesChartProps {
  data: RegionSalesPoint[];
}

export const RegionSalesChart: React.FC<RegionSalesChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item: RegionSalesPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 min-w-44">
          <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1.5 mb-1.5 flex items-center justify-between">
            <span>{label} Region</span>
            <span className="text-[10px] text-slate-400">
              {item.storeCount} store{item.storeCount > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Net Sales:</span>
              <span className="font-semibold text-white">{formatCurrency(item.netSales)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Target:</span>
              <span className="font-semibold text-slate-300">{formatCurrency(item.targetSales)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <span>Target Achievement:</span>
              <span
                className={`font-semibold ${
                  item.achievement >= 100 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {item.achievement}%
              </span>
            </div>
            <div className="flex justify-between text-rose-300 text-[11px]">
              <span>Return Rate:</span>
              <span>{item.returnRate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Sales by Region
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional revenue contribution vs planned sales targets
          </p>
        </div>
      </div>

      <div className="h-68 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No regional data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="region"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => formatCurrency(val)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              <Bar
                dataKey="netSales"
                name="Net Sales ($)"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="targetSales"
                name="Target ($)"
                fill="#cbd5e1"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
