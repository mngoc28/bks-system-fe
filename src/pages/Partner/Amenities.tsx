import React, { useState, useEffect, ChangeEvent } from 'react';
import { 
  Plus, Tv, Wifi, Wind, Coffee, Waves, Car, 
  UtensilsCrossed, Bath, Edit, Trash2, Laptop, ShieldCheck, Dumbbell, Loader2
} from 'lucide-react';
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
import { Amenity } from './types';

const iconMap: Record<string, any> = {
  'Wifi': Wifi,
  'Wind': Wind,
  'Tv': Tv,
  'Coffee': Coffee,
  'Waves': Waves,
  'Car': Car,
  'UtensilsCrossed': UtensilsCrossed,
  'Bath': Bath,
  'Laptop': Laptop,
  'ShieldCheck': ShieldCheck,
  'Dumbbell': Dumbbell
};

const Amenities: React.FC = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [form, setForm] = useState<Partial<Amenity>>({ name: '', category: 'Tiện nghi phòng' });
  const [selectedIconName, setSelectedIconName] = useState('Wifi');

  useEffect(() => {
    fetchAmenities();
  }, []);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const res: any = await partnerService.getAllAmenities();
      setAmenities(res.data.data.data || res.data.data || []);
    } catch (error) {
      console.error('Error fetching amenities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (amenity?: Amenity) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setForm(amenity);
      setSelectedIconName(typeof amenity.icon === 'string' ? amenity.icon : 'Wifi');
    } else {
      setEditingAmenity(null);
      setForm({ name: '', category: 'Tiện nghi phòng' });
      setSelectedIconName('Wifi');
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const data = { ...form, icon: selectedIconName };
      if (editingAmenity) {
        await partnerService.updateAmenity(String(editingAmenity.id), data);
      } else {
        await partnerService.createAmenity(data);
      }
      fetchAmenities();
      setIsModalOpen(false);
    } catch (error) {
      alert('Lỗi khi lưu tiện ích.');
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm('Bạn có muốn xóa tiện ích này?')) {
      try {
        await partnerService.deleteAmenity(id);
        fetchAmenities();
      } catch (error) {
        alert('Lỗi khi xóa tiện ích.');
      }
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Tiện ích</h1>
          <p className="text-gray-500 mt-1">Danh mục các thành phần đi kèm trong phòng/biệt thự.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 h-10 font-bold">
          <Plus size={18} className="mr-2" /> Thêm Tiện ích
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {amenities.map((item) => {
              const Icon = iconMap[String(item.icon)] || Wifi;
              return (
                <div key={item.id} className="group p-4 border border-gray-100 rounded-xl bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon size={24} />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button onClick={() => handleOpenModal(item)} variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-amber-600"><Edit size={14} /></Button>
                      <Button onClick={() => handleDelete(item.id)} variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-600"><Trash2 size={14} /></Button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">Category: {item.category || 'N/A'}</p>
                  </div>
                </div>
              );
            })}
          </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingAmenity ? 'Cập nhật tiện ích' : 'Thêm tiện ích mới'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tên tiện ích</Label>
              <Input value={form.name} onChange={(e: ChangeEvent<HTMLInputElement>) => setForm({...form, name: e.target.value})} placeholder="VD: Tủ lạnh mini..." />
            </div>
            <div className="grid gap-2">
              <Label>Phân loại</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="Tiện nghi phòng">Tiện nghi phòng</option>
                <option value="Giải trí">Giải trí</option>
                <option value="Kết nối">Kết nối</option>
              </select>
            </div>
            <div className="grid gap-2 text-xs text-gray-500 italic">* Các icons được lựa chọn từ thư mục hệ thống.</div>
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

export default Amenities;
