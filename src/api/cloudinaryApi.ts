import { CloudinaryImage } from "@/dataHelper/cloudinary.dataHelper";
import { ApiResponse } from "./types";
import axiosClient from "./axiosClient";

export const cloudinaryApi = {
    // upload image to cloudinary
    uploadImage: (image: File, folder: string): Promise<ApiResponse<CloudinaryImage>> => {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('folder', folder);
        return axiosClient.post(`/admin/cloudinary/upload-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    // upload images to cloudinary
    uploadImages: (files: File[], folder: string): Promise<ApiResponse<CloudinaryImage[]>> => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files[]', file);
        });
        formData.append('folder', folder);
        return axiosClient.post(`/admin/cloudinary/upload-multiple-images`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    // delete image from cloudinary
    deleteImage: (publicId: string): Promise<ApiResponse<CloudinaryImage>> =>
        axiosClient.delete(`/admin/cloudinary/delete-image`, { data: { public_id: publicId } }),
}