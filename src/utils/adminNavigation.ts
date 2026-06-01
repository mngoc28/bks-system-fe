export type AdminNavigationSource =
  | "partner-management"
  | "partner-detail"
  | "property-management"
  | "property-detail"
  | "room-management"
  | "room-detail"
  | "booking-manage"
  | "partner-approval"
  | "dashboard";

export interface AdminNavigationContext {
  source?: string;
  partner_id?: string;
  partner_name?: string;
  property_id?: string;
  property_name?: string;
  room_id?: string;
  room_name?: string;
  user_id?: string;
  user_name?: string;
  booking_id?: string;
  from_approval?: string;
}

const CONTEXT_KEYS: Array<keyof AdminNavigationContext> = [
  "source",
  "partner_id",
  "partner_name",
  "property_id",
  "property_name",
  "room_id",
  "room_name",
  "user_id",
  "user_name",
  "booking_id",
  "from_approval",
];

const withStringValue = (value: number | string | undefined): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : undefined;
};

export const buildAdminUrl = (pathname: string, context?: AdminNavigationContext): string => {
  if (!context) {
    return pathname;
  }

  const search = new URLSearchParams();

  CONTEXT_KEYS.forEach((key) => {
    const value = context[key];
    if (value) {
      search.set(key, value);
    }
  });

  const searchString = search.toString();
  return searchString ? `${pathname}?${searchString}` : pathname;
};

export const parseAdminContext = (search: string): AdminNavigationContext => {
  const params = new URLSearchParams(search);
  const context: AdminNavigationContext = {};

  CONTEXT_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) {
      context[key] = value;
    }
  });

  return context;
};

export const clearAdminContext = (search: string): string => {
  const params = new URLSearchParams(search);
  CONTEXT_KEYS.forEach((key) => params.delete(key));
  return params.toString();
};

export const toPropertiesByPartner = (partnerId: number | string, source: AdminNavigationSource, partnerName?: string): AdminNavigationContext => ({
  partner_id: withStringValue(partnerId),
  partner_name: withStringValue(partnerName),
  source,
});

export const toRoomsByPartner = (partnerId: number | string, source: AdminNavigationSource, partnerName?: string): AdminNavigationContext => ({
  partner_id: withStringValue(partnerId),
  partner_name: withStringValue(partnerName),
  source,
});

export const toBookingsByPartner = (partnerId: number | string, source: AdminNavigationSource, partnerName?: string): AdminNavigationContext => ({
  partner_id: withStringValue(partnerId),
  partner_name: withStringValue(partnerName),
  source,
});

export const toRoomsByProperty = (
  propertyId: number | string,
  source: AdminNavigationSource,
  propertyName?: string,
): AdminNavigationContext => ({
  property_id: withStringValue(propertyId),
  property_name: withStringValue(propertyName),
  source,
});

export const toBookingsByProperty = (
  propertyId: number | string,
  source: AdminNavigationSource,
  propertyName?: string,
): AdminNavigationContext => ({
  property_id: withStringValue(propertyId),
  property_name: withStringValue(propertyName),
  source,
});

export const toBookingsByRoom = (roomId: number | string, source: AdminNavigationSource, roomName?: string): AdminNavigationContext => ({
  room_id: withStringValue(roomId),
  room_name: withStringValue(roomName),
  source,
});

