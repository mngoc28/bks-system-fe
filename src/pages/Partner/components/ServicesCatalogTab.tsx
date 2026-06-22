import React, { useMemo, useState, ChangeEvent } from 'react';
import { Plus, Edit, Trash2, Zap, Droplets, CircleDollarSign, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { partnerService } from '@/services/partnerService';
import { Service } from '../types';
import InlineSheet from './InlineSheet';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { extractApiRows } from '../utils/extractApiRows';
import {
  useInvalidatePartnerServicesCatalog,
  usePartnerServicesCatalogQuery,
} from '@/hooks/Partner/usePartnerCatalogQuery';

interface ServicesCatalogTabProps {
  properties: Array<{ id: number | string; name: string }>;
}

const normalizeServices = (rows: unknown[]): Service[] => {
  return (rows || []).map((item) => {
    const row = item as Record<string, unknown>;
    return {
      id: row.id as string | number,
      name: String(row.name ?? ''),
      price: Number(row.price ?? row.service_price ?? 0),
      unit: String(row.unit ?? row.unit_name ?? 'lượt'),
      category: String(row.category ?? 'Dịch vụ thêm'),
      status: String(row.status ?? 'Hoạt động'),
    };
  });
};

const ServicesCatalogTab: React.FC<ServicesCatalogTabProps> = ({ properties }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<Partial<Service>>({
    name: '',
    price: 0,
    unit: '',
    category: 'Dịch vụ thêm',
    status: 'Hoạt động',
  });
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);

  const { data: servicesRes, isLoading } = usePartnerServicesCatalogQuery();
  const invalidateServicesCatalog = useInvalidatePartnerServicesCatalog();

  const services = useMemo(
    () => normalizeServices(extractApiRows(servicesRes)),
    [servicesRes],
  );

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setForm(service);
      setSelectedPropertyIds([]);
    } else {
      setEditingService(null);
      setForm({ name: '', price: 0, unit: '', category: 'Dịch vụ thêm', status: 'Hoạt động' });
      setSelectedPropertyIds([]);
    }
    setIsModalOpen(true);
  };

  const toggleProperty = (id: string) => {
    setSelectedPropertyIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    try {
      if (editingService) {
        await partnerService.updateService(String(editingService.id), form);
      } else {
        await partnerService.createService(form);
      }
      await invalidateServicesCatalog();
      setIsModalOpen(false);
      toastSuccess('Đã lưu dịch vụ.');
    } catch {
      toastError('Lỗi khi lưu dịch vụ.');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await partnerService.deleteService(id);
      await invalidateServicesCatalog();
      toastSuccess('Đã xóa dịch vụ.');
    } catch {
      toastError('Lỗi khi xóa dịch vụ.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-gray-200 bg-white">
        <Spinner size="md" showText text="Đang tải..." />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-3 py-2 sm:px-4">
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{services.length}</span> dịch vụ
          </p>
          <Button
            onClick={() => handleOpenModal()}
            size="sm"
            className="h-8 bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={14} className="mr-1" /> Thêm
          </Button>
        </div>

        {services.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            Chưa có dịch vụ. Nhấn &quot;Thêm&quot; để tạo mới.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2 sm:px-4">Tên dịch vụ</th>
                  <th className="hidden px-3 py-2 sm:table-cell sm:px-4">Loại</th>
                  <th className="px-3 py-2 text-right sm:px-4">Đơn giá</th>
                  <th className="hidden px-3 py-2 sm:table-cell sm:px-4">Đơn vị</th>
                  <th className="w-16 px-2 py-2 sm:px-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {services.map((service) => (
                  <tr key={service.id} className="group hover:bg-slate-50/80">
                    <td className="px-3 py-2.5 sm:px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                          {service.unit === 'kWh' ? (
                            <Zap size={14} />
                          ) : service.unit === 'khối' ? (
                            <Droplets size={14} />
                          ) : (
                            <CircleDollarSign size={14} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-800">{service.name}</p>
                          <p className="text-[11px] text-gray-400 sm:hidden">
                            {service.category} · {service.unit}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-2.5 text-xs text-gray-500 sm:table-cell sm:px-4">
                      {service.category}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-blue-600 sm:px-4">
                      {Number(service.price).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="hidden px-3 py-2.5 text-xs text-gray-500 sm:table-cell sm:px-4">
                      {service.unit}
                    </td>
                    <td className="px-2 py-2.5 sm:px-3">
                      <div className="flex justify-end gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                        <Button
                          onClick={() => handleOpenModal(service)}
                          variant="ghost"
                          size="icon"
                          className="size-7 text-gray-400"
                          aria-label={`Chỉnh sửa ${service.name}`}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          onClick={() => handleDelete(service.id)}
                          variant="ghost"
                          size="icon"
                          className="size-7 text-gray-400 hover:text-red-600"
                          aria-label={`Xóa ${service.name}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InlineSheet
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
        widthClassName="w-full md:max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Tên dịch vụ</Label>
            <Input
              value={form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="VD: Tiền điện..."
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Đơn giá (₫)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, price: Number(e.target.value) })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Đơn vị tính</Label>
              <Input
                value={form.unit}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setForm({ ...form, unit: e.target.value })
                }
                placeholder="VD: kWh, khối..."
              />
            </div>
          </div>

          <div className="mt-4 border-t border-gray-100 pt-4">
            <Label className="mb-3 flex items-center gap-2 font-bold text-blue-700">
              <Building2 size={16} /> Tòa nhà áp dụng
            </Label>
            <div className="grid max-h-48 grid-cols-1 gap-3 overflow-y-auto pr-2 sm:grid-cols-2">
              <div
                onClick={() => setSelectedPropertyIds([])}
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-all ${
                  selectedPropertyIds.length === 0
                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                    : 'border-gray-100 bg-white text-gray-600 hover:border-blue-100'
                }`}
              >
                <Checkbox checked={selectedPropertyIds.length === 0} />
                <span className="text-xs font-medium">Tất cả tòa nhà</span>
              </div>
              {properties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => toggleProperty(String(property.id))}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-all ${
                    selectedPropertyIds.includes(String(property.id))
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-100 bg-white text-gray-600 hover:border-blue-100'
                  }`}
                >
                  <Checkbox checked={selectedPropertyIds.includes(String(property.id))} />
                  <span className="truncate text-xs font-medium">{property.name}</span>
                </div>
              ))}
            </div>
            {selectedPropertyIds.length > 0 && (
              <p className="mt-2 text-[10px] italic text-gray-400">
                * Dịch vụ này sẽ chỉ xuất hiện khi lọc theo các tòa nhà đã chọn.
              </p>
            )}
          </div>
        </div>
      </InlineSheet>
    </>
  );
};

export default ServicesCatalogTab;
