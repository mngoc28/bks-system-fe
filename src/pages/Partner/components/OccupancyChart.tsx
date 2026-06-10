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
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OccupancyChartPoint {
  date: string;
  occupancyRate: number;
}

interface OccupancyChartProps {
  data?: OccupancyChartPoint[];
  isLoading?: boolean;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const OccupancyChart: React.FC<OccupancyChartProps> = ({ data = [], isLoading = false }) => {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold sm:text-xl">Tỷ lệ lấp phòng 30 ngày</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Tỷ lệ phòng có booking đã xác nhận/hoàn tất theo từng ngày.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
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
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value) => [`${Number(value ?? 0).toFixed(2)}%`, 'Lấp phòng']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey="occupancyRate"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fill="url(#occupancyGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OccupancyChart;
