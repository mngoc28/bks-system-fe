import { useCallback, useState } from 'react';

export const DASHBOARD_PROPERTY_FILTER_STORAGE_KEY = 'partner-dashboard-property-id';

const readStoredPropertyId = (): number | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(DASHBOARD_PROPERTY_FILTER_STORAGE_KEY);
  if (!raw || raw === 'all') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

/**
 * Persists partner dashboard property scope in localStorage.
 */
export const useDashboardPropertyFilter = () => {
  const [propertyId, setPropertyIdState] = useState<number | null>(readStoredPropertyId);

  const setPropertyId = useCallback((next: number | null) => {
    setPropertyIdState(next);
    if (next == null) {
      localStorage.removeItem(DASHBOARD_PROPERTY_FILTER_STORAGE_KEY);
      return;
    }
    localStorage.setItem(DASHBOARD_PROPERTY_FILTER_STORAGE_KEY, String(next));
  }, []);

  const selectedPropertyKey = propertyId != null ? String(propertyId) : null;

  return {
    propertyId,
    selectedPropertyKey,
    setPropertyId,
  } as const;
};
