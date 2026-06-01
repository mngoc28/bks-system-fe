const APARTMENT_SEGMENT_LABEL = "Căn hộ dịch vụ";

const normalizeLabel = (value?: string | null): string => {
  return value?.toLowerCase().trim() ?? "";
};

export const normalizeStayPropertyTypeLabel = (value?: string | null): string => {
  if (!value) {
    return "";
  }

  const normalized = normalizeLabel(value);

  if (
    normalized === "căn hộ" ||
    normalized === "apartment" ||
    normalized.includes("căn hộ dịch vụ") ||
    normalized.includes("serviced apartment")
  ) {
    return APARTMENT_SEGMENT_LABEL;
  }

  return value;
};

export const isApartmentSegmentPropertyType = (value?: string | null): boolean => {
  const normalized = normalizeLabel(value);

  return (
    normalized === "căn hộ / căn hộ dịch vụ" ||
    normalized === "căn hộ" ||
    normalized === "apartment" ||
    normalized.includes("căn hộ dịch vụ") ||
    normalized.includes("serviced apartment")
  );
};

/**
 * Only apartment-type properties (Căn hộ dịch vụ) support long-term electronic contracts.
 * Hotels, guesthouses, and homestays are short-term (per-night/per-day) accommodations
 * and do not generate long-term lease agreements.
 */
export const supportsElectronicContractByPropertyType = (value?: string | null): boolean => {
  return isApartmentSegmentPropertyType(value);
};
