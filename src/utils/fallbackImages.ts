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
  guesthouse: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80",
  nha_nghi: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=800&q=80",
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
  return "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80"; // Boutique hotel reception / warm lobby
}

/**
 * Returns a high-quality fallback image for News (media/newspaper/reading).
 */
export function getNewsFallbackImage(): string {
  return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"; // Media/newspaper
}

const PROVINCE_IMAGES: Record<string, string> = {
  // ── Tier 1: major cities ────────────────────────────────────────────────────
  ha_noi:     "https://images.unsplash.com/photo-1553851919-596510268b99?auto=format&fit=crop&w=800&q=80",  // Văn Miếu / Hanoi temple
  ho_chi_minh:"https://images.unsplash.com/photo-1602646993776-5dd8e166e6fd?auto=format&fit=crop&w=800&q=80", // HCMC aerial skyline
  da_nang:    "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80", // Cầu Vàng (Golden Bridge) Da Nang
  hai_phong:  "https://images.unsplash.com/photo-1726346234848-a6c0e78efd8c?auto=format&fit=crop&w=800&q=80", // Train street / Hanoi area (Hai Phong harbour)
  can_tho:    "https://images.unsplash.com/photo-1541079033018-63489731598f?auto=format&fit=crop&w=800&q=80", // HCMC/Mekong waterway night

  // ── Tier 2: popular destinations ────────────────────────────────────────────
  quang_ninh: "https://images.unsplash.com/photo-1561461221-959c3f16234b?auto=format&fit=crop&w=800&q=80", // Ha Long Bay limestone karsts
  khanh_hoa:  "https://images.unsplash.com/photo-1533002832-1721d16b4bb9?auto=format&fit=crop&w=800&q=80", // Nha Trang beach aerial
  lam_dong:   "https://images.unsplash.com/photo-1580824378537-e119885b93f7?auto=format&fit=crop&w=800&q=80", // Da Lat pine forest lake
  lao_cai:    "https://images.unsplash.com/photo-1609412058473-c199497c3c5d?auto=format&fit=crop&w=800&q=80", // Sa Pa terraced rice fields
  kien_giang: "https://images.unsplash.com/photo-1693282814784-649be45a459b?auto=format&fit=crop&w=800&q=80", // Phu Quoc beach & palm trees
  thua_thien_hue: "https://images.unsplash.com/photo-1567272131881-8ce2275deb67?auto=format&fit=crop&w=800&q=80", // Hue Imperial Citadel
  hue:        "https://images.unsplash.com/photo-1567272131881-8ce2275deb67?auto=format&fit=crop&w=800&q=80", // Hue Imperial Citadel
  quang_nam:  "https://images.unsplash.com/photo-1696215105567-40fea42ef40c?auto=format&fit=crop&w=800&q=80", // Hoi An lanterns
  ninh_binh:  "https://images.unsplash.com/photo-1556383166-eded0173b7fd?auto=format&fit=crop&w=800&q=80", // Trang An boat caves

  // ── Tier 3: other provinces ─────────────────────────────────────────────────
  quang_ngai: "https://images.unsplash.com/photo-1663602020492-ee3aea145f2b?auto=format&fit=crop&w=800&q=80", // Vietnam coastal boats
  cao_bang:   "https://images.unsplash.com/photo-1707292098544-755fa220732b?auto=format&fit=crop&w=800&q=80", // Northern Vietnam boats/waterfalls
  tuyen_quang:"https://images.unsplash.com/photo-1480996408299-fc0e830b5db1?auto=format&fit=crop&w=800&q=80", // Green mountains northern Vietnam
  dien_bien:  "https://images.unsplash.com/photo-1665905905591-fb66b0496481?auto=format&fit=crop&w=800&q=80", // Highland landscape
  lai_chau:   "https://images.unsplash.com/photo-1732098407342-6b6a05e3da3d?auto=format&fit=crop&w=800&q=80", // Lush green hillside
  son_la:     "https://images.unsplash.com/photo-1731946923169-e4658097de34?auto=format&fit=crop&w=800&q=80", // Mountain top Vietnam
  thai_nguyen:"https://images.unsplash.com/photo-1480996408299-fc0e830b5db1?auto=format&fit=crop&w=800&q=80", // Green mountain tea hills
  lang_son:   "https://images.unsplash.com/photo-1665905905591-fb66b0496481?auto=format&fit=crop&w=800&q=80", // Northern mountain border
  bac_ninh:   "https://images.unsplash.com/photo-1553851919-596510268b99?auto=format&fit=crop&w=800&q=80", // Temple / pagoda Vietnam
  phu_tho:    "https://images.unsplash.com/photo-1543355890-20bc0a26fda1?auto=format&fit=crop&w=800&q=80", // Vietnam street
  hung_yen:   "https://images.unsplash.com/photo-1604323990536-e5452c0507c1?auto=format&fit=crop&w=800&q=80", // Flowers basket bicycle Vietnam
  thanh_hoa:  "https://images.unsplash.com/photo-1570366290364-5e76a15ae408?auto=format&fit=crop&w=800&q=80", // Beach city Vietnam
  nghe_an:    "https://images.unsplash.com/photo-1533002832-1721d16b4bb9?auto=format&fit=crop&w=800&q=80", // Coastal Vietnam
  ha_tinh:    "https://images.unsplash.com/photo-1570366290364-5e76a15ae408?auto=format&fit=crop&w=800&q=80", // Beach Vietnam
  quang_tri:  "https://images.unsplash.com/photo-1664650440553-ab53804814b3?auto=format&fit=crop&w=800&q=80", // River boats Vietnam
  gia_lai:    "https://images.unsplash.com/photo-1609412058473-c199497c3c5d?auto=format&fit=crop&w=800&q=80", // Highland plateau
  dak_lak:    "https://images.unsplash.com/photo-1609412058473-c199497c3c5d?auto=format&fit=crop&w=800&q=80", // Central highland coffee
  dong_nai:   "https://images.unsplash.com/photo-1580824378537-e119885b93f7?auto=format&fit=crop&w=800&q=80", // Forest/national park
  tay_ninh:   "https://images.unsplash.com/photo-1586595276832-b6840c79bdfc?auto=format&fit=crop&w=800&q=80", // Wooden house greenery Vietnam
  dong_thap:  "https://images.unsplash.com/photo-1558334466-afce6bf36c69?auto=format&fit=crop&w=800&q=80", // Mekong delta waterway
  vinh_long:  "https://images.unsplash.com/photo-1558334466-afce6bf36c69?auto=format&fit=crop&w=800&q=80", // Mekong orchards
  an_giang:   "https://images.unsplash.com/photo-1558334466-afce6bf36c69?auto=format&fit=crop&w=800&q=80", // Mekong floating market
  ca_mau:     "https://images.unsplash.com/photo-1655776040426-80452be17ae7?auto=format&fit=crop&w=800&q=80", // Coastal southern Vietnam boats
  binh_thuan: "https://images.unsplash.com/photo-1698809807960-758cf416e96e?auto=format&fit=crop&w=800&q=80", // Mui Ne / beach sunset
  ba_ria_vung_tau: "https://images.unsplash.com/photo-1701936131291-ac5972a37766?auto=format&fit=crop&w=800&q=80", // Vung Tau coastal aerial
};

/**
 * Returns a beautiful, matching Unsplash image URL for Vietnamese provinces/cities.
 * Strips administrative prefixes ("Thành phố", "Tỉnh", "TP.") before matching,
 * so inputs like "Thành phố Hồ Chí Minh", "TP. Hồ Chí Minh", or "Hồ Chí Minh"
 * all map to the same image.
 */
export function getProvinceImage(provinceName: string | undefined): string {
  const FALLBACK = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80";

  if (!provinceName) return FALLBACK;

  // Strip Vietnamese administrative prefixes the DB may store
  const stripped = provinceName
    .trim()
    .replace(/^(th[aà]nh\s*ph[oô]|t[iỉ]nh|tp\.?\s*)/i, "")
    .trim();

  // Normalize: remove diacritics, lowercase, replace spaces/dashes with underscores
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[\s\-_.]+/g, "_");

  const key = normalize(stripped);

  // Exact key match
  if (PROVINCE_IMAGES[key]) return PROVINCE_IMAGES[key];

  // Fuzzy match — handles partial or reordered words
  for (const [pKey, url] of Object.entries(PROVINCE_IMAGES)) {
    if (key.includes(pKey) || pKey.includes(key)) return url;
  }

  return FALLBACK;
}


