import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  User,
  Home,
  Clock,
  Loader2,
  Filter,
  Search,
  MessageSquare
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { partnerService } from '@/services/partnerService';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const StayServiceManagement: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getStayServiceRequests();
      setRequests(res.data || []);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      toastError('Không thể tải danh sách yêu cầu dịch vụ.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number | string, status: number) => {
    try {
      await partnerService.updateStayServiceStatus(id, status);
      toastSuccess('Cập nhật trạng thái thành công.');
      fetchRequests();
    } catch (error) {
      toastError('Không thể cập nhật trạng thái.');
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case 0: return 'Chờ xử lý';
      case 1: return 'Đang xử lý';
      case 2: return 'Hoàn thành';
      case 3: return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getStatusStyle = (status: number) => {
    switch (status) {
      case 0: return 'bg-amber-50 text-amber-700 border-amber-100';
      case 1: return 'bg-blue-50 text-blue-700 border-blue-100';
      case 2: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 3: return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchesStatus = statusFilter === 'all' || req.status === parseInt(statusFilter);
      const guestName = req.booking?.user?.name || '';
      const roomName = req.booking?.room?.title || '';
      const serviceName = req.service?.title || '';
      
      const searchHaystack = `${guestName} ${roomName} ${serviceName}`.toLowerCase();
      const matchesSearch = searchHaystack.includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchTerm]);

  if (loading && requests.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yêu cầu dịch vụ lưu trú</h1>
          <p className="text-gray-500 mt-1">Quản lý các yêu cầu từ khách đang lưu trú (Dọn phòng, đồ dùng, sự cố...).</p>
        </div>
        <Button onClick={fetchRequests} variant="outline" size="sm" className="gap-2">
            Làm mới
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo khách, phòng hoặc tên dịch vụ..."
            className="pl-10 h-10 rounded-xl"
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="Lọc trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="0">Chờ xử lý</SelectItem>
              <SelectItem value="1">Đang xử lý</SelectItem>
              <SelectItem value="2">Hoàn thành</SelectItem>
              <SelectItem value="3">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredRequests.length > 0 ? filteredRequests.map((req) => (
          <Card key={req.id} className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden border border-gray-100">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <div className={`w-2 sm:w-3 ${req.status === 0 ? 'bg-amber-500' : req.status === 1 ? 'bg-blue-500' : req.status === 2 ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                           <Zap size={20} />
                        </div>
                        <div>
                           <h3 className="font-bold text-gray-900 text-lg">{req.service?.title || 'Dịch vụ'}</h3>
                           <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1"><User size={14} /> {req.booking?.user?.name || 'Khách hàng'}</span>
                              <span className="text-gray-300">|</span>
                              <span className="flex items-center gap-1 font-semibold text-blue-600"><Home size={14} /> {req.booking?.room?.title || 'Phòng'}</span>
                           </div>
                        </div>
                      </div>
                      
                      {req.note && (
                        <div className="bg-slate-50 p-3 rounded-xl flex gap-2 items-start border border-slate-100">
                           <MessageSquare size={16} className="text-slate-400 mt-0.5 shrink-0" />
                           <p className="text-sm text-slate-600 italic">"{req.note}"</p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-400">
                         <span className="flex items-center gap-1"><Clock size={12} /> Gửi lúc: {new Date(req.created_at).toLocaleString('vi-VN')}</span>
                         <Badge className={`px-2 py-0 border ${getStatusStyle(req.status)}`}>
                            {getStatusLabel(req.status)}
                         </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-center">
                      {req.status === 0 && (
                        <Button 
                          onClick={() => handleUpdateStatus(req.id, 1)}
                          className="bg-blue-600 hover:bg-blue-700 h-9 px-4 rounded-xl font-bold"
                        >
                          Tiếp nhận
                        </Button>
                      )}
                      {req.status === 1 && (
                        <Button 
                          onClick={() => handleUpdateStatus(req.id, 2)}
                          className="bg-emerald-600 hover:bg-emerald-700 h-9 px-4 rounded-xl font-bold"
                        >
                          Hoàn thành
                        </Button>
                      )}
                      {(req.status === 0 || req.status === 1) && (
                        <Button 
                          onClick={() => handleUpdateStatus(req.id, 3)}
                          variant="outline" 
                          className="text-rose-600 border-rose-100 hover:bg-rose-50 h-9 px-4 rounded-xl"
                        >
                          Hủy
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="bg-white border-2 border-dashed border-gray-100 rounded-[32px] p-20 flex flex-col items-center justify-center text-center">
             <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-4">
                <Filter size={32} />
             </div>
             <p className="text-gray-400 font-medium">Không tìm thấy yêu cầu dịch vụ nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StayServiceManagement;
