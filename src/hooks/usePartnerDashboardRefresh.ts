import { useQueryClient } from '@tanstack/react-query';

/** Query keys invalidated when partner dashboard is refreshed. */
export const PARTNER_DASHBOARD_QUERY_KEYS = [
  ['partner-stats'],
  ['partner', 'dashboard', 'kpis'],
  ['partner', 'dashboard', 'charts', 'occupancy'],
  ['partner', 'dashboard', 'charts', 'gmv'],
  ['partner-pending-bookings'],
  ['partner-urgent-maintenances'],
  ['partner', 'contracts', 'expiring-soon'],
] as const;

export const usePartnerDashboardRefresh = () => {
  const queryClient = useQueryClient();

  const refreshDashboard = async (): Promise<void> => {
    await Promise.all(
      PARTNER_DASHBOARD_QUERY_KEYS.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey: [...queryKey] }),
      ),
    );
  };

  return { refreshDashboard };
};
