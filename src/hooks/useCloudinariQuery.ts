import { cloudinaryApi } from "@/api/cloudinaryApi";
import { ApiResponse } from "@/api/types";
import { CloudinaryImage } from "@/dataHelper/cloudinary.dataHelper";
import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";

// upload image to cloudinary
export const useUploadImageMutation = (): UseMutationResult<ApiResponse<CloudinaryImage>, Error, { image: File; folder: string }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { image: File; folder: string }) => cloudinaryApi.uploadImage(data.image, data.folder),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["building-images"] });
            return data;
        },
        onError: (error) => {
            throw error;
        }
    });
}

//upload images to cloudinary
export const useUploadImagesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { files: File[]; folder: string }) => cloudinaryApi.uploadImages(data.files, data.folder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["building-images"] });
        },
        onError: (error) => {
            throw error;
        }
    });
}

// delete image from cloudinary
export const useDeleteImageMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (publicId: string) => cloudinaryApi.deleteImage(publicId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["building-images"] });
        },
        onError: (error) => {
            throw error;
        }
    });
}