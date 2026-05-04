import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Wallet, TrendingUp, HandCoins, ArrowRightLeft, Calendar } from 'lucide-react';
import { mockRevenueData, mockTransactions } from './mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Finance: React.FC = () => {
  const currentMonthRevenue = mockRevenueData[mockRevenueData.length - 1];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}Tr`;
    }
    return value.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Doanh thu & Tài chính</h1>
        <p className="mt-1 text-gray-500">Theo dõi dòng tiền, doanh thu từ các lượt cho thuê và lịch sử rút tiền.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <Wallet size={24} />
            </div>
            <span className="font-medium text-gray-600">Tổng doanh thu (Tháng này)</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{currentMonthRevenue.revenue.toLocaleString('vi-VN')} ₫</p>
          <div className="flex items-center gap-1 text-sm font-medium text-emerald-600">
            <TrendingUp size={16} />
            <span>+27.5% so với tháng trước</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3 text-purple-600">
              <HandCoins size={24} />
            </div>
            <span className="font-medium text-gray-600">Lợi nhuận thực nhận (Net)</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{currentMonthRevenue.netIncome.toLocaleString('vi-VN')} ₫</p>
          <p className="text-sm text-gray-500">Đã trừ {currentMonthRevenue.commission.toLocaleString('vi-VN')} ₫ phí nền tảng</p>
        </div>

        <div className="relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 size-32 rounded-full bg-amber-50 blur-3xl"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
              <ArrowRightLeft size={24} />
            </div>
            <span className="font-medium text-gray-600">Số dư chuẩn bị đối soát</span>
          </div>
          <p className="relative z-10 mt-2 text-3xl font-bold text-amber-600">118,750,000 ₫</p>
          <button className="relative z-10 mt-auto rounded-lg bg-amber-500 py-2 font-medium text-white transition-colors hover:bg-amber-600">
            Cài đặt TK nhận tiền
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart Section */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Biểu đồ Doanh thu (6 tháng gần nhất)</h2>
            <Select defaultValue="6-months">
              <SelectTrigger className="w-40 border-gray-200 bg-gray-50/50">
                <SelectValue placeholder="Chọn khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6-months">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-blue-500" /> 6 tháng qua
                  </div>
                </SelectItem>
                <SelectItem value="this-year">
                   <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" /> Năm nay
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="netIncome" name="Lợi nhuận thực" fill="#3B82F6" maxBarSize={50} />
                <Bar dataKey="commission" name="Phí hoa hồng" fill="#93C5FD" maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions List */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Lịch sử giao dịch</h2>
            <button className="text-sm font-medium text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          
          <div className="space-y-4">
            {mockTransactions.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`rounded-full p-2 ${tx.type === 'Thu nhập' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {tx.type === 'Thu nhập' ? <TrendingUp size={16} /> : <Wallet size={16} />}
                  </div>
                  <div>
                    <p className="line-clamp-1 text-sm font-semibold text-gray-800">{tx.description}</p>
                    <p className="text-xs text-gray-500">{tx.date} • {tx.type}</p>
                  </div>
                </div>
                <div className="ml-4 whitespace-nowrap text-right">
                  <p className={`text-sm font-bold ${tx.type === 'Thu nhập' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {tx.type === 'Thu nhập' ? '+' : ''}{tx.amount.toLocaleString('vi-VN')} ₫
                  </p>
                  <p className={`mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600`}>
                    Thành công
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
