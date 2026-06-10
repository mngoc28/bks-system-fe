type DashboardLinkOptions = {
  propertyId?: number | null;
  status?: string | number;
};

/**
 * Append dashboard context query params for deep links from Alert Center / work queue.
 */
export const buildPartnerDashboardLink = (path: string, options: DashboardLinkOptions = {}): string => {
  const params = new URLSearchParams();

  if (options.status !== undefined && options.status !== '') {
    params.set('status', String(options.status));
  }

  if (options.propertyId != null && options.propertyId > 0) {
    params.set('property_id', String(options.propertyId));
  }

  const query = params.toString();
  if (!query) return path;

  return path.includes('?') ? `${path}&${query}` : `${path}?${query}`;
};
