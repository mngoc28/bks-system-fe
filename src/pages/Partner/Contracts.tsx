import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Plus, Filter, 
  Download, Eye, User, 
  Home, CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { partnerService } from '@/services/partnerService';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlainTextarea } from "@/components/ui/textarea";

interface Booking {
  id: number;
  user_name: string;
  room_name: string;
  start_date: string;
  end_date: string;
  status: string | number;
}

interface Contract {
  id: number;
  booking_id: number;
  title: string;
  content: string;
  status: number;
  type: string;
  created_at: string;
  booking?: {
    user?: { name: string };
    room?: { title: string; name?: string; building?: { name: string } };
  };
}

const Contracts: React.FC = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchContracts();
    fetchConfirmedBookings();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getContracts();
      setContracts(res?.data || []);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toastError('Không thể tải danh sách hợp đồng.');
    } finally {
      setLoading(false);
    }
  };

  const fetchConfirmedBookings = async () => {
    try {
      // Pass numeric status 1 for 'confirmed'
      const res: any = await partnerService.getBookings({ status: 1 });
      const data = res?.data?.data || res?.data || res || [];
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleCreateContract = async () => {
    if (!selectedBooking) {
      toastError('Vui lòng chọn một yêu cầu đặt phòng.');
      return;
    }
    if (!formData.title || !formData.content) {
      toastError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    try {
      const newContract = {
        booking_id: selectedBooking.id,
        title: formData.title,
        content: formData.content,
        type: 'Rental',
      };
      await partnerService.createContract(newContract);
      toastSuccess('Tạo hợp đồng thành công!');
      setIsCreateOpen(false);
      setFormData({ title: '', content: '' });
      setSelectedBooking(null);
      fetchContracts();
    } catch {
      toastError('Lỗi khi tạo hợp đồng.');
    }
  };

  const getStatusBadge = (status: number) => {
    switch(status) {
      case 1:
        return <Badge className="border-none bg-amber-100 text-amber-700">Chờ ký</Badge>;
      case 2:
        return <Badge className="border-none bg-emerald-100 text-emerald-700">Đã ký</Badge>;
      case 3:
        return <Badge className="border-none bg-red-100 text-red-700">Đã hủy</Badge>;
      default:
        return <Badge className="border-none bg-gray-100 text-gray-700">N/A</Badge>;
    }
  };

  const filteredContracts = contracts.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.booking?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-gray-500">Đang tải danh sách hợp đồng...</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Hợp đồng</h1>
          <p className="text-gray-500">Quản lý và tạo hợp đồng thuê phòng điện tử.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus size={18} /> Tạo hợp đồng mới
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Tìm theo tiêu đề hoặc tên khách..." 
            className="h-11 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex h-11 items-center gap-2">
          <Filter size={18} /> Bộ lọc
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-[11px] font-bold uppercase tracking-widest text-gray-500">
              <th className="px-6 py-4">Hợp đồng</th>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Phòng</th>
              <th className="px-6 py-4">Ngày tạo</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredContracts.map((contract) => (
              <tr key={contract.id} className="transition-colors hover:bg-blue-50/20">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{contract.title}</p>
                      <p className="text-xs text-gray-400">#CTR-{contract.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-medium text-gray-700">
                    <User size={14} className="text-gray-400" /> {contract.booking?.user?.name || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-bold text-gray-900">{contract.booking?.room?.building?.name || 'N/A'}</p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Home size={12} className="text-gray-400" /> 
                      {contract.booking?.room?.title || contract.booking?.room?.name || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(contract.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(contract.status)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-8 text-blue-600 hover:bg-blue-50"
                      onClick={() => navigate(`/partner/contracts/${contract.id}`)}
                      title="Mở trang chi tiết"
                    >
                      <Eye size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 text-gray-400">
                      <Download size={18} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredContracts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center italic text-gray-400">
                  Chưa có hợp đồng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tạo Hợp đồng Mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Chọn yêu cầu đặt phòng (Xác nhận)</Label>
              <div className="grid max-h-[150px] grid-cols-1 gap-2 overflow-y-auto rounded-md border p-2">
                {bookings.length > 0 ? bookings.map((b) => (
                  <div 
                    key={b.id} 
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${selectedBooking?.id === b.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedBooking(b)}
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">{b.user_name}</p>
                      <p className="text-xs text-gray-500">{b.room_name} • {new Date(b.start_date).toLocaleDateString('vi-VN')}</p>
                    </div>
                    {selectedBooking?.id === b.id && <CheckCircle2 size={16} className="text-blue-600" />}
                  </div>
                )) : (
                  <p className="p-2 text-center text-sm italic text-gray-400">Không có yêu cầu đặt phòng nào cần làm hợp đồng.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tiêu đề hợp đồng</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="VD: Hợp đồng thuê phòng 101 - Khách Nguyễn Văn A" 
              />
            </div>

            <div className="space-y-2">
              <Label>Nội dung hợp đồng</Label>
              <PlainTextarea 
                value={formData.content} 
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="min-h-[200px]"
                placeholder="Nhập các điều khoản và nội dung hợp đồng..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
            <Button onClick={handleCreateContract} className="bg-blue-600 hover:bg-blue-700">Tạo hợp đồng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Contracts;
