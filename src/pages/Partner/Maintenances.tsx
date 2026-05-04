import React, { useState, useEffect } from 'react';
import { Wrench, MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { MaintenanceRequest } from './types';
import { Button } from "@/components/ui/button";
import { partnerService } from '@/services/partnerService';
import { toastInfo } from '@/components/ui/toast';
import BuildingSelector from './components/BuildingSelector';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Maintenances: React.FC = () => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBuildingId, setFilterBuildingId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchMaintenances();
  }, [currentPage, pageSize, filterBuildingId]);

  const normalizeStatus = (status: unknown): MaintenanceRequest['status'] => {
    const value = String(status || '').toLowerCase();
    if (value.includes('planned') || value.includes('pending') || value.includes('cho')) return 'Chờ xử lý';
    if (value.includes('in_progress') || value.includes('processing') || value.includes('đang')) return 'Đang xử lý';
    if (value.includes('completed') || value.includes('done') || value.includes('cancel')) return 'Đã hoàn thành';
    return 'Đang chờ';
  };

  const normalizeMaintenances = (rows: any[]): MaintenanceRequest[] => {
    return (rows || []).map((item: any) => ({
      id: item.id,
      roomName: item.roomName ?? item.room_name ?? item.room?.title ?? `Phòng #${item.room_id ?? 'N/A'}`,
      buildingName: item.buildingName ?? item.property_name ?? item.property?.name ?? item.building?.name ?? '',
      type: item.type ?? item.title ?? item.maintenance_type ?? 'Sửa chữa',
      description: item.description ?? item.issueDescription ?? '',
      status: normalizeStatus(item.status),
      createdAt: item.createdAt ?? item.created_at ?? new Date().toISOString(),
      customerName: item.customerName ?? item.partner_name ?? '',
    }));
  };

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getMaintenances({
        page: currentPage,
        per_page: pageSize,
        property_id: filterBuildingId || undefined
      });
      
      const payload = res?.status ? res : (res?.data ?? res);
      let data: any[] = [];
      let total = 0;
      let lastPage = 1;

      // Detection logic for Laravel paginated response vs Flat array
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        // Try to find the data array
        data = payload.data?.data || (Array.isArray(payload.data) ? payload.data : (payload.data || []));
        
        // If it's a pagination object, it should have meta or total
        const meta = payload.meta || payload;
        if (meta.total !== undefined) {
          total = meta.total;
          lastPage = meta.last_page || 1;
        } else {
          total = data.length;
          lastPage = Math.ceil(total / pageSize);
        }
      } else {
        data = Array.isArray(payload) ? payload : [];
        total = data.length;
        lastPage = Math.ceil(total / pageSize);
      }

      let allNormalized = normalizeMaintenances(data);

      // fallback: filter by building if the server returned all buildings (ignored filter param)
      if (filterBuildingId && allNormalized.some(r => r.buildingName !== filterBuildingId)) {
        allNormalized = allNormalized.filter(r => r.buildingName === filterBuildingId);
        total = allNormalized.length;
        lastPage = Math.ceil(total / pageSize);
      }

      // fallback: slice if the server returned all records (ignored pagination params)
      if (data.length > pageSize && total === data.length) {
        setRequests(allNormalized.slice((currentPage - 1) * pageSize, currentPage * pageSize));
        setTotalItems(allNormalized.length);
        setTotalPages(Math.ceil(allNormalized.length / pageSize));
      } else {
        setRequests(allNormalized);
        setTotalItems(total);
        setTotalPages(lastPage);
      }
      
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
    setRequests(requests.map(r => String(r.id) === String(id) ? { ...r, status: newStatus as any } : r));
    toastInfo('Đã cập nhật trạng thái bảo trì.');
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-6">
          <BuildingSelector 
            selectedId={filterBuildingId} 
            onSelect={setFilterBuildingId} 
            className="w-64"
          />
          <div className="h-10 w-[1px] bg-gray-100 hidden md:block"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Bảo trì & Sự cố</h1>
            <p className="text-gray-500 mt-1">Xử lý các yêu cầu sửa chữa và bảo trì từ cư dân.</p>
          </div>
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
                      <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl border border-slate-100">
                        <Wrench size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm whitespace-nowrap">{request.type || 'Sửa chữa'}</h3>
                        <div className="flex flex-col gap-0.5 mt-1">
                          {request.buildingName && (
                            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{request.buildingName}</span>
                          )}
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                            <MapPin size={12} className="text-gray-400" /> {request.roomName || 'N/A'}
                          </div>
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
                       { (request.status === 'Đang xử lý' || request.status === 'Đang sửa' ) && (
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

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Hiển thị mỗi trang</span>
            <Select 
              value={String(pageSize)} 
              onValueChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-20 bg-white">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-slate-400 ml-2">
              Tổng {totalItems} yêu cầu
            </span>
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={`cursor-pointer ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
              
              <div className="flex items-center gap-1 mx-2">
                <span className="text-xs font-bold text-slate-700">Trang {currentPage}</span>
                <span className="text-xs text-slate-400">/ {totalPages}</span>
              </div>

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={`cursor-pointer ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default Maintenances;
