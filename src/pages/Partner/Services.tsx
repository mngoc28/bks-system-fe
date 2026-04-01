import React from 'react';
import { Settings, Zap, Shield, CreditCard } from 'lucide-react';

const Services: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dịch vụ & Cài đặt</h1>
        <p className="text-gray-500 mt-1">Quản lý các dịch vụ đi kèm và cấu hình tài khoản chủ nhà.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Services Configuration */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Zap size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Bảng giá dịch vụ</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">Các dịch vụ này sẽ được hiển thị cho khách hàng chọn khi thuê phòng của bạn.</p>
          
          <div className="space-y-3">
            {[
              { name: 'Điện', unit: 'kWh', price: '3,500 ₫' },
              { name: 'Nước', unit: 'Người/Tháng', price: '100,000 ₫' },
              { name: 'Gửi xe máy', unit: 'Chiếc/Tháng', price: '150,000 ₫' },
              { name: 'Dọn phòng', unit: 'Lần', price: '50,000 ₫' }
            ].map((svc, i) => (
              <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-gray-50">
                <span className="font-medium text-gray-700">{svc.name}</span>
                <span className="text-blue-600 font-semibold">{svc.price} <span className="text-xs text-gray-500 font-normal">/{svc.unit}</span></span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors font-medium">
            + Thêm dịch vụ mới
          </button>
        </div>

        {/* Payment & Security Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <CreditCard size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Tài khoản nhận tiền</h2>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-sm text-gray-500">Ngân hàng MB Bank</p>
              <p className="font-mono font-bold text-gray-800 text-lg mt-1">9999 8888 1234</p>
              <p className="text-sm font-medium text-gray-700 mt-1">NGUYEN TRAN HOST</p>
            </div>
            <button className="mt-3 text-sm text-blue-600 font-medium hover:underline">Sửa thông tin thanh toán</button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <Shield size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Quy tắc đặt cọc</h2>
            </div>
            <p className="text-sm text-gray-600 mb-3">Thông số này dùng để tính tiền cọc tự động khi khách chuyển vào.</p>
            <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
              <span className="text-gray-700">Mức cọc chuẩn</span>
              <span className="font-semibold px-3 py-1 bg-gray-100 rounded-md">1 Tháng tiền phòng</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
