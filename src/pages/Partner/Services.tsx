import React, { useState, useEffect, ChangeEvent } from 'react';
import { Plus, Edit, Trash2, Zap, Droplets, CircleDollarSign, Settings, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { partnerService } from '@/services/partnerService';
import { Service } from './types';

const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<Partial<Service>>({
    name: '',
    price: 0,
    unit: '',
    category: 'Dịch vụ thêm',
    status: 'Hoạt động'
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getAllServices();
      setServices(res.data.data.data || res.data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setForm(service);
    } else {
      setEditingService(null);
      setForm({ name: '', price: 0, unit: '', category: 'Dịch vụ thêm', status: 'Hoạt động' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingService) {
        await partnerService.updateService(String(editingService.id), form);
      } else {
        await partnerService.createService(form);
      }
      fetchServices();
      setIsModalOpen(false);
    } catch (error) {
      alert('Lỗi khi lưu dịch vụ.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Bạn có muốn xóa dịch vụ này?')) {
      try {
        await partnerService.deleteService(id);
        fetchServices();
      } catch (error) {
        alert('Lỗi khi xóa dịch vụ.');
      }
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dịch vụ & Lắp đặt</h1>
          <p className="text-gray-500 mt-1">Quản lý các dịch vụ có phí cho tòa nhà.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 h-10 px-4 text-white">
          <Plus size={18} className="mr-2" /> Thêm dịch vụ
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {services.map((service) => (
                <div key={service.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      {service.unit === 'kWh' ? <Zap size={20} /> : service.unit === 'khối' ? <Droplets size={20} /> : <CircleDollarSign size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{service.name}</h3>
                      <p className="text-xs text-gray-500">{service.category} • {service.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{Number(service.price).toLocaleString('vi-VN')} ₫</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">mỗi {service.unit}</p>
                    </div>
                    <div className="flex gap-2">
                       <Button onClick={() => handleOpenModal(service)} variant="ghost" size="icon" className="text-gray-400 h-8 w-8"><Edit size={16}/></Button>
                       <Button onClick={() => handleDelete(service.id)} variant="ghost" size="icon" className="text-gray-400 h-8 w-8"><Trash2 size={16}/></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 font-bold mb-4 text-gray-800">
              <Settings size={18} className="text-blue-500" /> Cài đặt chung
            </h2>
            <p className="text-sm text-gray-500 italic">Các cài đặt thông báo hóa đơn sẽ được áp dụng cho tất cả khách thuê.</p>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên dịch vụ</Label>
              <Input value={form.name} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, name: e.target.value})} placeholder="VD: Tiền điện..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Đơn giá (₫)</Label>
                <Input type="number" value={form.price} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, price: Number(e.target.value)})} />
              </div>
              <div className="grid gap-2">
                <Label>Đơn vị tính</Label>
                <Input value={form.unit} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, unit: e.target.value})} placeholder="VD: kWh, khối..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Services;
