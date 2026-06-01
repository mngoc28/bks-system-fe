/**
 * Utility to map room and property type names to high-quality, professional Unsplash photos.
 * Replaces the cartoonish red-roofed house placeholder to build user trust.
 */

const PROPERTY_TYPE_IMAGES: Record<string, string> = {
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  khach_san: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
  homestay: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
  apartment: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  can_ho: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
  villa: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
  biet_thu: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
};

const ROOM_TYPE_IMAGES: Record<string, string> = {
  vip: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
  suite: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
  family: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
  single: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80",
  double: "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80",
};

const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80";

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s\-_]+/g, "_");
}

/**
 * Returns a beautiful, matching Unsplash fallback image URL based on type names.
 */
export function getRoomFallbackImage(propertyTypeName?: string, roomTypeName?: string): string {
  if (roomTypeName) {
    const normalizedRoom = normalizeString(roomTypeName);
    for (const key of Object.keys(ROOM_TYPE_IMAGES)) {
      if (normalizedRoom.includes(key)) {
        return ROOM_TYPE_IMAGES[key];
      }
    }
  }

  if (propertyTypeName) {
    const normalizedProperty = normalizeString(propertyTypeName);
    for (const key of Object.keys(PROPERTY_TYPE_IMAGES)) {
      if (normalizedProperty.includes(key)) {
        return PROPERTY_TYPE_IMAGES[key];
      }
    }
  }

  return DEFAULT_FALLBACK_IMAGE;
}

/**
 * Returns a high-quality fallback image for a Partner (business/office building).
 */
export function getPartnerFallbackImage(): string {
  return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"; // Office building/headquarters
}

/**
 * Returns a high-quality fallback image for News (media/newspaper/reading).
 */
export function getNewsFallbackImage(): string {
  return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"; // Media/newspaper
}
