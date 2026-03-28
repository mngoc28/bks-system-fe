import { DEFAULT_SORT_DIRECTION, DIRECTION_VALUES } from "@/constant";

// Helper to parse number with fallback
export const parseNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// Parse sort direction from string
export const parseDirection = (value: string | null): "asc" | "desc" => {
  if (!value) return DEFAULT_SORT_DIRECTION;
  return DIRECTION_VALUES.includes(value as "asc" | "desc") ? (value as "asc" | "desc") : DEFAULT_SORT_DIRECTION;
};
