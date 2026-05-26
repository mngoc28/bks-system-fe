import React, { useState, useEffect, ChangeEvent } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Plus, Edit, Trash2, Zap, Droplets, CircleDollarSign, Building2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { partnerService } from '@/services/partnerService';
import { Service } from './types';
import InlineSheet from './components/InlineSheet';
import { toastError, toastSuccess } from '@/components/ui/toast';
import PropertySelector from './components/PropertySelector';

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
    status: 'Hoạt động',
  });
  const [filterPropertyId, setFilterPropertyId] = useState<string | null>(null);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchServices(abortController.signal);
    fetchProperties(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, []);

  const fetchProperties = async (signal?: AbortSignal) => {
    try {
      const res: any = await partnerService.getProperties(undefined, { signal });
      const payload = res?.data?.data || res?.data || res || [];
      setProperties(Array.isArray(payload) ? payload : (payload?.data || []));
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || signal?.aborted) {
        return;
      }
      console.error(error);
    }
  };

  const extractRows = (res: any): any[] => {
    const payload = res?.status ? res : (res?.data ?? res);
    if (Array.isArray(payload)) return payload;

    const candidates = [
      payload?.data?.data,
      payload?.data,
      payload?.message?.data?.data,
      payload?.message?.data,
      payload?.message,
      payload?.result?.data,
      payload?.result,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) return candidate;
    }

    return [];
  };

  const normalizeServices = (rows: any[]): Service[] => {
    return (rows || []).map((item: any) => ({
      id: item.id,
      name: item.name ?? '',
      price: Number(item.price ?? item.service_price ?? 0),
      unit: item.unit ?? item.unit_name ?? 'lượt',
      category: item.category ?? 'Dịch vụ thêm',
      status: item.status ?? 'Hoạt động',
    }));
  };

  const fetchServices = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res: any = await partnerService.getAllServices({ signal });
      setServices(normalizeServices(extractRows(res)));
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.name === 'AbortError' || signal?.aborted) {
        return;
      }
      console.error('Error fetching services:', error);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setForm(service);
      // In a real app, we'd load linked properties here
      setSelectedPropertyIds([]); 
    } else {
      setEditingService(null);
      setForm({ name: '', price: 0, unit: '', category: 'Dịch vụ thêm', status: 'Hoạt động' });
      setSelectedPropertyIds([]);
    }
    setIsModalOpen(true);
  };

  const toggleProperty = (id: string) => {
    setSelectedPropertyIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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
      toastSuccess('Đã lưu dịch vụ.');
    } catch (_error) {
      toastError('Lỗi khi lưu dịch vụ.');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await partnerService.deleteService(id);
      fetchServices();
      toastSuccess('Đã xóa dịch vụ.');
    } catch (_error) {
      toastError('Lỗi khi xóa dịch vụ.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" showText text="Đang tải danh sách dịch vụ..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-center gap-6">
          <PropertySelector 
            selectedId={filterPropertyId} 
            onSelect={setFilterPropertyId} 
            properties={properties}
            className="w-64"
          />
          <div className="hidden h-10 w-px bg-gray-100 md:block"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dịch vụ & Lắp đặt</h1>
            <p className="mt-1 text-gray-500">Quản lý các dịch vụ có phí cho tòa nhà.</p>
          </div>
        </div>
        <Button onClick={() => handleOpenModal()} className="h-10 bg-blue-600 px-4 font-bold text-white hover:bg-blue-700">
          <Plus size={18} className="mr-2" /> Thêm dịch vụ
        </Button>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="divide-y divide-gray-100">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">mỗi {service.unit}</p>
                  </div>
                  <div className="flex gap-2">
                     <Button onClick={() => handleOpenModal(service)} variant="ghost" size="icon" className="size-8 text-gray-400"><Edit size={16}/></Button>
                     <Button onClick={() => handleDelete(service.id)} variant="ghost" size="icon" className="size-8 text-gray-400"><Trash2 size={16}/></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <InlineSheet
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
        widthClassName="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">Lưu thay đổi</Button>
          </div>
        }
      >
          <div className="grid gap-4">
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

            <div className="mt-4 border-t border-gray-100 pt-4">
                <Label className="mb-3 flex items-center gap-2 font-bold text-blue-700">
                   <Building2 size={16} /> Tòa nhà áp dụng
                </Label>
                <div className="grid max-h-48 grid-cols-2 gap-3 overflow-y-auto pr-2">
                  <div 
                    onClick={() => setSelectedPropertyIds([])}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-all ${selectedPropertyIds.length === 0 ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-600 hover:border-blue-100'}`}
                  >
                    <Checkbox checked={selectedPropertyIds.length === 0} />
                    <span className="text-xs font-medium">Tất cả tòa nhà</span>
                  </div>
                  {properties.map((property) => (
                    <div 
                      key={property.id}
                      onClick={() => toggleProperty(String(property.id))}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-all ${selectedPropertyIds.includes(String(property.id)) ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-100 bg-white text-gray-600 hover:border-blue-100'}`}
                    >
                      <Checkbox checked={selectedPropertyIds.includes(String(property.id))} />
                      <span className="truncate text-xs font-medium">{property.name || property.title}</span>
                    </div>
                  ))}
                </div>
                {selectedPropertyIds.length > 0 && (
                  <p className="mt-2 text-[10px] italic text-gray-400">* Dịch vụ này sẽ chỉ xuất hiện khi lọc theo các tòa nhà đã chọn.</p>
                )}
            </div>
          </div>
      </InlineSheet>
    </div>
  );
};

export default Services;

