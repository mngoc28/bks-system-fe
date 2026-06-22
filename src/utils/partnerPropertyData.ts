import { Property, Room } from '@/pages/Partner/types';

export const normalizePartnerRoomStatus = (status: unknown, occupancyStatus?: unknown): Room['status'] => {
  const occupancy = String(occupancyStatus || '').toLowerCase();
  if (occupancy === 'vacant') return 'Trống';
  if (occupancy === 'occupied') return 'Đang thuê';
  if (occupancy === 'maintenance') return 'Đang bảo trì';

  if (typeof status === 'string') {
    if (status === 'Trống' || status === 'Đang thuê' || status === 'Đang bảo trì') {
      return status;
    }
    return 'Đang thuê';
  }
  if (typeof status === 'boolean') {
    return status ? 'Trống' : 'Đang bảo trì';
  }
  if (typeof status === 'number') {
    return status === 1 ? 'Trống' : 'Đang bảo trì';
  }
  return 'Đang thuê';
};

export const normalizePartnerRooms = (rawRooms: any[], propertyName = ''): Room[] => {
  return (rawRooms || []).map((room: any) => ({
    id: room.id,
    propertyId: room.property_id ?? (room as any).propertyId ?? '',
    propertyName: propertyName || (room.property_name ?? (room as any).propertyName ?? ''),
    name: room.title ?? room.name ?? '',
    area: Number(room.area ?? 0),
    amenities: Array.isArray(room.amenities)
      ? room.amenities.map((a: any) => (typeof a === 'string' ? a : a?.name)).filter(Boolean)
      : [],
    services: Array.isArray(room.services)
      ? room.services.map((s: any) => (typeof s === 'string' ? s : s?.name)).filter(Boolean)
      : [],
    prices: Array.isArray(room.prices)
      ? room.prices.map((p: any) => ({
          id: p.id,
          packageName: p.package_name ?? p.packageName ?? p.unit ?? `Goi ${p.price_package_id ?? ''}`,
          price: Number(p.price ?? 0),
          duration: p.unit === 'month' ? 2 : 1,
        }))
      : [],
    status: normalizePartnerRoomStatus(room.status, room.occupancy_status),
    reviews_count: room.reviews_count,
    reviews_avg_rating: room.reviews_avg_rating,
  }));
};

export const normalizePartnerProperties = (rawProperties: any[]): Property[] => {
  return (rawProperties || []).map((property: any) => ({
    id: property.id,
    name: property.name ?? '',
    address: property.address_detail ?? property.address ?? '',
    totalRooms: Number(property.rooms_count ?? 0),
    property_type_id: property.property_type_id,
    rent_category: property.rent_category,
    province_id: property.province_id,
    ward_id: property.ward_id,
    description: property.description,
    property_type_name: property.property_type_name,
    type: property.type,
    rooms_count: property.rooms_count,
    reviews_count: property.reviews_count,
    reviews_avg_rating: property.reviews_avg_rating,
    coverImageUrl: property.cover_image_url ?? null,
    province_name: property.province_name ?? undefined,
    ward_name: property.ward_name ?? undefined,
    vacant_rooms_count: property.vacant_rooms_count != null ? Number(property.vacant_rooms_count) : undefined,
    vacancy_rate: property.vacancy_rate != null ? Number(property.vacancy_rate) : undefined,
  }));
};

