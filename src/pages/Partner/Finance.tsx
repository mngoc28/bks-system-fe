import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Wallet, TrendingUp, HandCoins, ArrowRightLeft } from 'lucide-react';
import { mockRevenueData, mockTransactions } from './mockData';

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
        <p className="text-gray-500 mt-1">Theo dõi dòng tiền, doanh thu từ các lượt cho thuê và lịch sử rút tiền.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <Wallet size={24} />
            </div>
            <span className="text-gray-600 font-medium">Tổng doanh thu (Tháng này)</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{currentMonthRevenue.revenue.toLocaleString('vi-VN')} ₫</p>
          <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
            <TrendingUp size={16} />
            <span>+27.5% so với tháng trước</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <HandCoins size={24} />
            </div>
            <span className="text-gray-600 font-medium">Lợi nhuận thực nhận (Net)</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{currentMonthRevenue.netIncome.toLocaleString('vi-VN')} ₫</p>
          <p className="text-sm text-gray-500">Đã trừ {currentMonthRevenue.commission.toLocaleString('vi-VN')} ₫ phí nền tảng</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <ArrowRightLeft size={24} />
            </div>
            <span className="text-gray-600 font-medium">Số dư chuẩn bị đối soát</span>
          </div>
          <p className="text-3xl font-bold text-amber-600 mt-2 relative z-10">118,750,000 ₫</p>
          <button className="mt-auto py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors relative z-10">
            Cài đặt TK nhận tiền
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Biểu đồ Doanh thu (6 tháng gần nhất)</h2>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2">
              <option>6 tháng qua</option>
              <option>Năm nay</option>
            </select>
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Lịch sử giao dịch</h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">Xem tất cả</button>
          </div>
          
          <div className="space-y-4">
            {mockTransactions.map(tx => (
              <div key={tx.id} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'Booking' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {tx.type === 'Booking' ? <TrendingUp size={16} /> : <Wallet size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{tx.description}</p>
                    <p className="text-xs text-gray-500">{tx.date} • {tx.type}</p>
                  </div>
                </div>
                <div className="text-right whitespace-nowrap ml-4">
                  <p className={`text-sm font-bold ${tx.type === 'Booking' ? 'text-emerald-600' : 'text-blue-600'}`}>
                    {tx.type === 'Booking' ? '+' : ''}{tx.amount.toLocaleString('vi-VN')} ₫
                  </p>
                  <p className={`text-[10px] font-medium px-2 py-0.5 mt-1 rounded-full inline-block ${tx.status === 'Thành công' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {tx.status}
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
