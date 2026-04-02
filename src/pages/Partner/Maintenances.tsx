import React, { useState, useEffect } from 'react';
import { Wrench, MapPin, CheckCircle, AlertTriangle, Play, Check, Filter, Loader2 } from 'lucide-react';
import { MaintenanceRequest } from './types';
import { Button } from "@/components/ui/button";
import { partnerService } from '@/services/partnerService';

const Maintenances: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getMaintenances();
      setRequests(res.data.data.data || res.data.data || []);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Đang chờ': case 'Chờ xử lý': return 'bg-red-50 text-red-700 border-red-100';
      case 'Đang xử lý': case 'Đang sửa': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Đã hoàn thành': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const safeHandleUpdate = (id: string | number, newStatus: string) => {
    if (window.confirm(`Xác nhận cập nhật trạng thái bảo trì?`)) {
      // Backend action needed, for now state update or implement a PUT if available
      setRequests(requests.map(r => String(r.id) === String(id) ? { ...r, status: newStatus as any } : r));
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Bảo trì & Sự cố</h1>
          <p className="text-gray-500 mt-1">Xử lý các yêu cầu sửa chữa và bảo trì từ cư dân.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="flex items-center gap-2 h-10 px-4">
             <Filter size={16} /> Lọc
           </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 uppercase text-[10px] font-bold text-gray-500 tracking-wider">
                <th className="px-6 py-4">Sự cố / Phòng</th>
                <th className="px-6 py-4">Mô tả chi tiết</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Trình tự xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length > 0 ? requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 text-gray-500 rounded-lg">
                        <Wrench size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm whitespace-nowrap">{request.type || 'Sửa chữa'}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1 whitespace-nowrap">
                          <MapPin size={12} /> {request.roomName || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-gray-600 line-clamp-2 max-w-xs">{request.description}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">Yêu cầu: {new Date(request.createdAt).toLocaleDateString('vi-VN')}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       { (request.status === 'Đang chờ' || request.status === 'Chờ xử lý') && (
                         <Button onClick={() => safeHandleUpdate(request.id, 'Đang xử lý')} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white font-bold h-8">Tiếp nhận</Button>
                       )}
                       { (request.status === 'Đan xử lý' || request.status === 'Đang sửa' ) && (
                         <Button onClick={() => safeHandleUpdate(request.id, 'Đã hoàn thành')} size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8">Xong</Button>
                       )}
                       { request.status === 'Đã hoàn thành' && (
                          <div className="text-emerald-500 flex items-center justify-center p-2"><CheckCircle size={20} /></div>
                       )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">Chưa có yêu cầu bảo trì nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Maintenances;
