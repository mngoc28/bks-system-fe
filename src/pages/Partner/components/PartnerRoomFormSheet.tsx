import React, { useEffect, useMemo, useState } from 'react';
import { Activity, CheckSquare, Wallet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { partnerService } from '@/services/partnerService';
import { formatCurrencyInput, parseCurrencyValue, validateCurrencyInput } from '@/utils/utils';
import { toastError, toastSuccess } from '@/components/ui/toast';
import { Room } from '../types';
import InlineSheet from './InlineSheet';
import { PartnerConfirmDialog } from './PartnerConfirmDialog';
import {
  buildRoomSavePayload,
  createDefaultRoomFormData,
  DEFAULT_BULK_CONFIG,
  generateBulkRoomNames,
  mapRoomToFormData,
} from '../utils/partnerRoomForm';

type PartnerRoomFormSheetProps = {
  open: boolean;
  onClose: () => void;
  propertyId: string;
  room?: Room | null;
  onSaved?: () => void;
};

const PartnerRoomFormSheet: React.FC<PartnerRoomFormSheetProps> = ({
  open,
  onClose,
  propertyId,
  room = null,
  onSaved,
}) => {
  const [formData, setFormData] = useState<any>(() => createDefaultRoomFormData(propertyId));
  const [isBulkEntry, setIsBulkEntry] = useState(false);
  const [bulkConfig, setBulkConfig] = useState(DEFAULT_BULK_CONFIG);
  const [availableAmenities, setAvailableAmenities] = useState<any[]>([]);
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingRoom, setIsLoadingRoom] = useState(false);
  const [applyToAllRooms, setApplyToAllRooms] = useState(false);
  const [confirmApplyAllOpen, setConfirmApplyAllOpen] = useState(false);

  const availableAmenityIds = useMemo(() => availableAmenities.map((item) => item.id), [availableAmenities]);
  const availableServiceIds = useMemo(() => availableServices.map((item) => item.id), [availableServices]);
  const allAmenitiesSelected = availableAmenityIds.length > 0
    && availableAmenityIds.every((id) => formData.amenities.includes(id));
  const allServicesSelected = availableServiceIds.length > 0
    && availableServiceIds.every((id) => formData.services.includes(id));

  const bulkRoomNames = useMemo(
    () => generateBulkRoomNames(isBulkEntry, bulkConfig),
    [isBulkEntry, bulkConfig],
  );

  const duplicateBulkRoomNames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const name of bulkRoomNames) {
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([name]) => name);
  }, [bulkRoomNames]);

  const updatePricePackage = (index: number, changes: Record<string, unknown>) => {
    setFormData((prev: any) => {
      const prices = [...(prev.prices || [])];
      prices[index] = { ...prices[index], ...changes };
      return { ...prev, prices };
    });
  };

  const handleCurrencyPackageChange = (
    index: number,
    field: 'price' | 'deposit_amount',
    value: string,
  ) => {
    const cleaned = validateCurrencyInput(value);
    if (cleaned === null) return;
    updatePricePackage(index, { [field]: parseCurrencyValue(cleaned) });
  };

  const toggleAllAmenities = (checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, amenities: checked ? availableAmenityIds : [] }));
  };

  const toggleAllServices = (checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, services: checked ? availableServiceIds : [] }));
  };

  const ensureOptionsLoaded = async () => {
    if (optionsLoaded) return;
    try {
      const [ams, svs]: any = await Promise.all([
        partnerService.getAllAmenities(),
        partnerService.getAllServices(),
      ]);
      setAvailableAmenities(ams?.data || []);
      setAvailableServices(svs?.data || []);
      setOptionsLoaded(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!open) {
      setApplyToAllRooms(false);
      setConfirmApplyAllOpen(false);
      return;
    }

    void ensureOptionsLoaded();

    const loadForm = async () => {
      setIsBulkEntry(false);
      setBulkConfig({ ...DEFAULT_BULK_CONFIG });

      if (!room?.id) {
        setFormData(createDefaultRoomFormData(propertyId));
        return;
      }

      setIsLoadingRoom(true);
      try {
        const res: any = await partnerService.getRoomDetail(String(room.id));
        const detail = res?.data?.data ?? res?.data ?? room;
        setFormData(mapRoomToFormData(detail, propertyId));
      } catch {
        setFormData(mapRoomToFormData(room, propertyId));
      } finally {
        setIsLoadingRoom(false);
      }
    };

    void loadForm();
  }, [open, room?.id, propertyId]);

  const getPropertyRoomCount = async (): Promise<number> => {
    try {
      const res: any = await partnerService.getRooms({ property_id: propertyId, per_page: 1 });
      const paginator = res?.data?.data && typeof res.data.data === 'object' && !Array.isArray(res.data.data)
        ? res.data.data
        : res?.data ?? res;
      return Number(paginator?.total ?? paginator?.data?.length ?? 0);
    } catch {
      return 0;
    }
  };

  const performSaveRoom = async () => {
    const payload = buildRoomSavePayload({ ...formData, propertyId });

    if (isBulkEntry) {
      if (bulkRoomNames.length === 0) {
        toastError('Vui lòng nhập danh sách tên phòng.');
        return;
      }
      if (new Set(bulkRoomNames).size !== bulkRoomNames.length) {
        toastError('Danh sách phòng có mã bị trùng, vui lòng kiểm tra lại.');
        return;
      }

      await partnerService.bulkCreateRoom({
        property_id: propertyId,
        rooms: bulkRoomNames.map((name) => ({ name, area: formData.area })),
        area: formData.area,
        floor_number: formData.floor_number,
        people: formData.people,
        bedrooms_count: formData.bedrooms_count,
        beds_count: formData.beds_count,
        room_type: formData.room_type,
        status: payload.status,
        amenities: formData.amenities,
        services: formData.services,
        prices: payload.prices,
        utility_fees: payload.utility_fees,
      });
      toastSuccess(`Đã tạo ${bulkRoomNames.length} phòng thành công.`);
    } else if (room?.id) {
      await partnerService.updateRoom(String(room.id), {
        ...payload,
        apply_to_all_rooms: applyToAllRooms,
      });
      toastSuccess(applyToAllRooms
        ? 'Đã cập nhật phòng và đồng bộ tiện ích/dịch vụ cho các phòng cùng tòa nhà.'
        : 'Đã cập nhật phòng.');
    } else {
      await partnerService.createRoom(payload);
      toastSuccess('Đã thêm phòng mới.');
    }

    onClose();
    onSaved?.();
  };

  const handleSaveRoom = async () => {
    try {
      setIsSaving(true);

      if (room?.id && !isBulkEntry && applyToAllRooms) {
        const roomCount = await getPropertyRoomCount();
        if (roomCount > 5) {
          setConfirmApplyAllOpen(true);
          return;
        }
      }

      await performSaveRoom();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastError(typeof msg === 'string' ? msg : 'Lỗi khi lưu dữ liệu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmApplyAllSave = async () => {
    try {
      setIsSaving(true);
      setConfirmApplyAllOpen(false);
      await performSaveRoom();
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toastError(typeof msg === 'string' ? msg : 'Lỗi khi lưu dữ liệu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
    <InlineSheet
      open={open}
      onClose={onClose}
      title={room?.id ? 'Cập nhật phòng' : 'Thêm phòng mới'}
      footer={(
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Hủy</Button>
          <Button onClick={handleSaveRoom} className="bg-blue-600 hover:bg-blue-700" disabled={isSaving || isLoadingRoom}>
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      )}
    >
      {isLoadingRoom ? (
        <div className="py-12 text-center text-sm text-slate-500">Đang tải thông tin phòng...</div>
      ) : (
        <div className="space-y-6">
          {!room?.id && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <label htmlFor="bulk-mode" className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  id="bulk-mode"
                  checked={isBulkEntry}
                  onChange={(e) => setIsBulkEntry(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-blue-600"
                />
                <span className="text-sm font-semibold text-slate-700">Chế độ tạo hàng loạt</span>
              </label>
            </div>
          )}

          <div className="flex gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <CheckSquare size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-blue-900">
                {isBulkEntry ? 'Tạo danh sách phòng nhanh' : 'Thông tin chi tiết phòng'}
              </p>
              <p className="text-xs text-blue-600/70">
                {isBulkEntry
                  ? 'Nhập tên các phòng cách nhau bởi dấu phẩy hoặc xuống dòng.'
                  : 'Cung cấp đầy đủ thông số để thu hút cư dân tiềm năng.'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {isBulkEntry ? (
              <div className="grid gap-3">
                <div className="space-y-1 rounded-xl border border-blue-200 bg-blue-50/50 p-3 text-xs text-blue-800">
                  <p className="font-semibold">Hướng dẫn tạo hàng loạt</p>
                  <p>- Dùng cấu hình số và kiểu mã để hệ thống tự sinh danh sách phòng.</p>
                  <p>- Toàn bộ thông số bên dưới (diện tích, tầng, sức chứa, tiện nghi, dịch vụ, giá) sẽ áp dụng cho tất cả phòng.</p>
                  <p>- Bạn xem trước danh sách sinh tự động trước khi bấm lưu.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label className="font-semibold">Kiểu mã phòng</Label>
                    <Select
                      value={bulkConfig.namingStyle}
                      onValueChange={(value) => setBulkConfig((prev) => ({
                        ...prev,
                        namingStyle: value as 'floor-index' | 'prefix-index',
                      }))}
                    >
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="floor-index">Tầng + số thứ tự (VD: 201, 202)</SelectItem>
                        <SelectItem value="prefix-index">Tiền tố + số thứ tự (VD: P01, P02)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {bulkConfig.namingStyle === 'floor-index' ? (
                    <div className="grid gap-2">
                      <Label className="font-semibold">Tầng dùng để sinh mã</Label>
                      <Input
                        type="number"
                        value={bulkConfig.floorNumber}
                        onChange={(e) => setBulkConfig((prev) => ({ ...prev, floorNumber: Number(e.target.value) || 0 }))}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      <Label className="font-semibold">Tiền tố mã phòng</Label>
                      <Input
                        value={bulkConfig.prefix}
                        onChange={(e) => setBulkConfig((prev) => ({ ...prev, prefix: e.target.value }))}
                        placeholder="VD: P, A, VIP-"
                        className="h-11 rounded-xl"
                      />
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label className="font-semibold">Số bắt đầu</Label>
                    <Input
                      type="number"
                      value={bulkConfig.startIndex}
                      onChange={(e) => setBulkConfig((prev) => ({ ...prev, startIndex: Number(e.target.value) || 0 }))}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="font-semibold">Số lượng phòng</Label>
                    <Input
                      type="number"
                      min={1}
                      value={bulkConfig.count}
                      onChange={(e) => setBulkConfig((prev) => ({ ...prev, count: Number(e.target.value) || 0 }))}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="font-semibold">Bước nhảy</Label>
                    <Input
                      type="number"
                      min={1}
                      value={bulkConfig.step}
                      onChange={(e) => setBulkConfig((prev) => ({ ...prev, step: Number(e.target.value) || 1 }))}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="font-semibold">Độ dài số (padding)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={bulkConfig.padLength}
                      onChange={(e) => setBulkConfig((prev) => ({ ...prev, padLength: Number(e.target.value) || 1 }))}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Xem trước phòng sẽ tạo</p>
                    <span className="text-xs font-semibold text-blue-700">{bulkRoomNames.length} phòng</span>
                  </div>

                  {duplicateBulkRoomNames.length > 0 && (
                    <div className="text-xs font-semibold text-rose-600">
                      Trùng tên phòng: {duplicateBulkRoomNames.join(', ')}
                    </div>
                  )}

                  {bulkRoomNames.length > 0 ? (
                    <div className="flex max-h-28 flex-wrap gap-2 overflow-auto pr-1">
                      {bulkRoomNames.map((name, index) => (
                        <span
                          key={`${name}-${index}`}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-slate-400">Chưa có dữ liệu xem trước.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label className="font-semibold">Số phòng / Tên phòng</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: P.101"
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="font-semibold">Tầng</Label>
                  <Input
                    type="number"
                    value={formData.floor_number}
                    onChange={(e) => setFormData({ ...formData, floor_number: Number(e.target.value) })}
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label className="font-semibold">Diện tích (m²)</Label>
                <Input
                  type="number"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Sức chứa (người)</Label>
                <Input
                  type="number"
                  value={formData.people}
                  onChange={(e) => setFormData({ ...formData, people: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label className="font-semibold">Số phòng ngủ</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.bedrooms_count || 1}
                  onChange={(e) => setFormData({ ...formData, bedrooms_count: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Số giường</Label>
                <Input
                  type="number"
                  min={1}
                  value={formData.beds_count || 1}
                  onChange={(e) => setFormData({ ...formData, beds_count: Number(e.target.value) })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="font-semibold">Tiện nghi (Amenities)</Label>
              <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-semibold text-blue-600">
                <input
                  type="checkbox"
                  checked={allAmenitiesSelected}
                  disabled={availableAmenityIds.length === 0}
                  onChange={(e) => toggleAllAmenities(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span>{allAmenitiesSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
                {availableAmenities.map((am) => (
                  <label key={am.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent p-2 transition-colors hover:border-slate-200 hover:bg-white">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(am.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? Array.from(new Set([...formData.amenities, am.id]))
                          : formData.amenities.filter((id: number) => id !== am.id);
                        setFormData({ ...formData, amenities: next });
                      }}
                      className="size-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-xs font-medium text-slate-700">{am.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="font-semibold">Dịch vụ (Services)</Label>
              <label className="flex w-fit cursor-pointer items-center gap-2 text-xs font-semibold text-blue-600">
                <input
                  type="checkbox"
                  checked={allServicesSelected}
                  disabled={availableServiceIds.length === 0}
                  onChange={(e) => toggleAllServices(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span>{allServicesSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
                {availableServices.map((sv) => (
                  <label key={sv.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-transparent p-2 transition-colors hover:border-slate-200 hover:bg-white">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(sv.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? Array.from(new Set([...formData.services, sv.id]))
                          : formData.services.filter((id: number) => id !== sv.id);
                        setFormData({ ...formData, services: next });
                      }}
                      className="size-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-xs font-medium text-slate-700">{sv.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {room?.id && !isBulkEntry && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 px-4 py-3">
                <label htmlFor="apply-to-all-rooms" className="flex cursor-pointer items-start gap-2">
                  <input
                    type="checkbox"
                    id="apply-to-all-rooms"
                    checked={applyToAllRooms}
                    onChange={(e) => setApplyToAllRooms(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-sm font-semibold text-slate-700">
                    Áp dụng tiện ích & dịch vụ cho tất cả phòng cùng tòa nhà
                  </span>
                </label>
                <p className="mt-1 pl-6 text-xs text-slate-500">
                  Chỉ đồng bộ amenities và services; giá và phụ phí không thay đổi ở phòng khác.
                </p>
              </div>
            )}

            <div className="grid gap-2 border-t pt-4">
              <Label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Activity size={14} className="text-amber-500" /> Phụ phí điện, nước & dịch vụ
              </Label>
              <div className="grid gap-3">
                {formData.utility_fees?.map((fee: any, idx: number) => (
                  <div key={idx} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold capitalize text-slate-700">
                        {fee.type === 'electricity' ? 'Điện' : fee.type === 'water' ? 'Nước' : 'Dịch vụ'}
                      </span>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={fee.included}
                          onChange={(e) => {
                            const nextFees = [...formData.utility_fees];
                            nextFees[idx].included = e.target.checked;
                            setFormData({ ...formData, utility_fees: nextFees });
                          }}
                          className="size-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="text-xs font-medium text-slate-600">Đã bao gồm trong giá phòng</span>
                      </label>
                    </div>

                    {!fee.included && (
                      <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-1 md:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Cách tính</Label>
                          <Select
                            value={fee.method}
                            onValueChange={(value) => {
                              const nextFees = [...formData.utility_fees];
                              nextFees[idx].method = value;
                              setFormData({ ...formData, utility_fees: nextFees });
                            }}
                          >
                            <SelectTrigger className="h-9 rounded-lg text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="per_unit">Theo số (kWh/m3)</SelectItem>
                              <SelectItem value="per_person">Theo người</SelectItem>
                              <SelectItem value="fixed">Cố định tháng</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-bold uppercase text-slate-400">Đơn giá (VNĐ)</Label>
                          <Input
                            type="number"
                            value={fee.price}
                            onChange={(e) => {
                              const nextFees = [...formData.utility_fees];
                              nextFees[idx].price = Number(e.target.value);
                              setFormData({ ...formData, utility_fees: nextFees });
                            }}
                            className="h-9 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2 border-t pt-4">
              <div className="mb-2 flex items-center justify-between">
                <Label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Wallet size={14} className="text-blue-500" /> Bảng giá thuê phòng
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFormData({
                    ...formData,
                    prices: [...formData.prices, {
                      id: 'p' + Date.now(),
                      packageName: 'Gói mới',
                      price: 0,
                      duration: 1,
                      unit: 'month',
                      deposit_amount: 0,
                      minimum_stay: 1,
                    }],
                  })}
                  className="text-[11px] font-semibold text-blue-600 hover:bg-blue-50"
                >
                  + Thêm gói
                </Button>
              </div>
              <div className="space-y-4">
                {formData.prices.map((price: any, idx: number) => (
                  <div key={price.id ?? idx} className="relative space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        prices: formData.prices.filter((_: any, index: number) => index !== idx),
                      })}
                      className="absolute right-2 top-2 size-7 p-0 text-slate-400 hover:text-rose-500"
                    >
                      <X size={14} />
                    </Button>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Tên gói / Loại hình</Label>
                        <Input
                          value={price.packageName}
                          onChange={(e) => {
                            const nextPrices = [...formData.prices];
                            nextPrices[idx].packageName = e.target.value;
                            setFormData({ ...formData, prices: nextPrices });
                          }}
                          placeholder="VD: Thuê tháng"
                          className="h-10 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Đơn vị tính</Label>
                        <Select
                          value={price.unit}
                          onValueChange={(value) => {
                            const nextPrices = [...formData.prices];
                            nextPrices[idx].unit = value;
                            setFormData({ ...formData, prices: nextPrices });
                          }}
                        >
                          <SelectTrigger className="h-10 rounded-xl text-sm font-semibold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="night">Theo đêm</SelectItem>
                            <SelectItem value="month">Theo tháng</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Giá thuê (VNĐ)</Label>
                        <Input
                          inputMode="numeric"
                          value={price.price ? formatCurrencyInput(price.price) : ''}
                          onChange={(e) => handleCurrencyPackageChange(idx, 'price', e.target.value)}
                          className="h-10 rounded-xl text-sm font-bold text-blue-600"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">Tiền cọc (VNĐ)</Label>
                        <Input
                          inputMode="numeric"
                          value={price.deposit_amount ? formatCurrencyInput(price.deposit_amount) : ''}
                          onChange={(e) => handleCurrencyPackageChange(idx, 'deposit_amount', e.target.value)}
                          placeholder="VD: 5.000.000"
                          className="h-10 rounded-xl text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase text-slate-400">
                          Tối thiểu ({price.unit === 'month' ? 'tháng' : 'đêm'})
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          value={price.minimum_stay || 1}
                          onChange={(e) => updatePricePackage(idx, { minimum_stay: Math.max(1, Number(e.target.value) || 1) })}
                          className="h-10 rounded-xl text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </InlineSheet>

    <PartnerConfirmDialog
      open={confirmApplyAllOpen}
      onOpenChange={setConfirmApplyAllOpen}
      title="Áp dụng cho tất cả phòng?"
      description="Tòa nhà có hơn 5 phòng. Tiện ích và dịch vụ sẽ được ghi đè lên mọi phòng khác trong cùng cơ sở."
      confirmLabel="Đồng ý và lưu"
      onConfirm={handleConfirmApplyAllSave}
      isLoading={isSaving}
    />
    </>
  );
};

export default PartnerRoomFormSheet;
