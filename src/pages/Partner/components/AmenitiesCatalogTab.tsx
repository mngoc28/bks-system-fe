import React, { useMemo, useState, ChangeEvent } from 'react';
import {
  Plus,
  Tv,
  Wifi,
  Wind,
  Coffee,
  Waves,
  Car,
  UtensilsCrossed,
  Bath,
  Edit,
  Trash2,
  Laptop,
  ShieldCheck,
  Dumbbell,
  Loader2,
  BedDouble,
  LampCeiling,
  Camera,
  Armchair,
  SunMedium,
  ShieldAlert,
  Building2,
  Check,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { partnerService } from '@/services/partnerService';
import { Amenity } from '../types';
import InlineSheet from './InlineSheet';
import { toastError, toastSuccess, toastInfo } from '@/components/ui/toast';
import PropertySelector from './PropertySelector';
import { extractApiRows } from '../utils/extractApiRows';
import {
  useInvalidatePartnerAmenitiesCatalog,
  usePartnerAmenitiesCatalogQuery,
} from '@/hooks/Partner/usePartnerCatalogQuery';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const iconMap: Record<string, any> = {
  Wifi,
  Wind,
  Tv,
  Coffee,
  Waves,
  Car,
  UtensilsCrossed,
  Bath,
  Laptop,
  ShieldCheck,
  Dumbbell,
  BedDouble,
  LampCeiling,
  Camera,
  Armchair,
  SunMedium,
  ShieldAlert,
};

const iconOptions = [
  'Wifi',
  'Wind',
  'Tv',
  'Coffee',
  'Waves',
  'Car',
  'UtensilsCrossed',
  'Bath',
  'Laptop',
  'ShieldCheck',
  'Dumbbell',
  'BedDouble',
  'LampCeiling',
  'Camera',
  'Armchair',
  'SunMedium',
  'ShieldAlert',
];

const fallbackIconOptions = [
  'BedDouble',
  'LampCeiling',
  'Camera',
  'Armchair',
  'SunMedium',
  'Laptop',
  'ShieldCheck',
  'Dumbbell',
];

const inferAmenityIconName = (name: string): string => {
  const normalized = name.toLowerCase();
  if (normalized.includes('wifi') || normalized.includes('internet') || normalized.includes('kết nối'))
    return 'Wifi';
  if (normalized.includes('điều hòa') || normalized.includes('máy lạnh') || normalized.includes('wind'))
    return 'Wind';
  if (normalized.includes('tv') || normalized.includes('tivi') || normalized.includes('giải trí'))
    return 'Tv';
  if (normalized.includes('cà phê')) return 'Coffee';
  if (normalized.includes('bơi') || normalized.includes('nước') || normalized.includes('spa'))
    return 'Waves';
  if (normalized.includes('xe') || normalized.includes('đỗ xe') || normalized.includes('parking'))
    return 'Car';
  if (
    normalized.includes('bếp') ||
    normalized.includes('ăn') ||
    normalized.includes('phòng ăn') ||
    normalized.includes('nấu')
  )
    return 'UtensilsCrossed';
  if (
    normalized.includes('tắm') ||
    normalized.includes('vệ sinh') ||
    normalized.includes('bồn') ||
    normalized.includes('toilet')
  )
    return 'Bath';
  if (
    normalized.includes('laptop') ||
    normalized.includes('làm việc') ||
    normalized.includes('bàn làm việc') ||
    normalized.includes('văn phòng')
  )
    return 'Laptop';
  if (normalized.includes('báo cháy') || normalized.includes('an ninh') || normalized.includes('bảo vệ'))
    return 'ShieldCheck';
  if (normalized.includes('gym') || normalized.includes('thể hình')) return 'Dumbbell';
  if (normalized.includes('giường') || normalized.includes('ngủ') || normalized.includes('bed'))
    return 'BedDouble';
  if (normalized.includes('đèn') || normalized.includes('led') || normalized.includes('ánh sáng'))
    return 'LampCeiling';
  if (normalized.includes('camera') || normalized.includes('giám sát')) return 'Camera';
  if (normalized.includes('ghế') || normalized.includes('chair')) return 'Armchair';
  if (normalized.includes('cửa sổ') || normalized.includes('window') || normalized.includes('view'))
    return 'SunMedium';
  if (normalized.includes('hệ thống báo cháy') || normalized.includes('báo cháy'))
    return 'ShieldAlert';

  const hash = normalized.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return fallbackIconOptions[hash % fallbackIconOptions.length];
};

const normalizeAmenities = (rows: unknown[]): Amenity[] => {
  return (rows || []).map((item) => {
    const row = item as Record<string, unknown>;
    const name = String(row.name ?? '');
    const icon = row.icon && row.icon !== 'Wifi' ? String(row.icon) : inferAmenityIconName(name);
    return {
      id: row.id as string | number,
      name,
      icon,
      category: String(row.category ?? 'Tiện nghi phòng'),
    };
  });
};

interface AmenitiesCatalogTabProps {
  properties: Array<{ id: number | string; name: string }>;
}

const AmenitiesCatalogTab: React.FC<AmenitiesCatalogTabProps> = ({ properties }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [form, setForm] = useState<Partial<Amenity>>({ name: '', category: 'Tiện nghi phòng' });
  const [selectedIconName, setSelectedIconName] = useState('Wifi');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const { data: amenitiesRes, isLoading } = usePartnerAmenitiesCatalogQuery();
  const invalidateAmenitiesCatalog = useInvalidatePartnerAmenitiesCatalog();

  const amenities = useMemo(
    () => normalizeAmenities(extractApiRows(amenitiesRes)),
    [amenitiesRes],
  );

  const handleOpenModal = (amenity?: Amenity) => {
    if (amenity) {
      setEditingAmenity(amenity);
      setForm(amenity);
      setSelectedIconName(
        typeof amenity.icon === 'string' && amenity.icon !== 'Wifi'
          ? amenity.icon
          : inferAmenityIconName(amenity.name ?? ''),
      );
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
      await invalidateAmenitiesCatalog();
      setIsModalOpen(false);
      toastSuccess('Đã lưu tiện ích.');
    } catch {
      toastError('Lỗi khi lưu tiện ích.');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await partnerService.deleteAmenity(id);
      await invalidateAmenitiesCatalog();
      toastSuccess('Đã xóa tiện ích.');
    } catch {
      toastError('Lỗi khi xóa tiện ích.');
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedPropertyId || !editingAmenity) {
      toastError('Vui lòng chọn tòa nhà.');
      return;
    }

    try {
      setIsAssigning(true);
      const res = await partnerService.getRoomNamesByPropertyId(selectedPropertyId);
      const rooms = (res as { data?: Array<{ id: number | string }> })?.data || [];
      const roomIds = rooms.map((r) => r.id);

      if (roomIds.length === 0) {
        toastInfo('Tòa nhà này chưa có phòng nào.');
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      toastSuccess(`Đã gán tiện ích "${editingAmenity.name}" cho ${roomIds.length} phòng.`);
      setIsModalOpen(false);
    } catch {
      toastError('Lỗi khi gán tiện ích hàng loạt.');
    } finally {
      setIsAssigning(false);
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
            <span className="font-medium text-gray-700">{amenities.length}</span> tiện ích
          </p>
          <Button
            onClick={() => handleOpenModal()}
            size="sm"
            className="h-8 bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={14} className="mr-1" /> Thêm
          </Button>
        </div>

        {amenities.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            Chưa có tiện ích. Nhấn &quot;Thêm&quot; để tạo mới.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {amenities.map((item) => {
              const Icon = iconMap[String(item.icon)] || Wifi;
              return (
                <div
                  key={item.id}
                  className="group flex items-center gap-2.5 rounded-lg border border-gray-100 bg-slate-50/50 px-2.5 py-2 transition-colors hover:border-blue-200 hover:bg-white"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-blue-600 shadow-sm">
                    <Icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="truncate text-[10px] text-gray-400">{item.category || 'N/A'}</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <Button
                      onClick={() => handleOpenModal(item)}
                      variant="ghost"
                      size="icon"
                      className="size-6 text-gray-400 hover:text-amber-600"
                      aria-label={`Chỉnh sửa ${item.name}`}
                    >
                      <Edit size={12} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(item.id)}
                      variant="ghost"
                      size="icon"
                      className="size-6 text-gray-400 hover:text-red-600"
                      aria-label={`Xóa ${item.name}`}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <InlineSheet
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAmenity ? 'Cập nhật tiện ích' : 'Thêm tiện ích mới'}
        widthClassName="w-full md:max-w-lg"
        footer={
          <div className="flex w-full items-center justify-between">
            <div>
              {editingAmenity && (
                <Button
                  onClick={handleBulkAssign}
                  variant="outline"
                  disabled={!selectedPropertyId || isAssigning}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  size="sm"
                >
                  {isAssigning ? (
                    <Loader2 className="mr-2 animate-spin" size={14} />
                  ) : (
                    <Check size={14} className="mr-2" />
                  )}
                  Gán cho tất cả phòng
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
                Lưu thay đổi
              </Button>
            </div>
          </div>
        }
      >
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Tên tiện ích</Label>
            <Input
              value={form.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="VD: Tủ lạnh mini..."
            />
          </div>
          <div className="grid gap-2">
            <Label>Phân loại</Label>
            <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn phân loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tiện nghi phòng">
                  <div className="flex items-center gap-2">
                    <BedDouble size={14} className="text-blue-500" /> Tiện nghi phòng
                  </div>
                </SelectItem>
                <SelectItem value="Giải trí">
                  <div className="flex items-center gap-2">
                    <Tv size={14} className="text-purple-500" /> Giải trí
                  </div>
                </SelectItem>
                <SelectItem value="Kết nối">
                  <div className="flex items-center gap-2">
                    <Wifi size={14} className="text-emerald-500" /> Kết nối
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {editingAmenity && (
            <div className="grid gap-2 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <Label className="flex items-center gap-2 text-blue-700">
                <Building2 size={16} /> Liên kết tòa nhà
              </Label>
              <p className="mb-1 text-[10px] italic text-blue-600/70">
                Chọn tòa nhà để gán nhanh tiện ích này cho tất cả các phòng.
              </p>
              <PropertySelector
                selectedId={selectedPropertyId}
                onSelect={setSelectedPropertyId}
                allowAll={false}
                placeholder="Chọn tòa nhà để gán..."
                properties={properties}
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label>Biểu tượng</Label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((iconName) => {
                const Icon = iconMap[iconName] || Wifi;
                const active = selectedIconName === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setSelectedIconName(iconName)}
                    className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-3 text-xs transition-colors ${
                      active
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-slate-50'
                    }`}
                    aria-label={`Chọn biểu tượng ${iconName}`}
                  >
                    <Icon size={20} />
                    <span>{iconName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </InlineSheet>
    </>
  );
};

export default AmenitiesCatalogTab;
