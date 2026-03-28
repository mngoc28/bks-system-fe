import { pricePackageApi } from "@/api/pricePackageApi";
import { toastError } from "@/components/ui/toast";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// optional enabled parameter to control whether the query runs, default is true to run the query
export const usePricePackagesQuery = (options?: { enabled?: boolean }) => {
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["pricePackages"],
    queryFn: async () => {
      try {
        const response = await pricePackageApi.getAllPricePackages();
        return response.data;
      } catch (error) {
        toastError(t("price_packages.error_getting_price_packages"));
        throw error;
      }
    },
    // set to true to enable the query, false to disable
    enabled: options?.enabled !== false,
  });
};

// fetch price packages by room ID
export const usePricePackagesByRoomQuery = (roomId: number | undefined, options?: { enabled?: boolean }) => {
  const { t } = useTranslation();

  return useQuery({
    queryKey: ["pricePackages", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      try {
        const response = await pricePackageApi.getPricePackagesByRoom(roomId);
        return response.data;
      } catch (error) {
        toastError(t("price_packages.error_getting_price_packages"));
        throw error;
      }
    },
    enabled: !!roomId && (options?.enabled !== false),
  });
};

