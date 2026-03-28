import { roomImageApi } from "@/api/roomImageApi";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// query hooks to fetch room images by room ID
export const useRoomImagesQuery = (roomId: number) => {
    return useQuery({
        queryKey: ["room-images", roomId],
        queryFn: async () => {
            const response = await roomImageApi.getByRoomId(roomId);
            return response.data;
        },
        enabled: !!roomId,
    });
};

// mutation hooks for room images
export const useUploadRoomImageMutation = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            return roomImageApi.upload(formData);
        },
        onSuccess: () => {
            toastSuccess(t('room_images.upload_success'));
            queryClient.invalidateQueries({ queryKey: ['room-images'] });
        },
        onError: () => {
            toastError(t('room_images.upload_failed'));
        }
    });
};

// mutation hook to update room image sort order by swapping
export const useUpdateRoomImageSortMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ roomId, imageIdA, imageIdB }: { roomId: number; imageIdA: number; imageIdB: number }) =>
            roomImageApi.updateSort(roomId, imageIdA, imageIdB),
        onMutate: async ({ roomId, imageIdA, imageIdB }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['room-images', roomId] });

            // Snapshot previous value
            const previousImages = queryClient.getQueryData(['room-images', roomId]);

            // Optimistically reorder as insert
            queryClient.setQueryData(['room-images', roomId], (old: any) => {
                if (!old) return old;
                const newImages = [...old];
                const oldIndex = newImages.findIndex((img: any) => img.id === imageIdA);
                const newIndex = newImages.findIndex((img: any) => img.id === imageIdB);
                if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                    // Remove from old position
                    const [removed] = newImages.splice(oldIndex, 1);
                    // Insert at new position
                    newImages.splice(newIndex, 0, removed);
                    // Update sort for all
                    newImages.forEach((img: any, index: number) => img.sort = index + 1);
                }
                return newImages;
            });

            return { previousImages };
        },
        onError: (_, variables, context) => {
            // Revert on error
            if (context?.previousImages) {
                queryClient.setQueryData(['room-images', variables.roomId], context.previousImages);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['room-images'] });
        },
    });
};

// mutation hook to update multiple room images types
export const useUpdateMultipleRoomImageTypesMutation = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (updates: Array<{ id: number; image_type: number }>) =>
            roomImageApi.updateMultipleTypes(updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["room-images"]});
            toastSuccess(t("room_images.update_success"));
        },
        onError: () => {
            toastError(t("room_images.update_failed"));
        },
    });
};

// mutation hook to delete multiple room images
export const useDeleteMultipleRoomImagesMutation = () => {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (ids: number[]) => roomImageApi.deleteMultiple(ids),
        onSuccess: () => {
            toastSuccess(t("room_images.delete_success"));
            queryClient.invalidateQueries({ queryKey: ["room-images"] });
        },
        onError: () => {
            toastError(t("room_images.delete_failed"));
        },
    });
};