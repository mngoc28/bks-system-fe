import React from 'react';
import { Plus, MapPin, Maximize, AirVent, Tag } from 'lucide-react';
import { mockBuildings, mockRooms } from './mockData';

const Properties: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Trống': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Đang thuê': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Đang bảo trì': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Dữ liệu Tài sản</h1>
          <p className="text-gray-500 mt-1">Danh sách tòa nhà, khu trọ và các danh sách phòng hiện có.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <Plus size={18} />
            Thêm Tòa nhà
          </button>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Plus size={18} />
            Thêm Phòng/Căn hộ
          </button>
        </div>
      </div>

      {mockBuildings.map(building => {
        const buildingRooms = mockRooms.filter(r => r.buildingId === building.id);
        
        return (
          <div key={building.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Building Header */}
            <div className="bg-slate-50 border-b border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{building.name}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <MapPin size={16} />
                  <span>{building.address}</span>
                  <span className="mx-2">•</span>
                  <span>Tổng: <span className="font-semibold text-gray-700">{building.totalRooms} phòng</span></span>
                </div>
              </div>
            </div>

            {/* Rooms List */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {buildingRooms.map(room => (
                  <div key={room.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{room.name}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </div>
                    
                    <div className="space-y-3 mb-5">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Maximize size={16} className="text-gray-400" />
                        <span>Diện tích: {room.area} m²</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <AirVent size={16} className="text-gray-400 mt-0.5" />
                        <span className="leading-snug">Tiện ích: {room.amenities.join(', ')}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Giá thuê 1 tháng:</span>
                        <span className="font-semibold text-gray-800">{room.price1Month.toLocaleString('vi-VN')} ₫</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Gói 6 tháng:</span>
                        <span className="font-semibold text-emerald-600">{room.price6Months.toLocaleString('vi-VN')} ₫/th</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                      <button className="flex-1 text-sm bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-md font-medium transition-colors">Chỉnh sửa</button>
                      <button className="flex-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-md font-medium transition-colors">Cài đặt giá</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Properties;
