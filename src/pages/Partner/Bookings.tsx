import React, { useState, useEffect } from 'react';
import { Calendar, User, Home, CheckCircle, XCircle, MoreVertical, Search, Filter, Clock, Loader2 } from 'lucide-react';
import { Booking } from './types';
import { Button } from "@/components/ui/button";
import { partnerService } from '@/services/partnerService';

const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getBookings();
      setBookings(res.data.data.data || res.data.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Chờ duyệt': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Đã duyệt': 
      case 'Đã hoàn thành': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Đã hủy': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const handleApprove = async (id: string | number) => {
    if (window.confirm('Xác nhận duyệt yêu cầu đặt phòng này?')) {
      try {
        await partnerService.confirmBooking(id);
        fetchBookings();
      } catch (error) {
        alert('Lỗi khi duyệt đặt phòng.');
      }
    }
  };

  const handleReject = async (id: string | number) => {
    if (window.confirm('Bạn có chắc chắn muốn từ chối yêu cầu này?')) {
      try {
        await partnerService.cancelBooking(id);
        fetchBookings();
      } catch (error) {
        alert('Lỗi khi từ chối đặt phòng.');
      }
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Đặt phòng</h1>
          <p className="text-gray-500 mt-1">Phê duyệt và theo dõi yêu cầu thuê từ khách hàng.</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input type="text" placeholder="Tìm tên khách..." className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Khách hàng / Phòng</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ngày nhận/Trả</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Phê duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.length > 0 ? bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 flex items-center gap-1.5 uppercase text-xs tracking-tight">
                        <User size={14} className="text-blue-500" /> {booking.guestName || 'Khách ẩn danh'}
                      </span>
                      <span className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                        <Home size={14} /> {booking.roomName || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold italic">
                        <Calendar size={12} /> IN: {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-600 font-semibold italic">
                        <Calendar size={12} /> OUT: {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {booking.status === 'Chờ duyệt' ? (
                         <>
                           <Button onClick={() => handleApprove(booking.id)} size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3">Duyệt</Button>
                           <Button onClick={() => handleReject(booking.id)} variant="outline" size="sm" className="h-8 text-red-600 border-red-200 px-3">Hủy</Button>
                         </>
                       ) : (
                         <Button variant="ghost" size="icon" className="text-gray-400 h-8 w-8"><MoreVertical size={16} /></Button>
                       )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">Hiện không có yêu cầu đặt phòng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