export interface PartnerPropertiesListResult {
  items: Property[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export const parsePartnerPropertiesListResponse = (res: any): PartnerPropertiesListResult => {
  const propertyData = res?.data || {};
  const rawProperties = Array.isArray(propertyData) ? propertyData : (propertyData.data || []);

  return {
    items: normalizePartnerProperties(rawProperties),
    currentPage: (propertyData as { current_page?: number }).current_page || 1,
    lastPage: (propertyData as { last_page?: number }).last_page || 1,
    perPage: (propertyData as { per_page?: number }).per_page || rawProperties.length || 5,
    total: (propertyData as { total?: number }).total || rawProperties.length || 0,
  };
};

export interface PartnerPropertyRoomPreviewResult {
  propertyId: string;
  totalRooms: number;
  previewLimit: number;
  rooms: Room[];
}

export const parsePartnerPropertyRoomPreviewResponse = (
  res: any,
  propertyName: string,
): PartnerPropertyRoomPreviewResult => {
  const payload = res?.data ?? {};
  const rawRooms = Array.isArray(payload.rooms) ? payload.rooms : [];

  return {
    propertyId: String(payload.property_id ?? ''),
    totalRooms: Number(payload.total_rooms ?? 0),
    previewLimit: Number(payload.preview_limit ?? rawRooms.length),
    rooms: normalizePartnerRooms(rawRooms, propertyName),
  };
};

export type PartnerUnitDisplayStatus = 'Trống' | 'Đang thuê' | 'Bảo trì' | 'Ẩn';

export const getPartnerUnitDisplayStatus = (room: {
  status?: unknown;
  occupancy_status?: unknown;
}): PartnerUnitDisplayStatus => {
  const visibility = room.status;
  if (
    visibility === 0
    || visibility === false
    || visibility === '0'
    || String(room.occupancy_status || '').toLowerCase() === 'hidden'
  ) {
    return 'Ẩn';
  }

  const occupancy = String(room.occupancy_status || '').toLowerCase();
  if (occupancy === 'occupied') return 'Đang thuê';
  if (occupancy === 'maintenance') return 'Bảo trì';
  if (occupancy === 'vacant') return 'Trống';

  return 'Trống';
};

export const UNIT_STATUS_BADGE_CLASS: Record<PartnerUnitDisplayStatus, string> = {
  Trống: 'bg-[#ECFDF5] text-[#047857]',
  'Đang thuê': 'bg-[#EFF6FF] text-[#00668A]',
  'Bảo trì': 'bg-[#FFFBEB] text-[#B45309]',
  Ẩn: 'bg-[#F1F5F9] text-[#64748B]',
};

export const getPartnerRoomTypeLabel = (roomType: unknown): string | null => {
  const type = Number(roomType);
  if (!type) return null;
  if (type === 1) return 'Phòng đơn';
  if (type === 2) return 'Phòng đôi';
  if (type === 3) return 'Căn hộ';
  return null;
};

export interface PartnerRoomsListResult {
  rooms: any[];
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export const parsePartnerRoomsListResponse = (res: any): PartnerRoomsListResult => {
  const roomData = res?.data || {};
  const rawRooms = roomData.data || (Array.isArray(roomData) ? roomData : []);

  return {
    rooms: rawRooms,
    currentPage: Number(roomData.current_page ?? 1),
    lastPage: Number(roomData.last_page ?? 1),
    perPage: Number(roomData.per_page ?? rawRooms.length ?? 10),
    total: Number(roomData.total ?? rawRooms.length ?? 0),
  };
};

export const getPartnerRoomMinPrice = (
  room: any,
): { amount: number; unit: string } | null => {
  if (room?.cheapest_daily_price != null && Number(room.cheapest_daily_price) > 0) {
    return { amount: Number(room.cheapest_daily_price), unit: '/đêm' };
  }

  if (Array.isArray(room?.prices) && room.prices.length > 0) {
    const sorted = [...room.prices].sort(
      (a, b) => Number(a.price ?? 0) - Number(b.price ?? 0),
    );
    const cheapest = sorted[0];
    if (!cheapest) return null;
    return {
      amount: Number(cheapest.price ?? 0),
      unit: cheapest.unit === 'month' ? '/tháng' : '/đêm',
    };
  }

  return null;
};

export const parsePartnerPropertyNamesResponse = (res: any): Array<{ id: number | string; name: string }> => {
  const payload = res?.data?.data ?? res?.data ?? res ?? [];
  const list = Array.isArray(payload) ? payload : payload?.data || [];

  return list.map((item: any) => ({
    id: item.id,
    name: item.name || item.title || '',
  }));
};
