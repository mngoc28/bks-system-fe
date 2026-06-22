export const DEFAULT_UTILITY_FEES = [
  { type: 'electricity', method: 'per_unit', price: 3500, included: false },
  { type: 'water', method: 'per_person', price: 100000, included: false },
  { type: 'service', method: 'fixed', price: 50000, included: false },
];

export const DEFAULT_BULK_CONFIG = {
  namingStyle: 'floor-index' as 'floor-index' | 'prefix-index',
  floorNumber: 1,
  prefix: 'P',
  startIndex: 1,
  count: 10,
  step: 1,
  padLength: 2,
};

export const createDefaultRoomFormData = (propertyId: string) => ({
  name: '',
  area: 25,
  floor_number: 1,
  people: 2,
  bedrooms_count: 1,
  beds_count: 1,
  room_type: 1,
  status: true,
  propertyId,
  amenities: [] as number[],
  services: [] as number[],
  prices: [{
    id: 'p' + Date.now(),
    packageName: 'Gói tháng',
    price: 0,
    duration: 1,
    unit: 'month',
    deposit_amount: 0,
    minimum_stay: 1,
  }],
  utility_fees: DEFAULT_UTILITY_FEES.map((fee) => ({ ...fee })),
});

const mapRelationIds = (items: unknown[]): number[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === 'number') return item;
      if (typeof item === 'object' && item !== null && 'id' in item) {
        return Number((item as { id: number }).id);
      }
      return null;
    })
    .filter((id): id is number => typeof id === 'number' && !Number.isNaN(id));
};

const mapPrices = (prices: unknown) => {
  if (!Array.isArray(prices) || prices.length === 0) {
    return createDefaultRoomFormData('').prices;
  }

  return prices.map((price: any, index: number) => ({
    id: price.id ?? `p-${index}`,
    packageName: price.packageName ?? price.package_name ?? price.unit ?? 'Gói tháng',
    price: Number(price.price ?? price.unit_price ?? 0),
    duration: Number(price.duration ?? price.minimum_stay ?? 1),
    unit: price.unit ?? 'month',
    deposit_amount: Number(price.deposit_amount ?? 0),
    minimum_stay: Number(price.minimum_stay ?? 1),
  }));
};

const resolveRoomStatus = (status: unknown): boolean => {
  if (typeof status === 'boolean') return status;
  if (typeof status === 'number') return status !== 0;
  if (typeof status === 'string') {
    return status !== 'Đang bảo trì' && status !== 'hidden';
  }
  return true;
};

export const mapRoomToFormData = (room: any, propertyId: string) => ({
  name: room?.name ?? room?.title ?? '',
  area: Number(room?.area ?? 25),
  floor_number: Number(room?.floor_number ?? 1),
  people: Number(room?.people ?? 2),
  bedrooms_count: Number(room?.bedrooms_count ?? 1),
  beds_count: Number(room?.beds_count ?? 1),
  room_type: Number(room?.room_type ?? 1),
  status: resolveRoomStatus(room?.status),
  propertyId: propertyId || String(room?.propertyId ?? room?.property_id ?? ''),
  amenities: mapRelationIds(room?.amenities ?? []),
  services: mapRelationIds(room?.services ?? []),
  prices: mapPrices(room?.prices),
  utility_fees: Array.isArray(room?.utility_fees) && room.utility_fees.length > 0
    ? room.utility_fees
    : DEFAULT_UTILITY_FEES.map((fee) => ({ ...fee })),
});

export const buildRoomSavePayload = (formData: any) => ({
  ...formData,
  status: formData.status ? 1 : 0,
  prices: (formData.prices || []).map((price: any) => ({
    packageName: price.packageName,
    unit: price.unit || 'month',
    unit_price: Math.max(0, Number(price.price || 0)),
    deposit_amount: Math.max(0, Number(price.deposit_amount || 0)),
    minimum_stay: Math.max(1, Number(price.minimum_stay || 1)),
  })),
  utility_fees: formData.utility_fees,
});

export const generateBulkRoomNames = (
  isBulkEntry: boolean,
  bulkConfig: typeof DEFAULT_BULK_CONFIG,
): string[] => {
  if (!isBulkEntry) return [];

  const names: string[] = [];
  const count = Math.max(0, Number(bulkConfig.count) || 0);
  const startIndex = Math.max(0, Number(bulkConfig.startIndex) || 0);
  const step = Math.max(1, Number(bulkConfig.step) || 1);
  const padLength = Math.max(1, Number(bulkConfig.padLength) || 1);
  const floorNumber = Math.max(0, Number(bulkConfig.floorNumber) || 0);
  const prefix = String(bulkConfig.prefix || '').trim();

  for (let i = 0; i < count; i++) {
    const index = startIndex + i * step;
    const indexText = String(index).padStart(padLength, '0');
    names.push(
      bulkConfig.namingStyle === 'floor-index'
        ? `${floorNumber}${indexText}`
        : `${prefix}${indexText}`,
    );
  }

  return names;
};
