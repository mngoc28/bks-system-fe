export interface TouristSpotSummaryItem {
  id?: number | null;
  name?: string | null;
  slug?: string | null;
  travel_time_minutes?: number | null;
  travel_time_label?: string | null;
  distance_km?: number | null;
  distance_label?: string | null;
  is_primary?: boolean;
}

export interface RoomTouristSummary {
  has_tourist_mapping?: boolean;
  tourist_spot_name?: string | TouristSpotSummaryItem | null;
  tourist_spot_slug?: string | null;
  travel_time_label?: string | null;
  distance_label?: string | null;
  tourist_spots?: TouristSpotSummaryItem[];
}

/** Resolve display name from API string or nested spot object. */
export function resolveTouristSpotName(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const name = record.name ?? record.tourist_spot_name;
    if (typeof name === "string") {
      return name.trim();
    }
  }
  return "";
}

export function formatTravelTimeMinutes(minutes: number | null | undefined): string | null {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return `${Math.round(value)} phút di chuyển`;
}

export function resolveTravelTimeLabel(
  spot: TouristSpotSummaryItem,
  summary?: RoomTouristSummary | null,
): string | null {
  if (spot.travel_time_label?.trim()) {
    const label = spot.travel_time_label.trim();
    if (!/^0\s*phút/i.test(label)) {
      return label;
    }
  }
  const fromMinutes = formatTravelTimeMinutes(spot.travel_time_minutes);
  if (fromMinutes) {
    return fromMinutes;
  }
  if (spot.is_primary && summary?.travel_time_label && !/^0\s*phút/i.test(summary.travel_time_label)) {
    return summary.travel_time_label.trim();
  }
  return null;
}

/** Primary spot + secondary list, de-duplicated. */
export function listRoomTouristSpots(summary: RoomTouristSummary | null | undefined): TouristSpotSummaryItem[] {
  if (!summary?.has_tourist_mapping) {
    return [];
  }

  const primaryName = resolveTouristSpotName(summary.tourist_spot_name);
  const fromList = Array.isArray(summary.tourist_spots) ? summary.tourist_spots : [];

  const items: TouristSpotSummaryItem[] = [];

  if (primaryName) {
    items.push({
      name: primaryName,
      slug: summary.tourist_spot_slug ?? undefined,
      travel_time_label: summary.travel_time_label ?? undefined,
      is_primary: true,
    });
  }

  for (const spot of fromList) {
    const name = resolveTouristSpotName(spot?.name ?? spot);
    if (!name) {
      continue;
    }
    if (items.some((item) => item.name === name)) {
      continue;
    }
    items.push({
      ...spot,
      name,
      is_primary: Boolean(spot.is_primary),
    });
  }

  return items.sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)));
}
