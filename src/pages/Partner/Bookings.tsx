import React from 'react';
import { Filter, Search, CheckCircle, XCircle } from 'lucide-react';
import { mockBookings } from './mockData';

const Bookings: React.FC = () => {
  const getBadgeClass = (status: string) => {
    switch(status) {
      case 'Chờ duyệt': return 'bg-amber-100 text-amber-700';
      case 'Đã đặt cọc': return 'bg-blue-100 text-blue-700';
      case 'Đang ở': return 'bg-emerald-100 text-emerald-700';
      case 'Đã trả phòng': return 'bg-gray-200 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đặt phòng</h1>
          <p className="text-gray-500 mt-1">Phê duyệt và theo dõi các hợp đồng thuê nhà.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-80">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo tên khách, phòng..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap">
            <Filter size={18} />
            Lọc trạng thái
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="py-4 px-6 font-semibold">Khách hàng</th>
                <th className="py-4 px-6 font-semibold">Tên phòng</th>
                <th className="py-4 px-6 font-semibold">Thời gian thuê</th>
                <th className="py-4 px-6 font-semibold">Dịch vụ đi kèm</th>
                <th className="py-4 px-6 font-semibold text-right">Tổng tiền</th>
                <th className="py-4 px-6 font-semibold">Trạng thái</th>
                <th className="py-4 px-6 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-800">{booking.customerName}</div>
                    <div className="text-xs text-gray-500 mt-1">Mã: {booking.id.toUpperCase()}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-700 font-medium">{booking.roomName}</td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-800">{booking.checkInDate}</div>
                    <div className="text-xs text-gray-500 mt-1">đến {booking.checkOutDate}</div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {booking.services.length > 0 
                      ? booking.services.join(', ') 
                      : <span className="text-gray-400 italic">Không có</span>}
                  </td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-800">
                    {booking.totalAmount.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeClass(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {booking.status === 'Chờ duyệt' ? (
                      <div className="flex justify-center gap-2">
                        <button className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-1.5 rounded-md transition-colors" title="Duyệt">
                          <CheckCircle size={20} />
                        </button>
                        <button className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors" title="Từ chối">
                          <XCircle size={20} />
                        </button>
                      </div>
                    ) : (
                      <button className="text-blue-600 hover:underline text-sm font-medium">Chi tiết</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
