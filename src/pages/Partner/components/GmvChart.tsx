import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface GmvChartPoint {
  date: string;
  gmv: number;
  netRevenue: number;
}

interface GmvChartProps {
  data?: GmvChartPoint[];
  isLoading?: boolean;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const formatCurrency = (value: number) => (
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
);

const GmvChart: React.FC<GmvChartProps> = ({ data = [], isLoading = false }) => {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">GMV & Net Revenue 30 ngày</CardTitle>
          <CardDescription>Doanh thu gross và net theo ngày nhận phòng.</CardDescription>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-blue-600" /> GMV
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Net
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-blue-600" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gmvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={formatDate}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  tickFormatter={(value) => `${Math.round(Number(value) / 1_000_000)}M`}
                />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value, name) => [
                    formatCurrency(Number(value ?? 0)),
                    name === 'gmv' ? 'GMV' : 'Net Revenue',
                  ]}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="gmv" stroke="#2563eb" strokeWidth={2.5} fill="url(#gmvGradient)" />
                <Area
                  type="monotone"
                  dataKey="netRevenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#netRevenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GmvChart;
