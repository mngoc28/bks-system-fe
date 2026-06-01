import { Property, Room } from '@/pages/Partner/types';

export const normalizePartnerRoomStatus = (status: unknown): Room['status'] => {
  if (typeof status === 'string') {
    if (status === 'Trống' || status === 'Đang thuê' || status === 'Đang bảo trì') {
      return status;
    }
    return 'Đang thuê';
  }
  if (typeof status === 'boolean') {
    return status ? 'Trống' : 'Đang bảo trì';
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
    status: normalizePartnerRoomStatus(room.status),
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

export const parsePartnerPropertyNamesResponse = (res: any): Array<{ id: number | string; name: string }> => {
  const payload = res?.data?.data ?? res?.data ?? res ?? [];
  const list = Array.isArray(payload) ? payload : payload?.data || [];

  return list.map((item: any) => ({
    id: item.id,
    name: item.name || item.title || '',
  }));
};
