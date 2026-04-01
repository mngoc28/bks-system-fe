import React from 'react';
import { Search, Filter, Wrench, CalendarClock, CheckSquare } from 'lucide-react';
import { mockMaintenances } from './mockData';

const Maintenances: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Chờ xử lý': return 'bg-red-100 text-red-700 border-red-200';
      case 'Đang sửa': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Đã hoàn thành': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yêu cầu bảo trì, CSKH</h1>
          <p className="text-gray-500 mt-1">Tiếp nhận và xử lý các vấn đề hỏng hóc từ người thuê.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-80">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Tìm theo phòng, mô tả lỗi..." 
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            <Filter size={18} />
            Lọc trạng thái
          </button>
        </div>

        {/* List layout instead of table for better mobile UX */}
        <div className="divide-y divide-gray-100">
          {mockMaintenances.map((mt) => (
            <div key={mt.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between md:justify-start gap-4">
                  <h3 className="text-lg font-bold text-gray-800">{mt.roomName}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(mt.status)}`}>
                    {mt.status}
                  </span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 text-sm">
                  <span className="font-semibold">Mô tả sự cố:</span> {mt.issueDescription}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarClock size={14} />
                    <span>Tạo lúc: {new Date(mt.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    <span>Người gửi báo cáo: <strong className="text-gray-700">{mt.customerName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="w-full md:w-48 flex flex-row md:flex-col gap-2 shrink-0">
                {mt.status === 'Chờ xử lý' && (
                  <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                    <Wrench size={16} />
                    Bắt đầu sửa chửa
                  </button>
                )}
                {mt.status === 'Đang sửa' && (
                  <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                    <CheckSquare size={16} />
                    Đánh dấu hoàn thành
                  </button>
                )}
                <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Maintenances;
