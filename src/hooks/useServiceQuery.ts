import { CreateServiceRequest, ServiceFilters } from "@/dataHelper/service.dataHelper";
import { serviceApi } from "@/api/serviceApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

// optional enabled parameter to control whether the query runs, default is true to run the query
export const useServicesQuery = (options?: { enabled?: boolean }) => {

  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      try {
        const response = await serviceApi.getAllServices();
        if (response && response.data && Array.isArray(response.data.data)) {
          return response.data.data;
        }
        return [];
      } catch (error) {
        toastError(t("services.error_getting_services"));
        throw error;
      }
    },
    // set to true to enable the query, false to disable
    enabled: options?.enabled !== false,
  });
};

// get list and search to manage
export const useGetServicesMutation = (data: ServiceFilters) => {

  return useQuery({
    queryKey: ["services", data],
    queryFn: async () => {
      const response = await serviceApi.getAllAndSearchServices(data);
      return response;
    },
  });
};

export const useAllServicesQuery = () => {
  const { t } = useTranslation();
  return useQuery({
    queryKey: ["all-services"],
    queryFn: async () => {
      try {
        const response = await serviceApi.getAllServicesAll();
        return response.data;
      } catch (error) {
        toastError(t("serviceManagement.error_getting_services"));
                throw error;
      }
    },
  });
};

// delete service 
export const useDeleteServicesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceApi.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toastSuccess(t('serviceManagement.service_deleted_success'));
    }
  })
}

// add service
export const useCreateServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceRequest) => serviceApi.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toastSuccess(t('serviceManagement.create_service_success'));
    },
    onError: () => {
      toastError(t('serviceManagement.create_service_fail'))
    }
  })
}

//Update service
export const useUpdateServiceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateServiceRequest }) => serviceApi.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toastSuccess(t('serviceManagement.update_service_success'))
    },
    onError: () => {
      toastError(t('serviceManagement.update_service_failed'))
    },
  })
}
