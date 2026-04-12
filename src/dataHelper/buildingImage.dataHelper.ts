export interface buildingImage{
    id: number;
    building_id?: number;
    image_url?: string;
    image_type?: number;
    id_image_cloudinary?: string;
    sort?: number;
    created_by?: number;
    updated_by?: number;
    created_at?: string;
    updated_at?: string;
}

export interface RequestBuildingImage {
    image_url?: string;
    image_type?: number;
    id_image_cloudinary?: string;
    building_id?: number;
    sort?: number;
}

export interface BuildingImageFormProps{
    buildingImages: buildingImage[];
    onSubmit: (data: RequestBuildingImage) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    isError?: boolean;
}
export interface BuildingImageEditFormProps{
    userId?: number;
    buildingId?: number;
    images: buildingImage[];
    isLoadingData?: boolean;
    isErrorData?: boolean;
    updatingImageIds?: Set<number>;
    isErrorUpdate?: boolean;
    isErrorDelete?: boolean;
    onDeleteSelected?: () => void;
    isBusy?: boolean;
    onStateChange?: (state: { hasChanges: boolean; selectedCount: number; totalCount: number }) => void;
}
export interface BuildingImageEditFormRef {
    getUpdatedImages: () => buildingImage[];
    getSelectedImages: () => number[];
    selectAllImages: () => void;
    clearSelectedImages: () => void;
    resetImages: () => void;
}
export interface BuildingAddImageProps {
    userId: number;
    buildingId: number;
    open: boolean;
    onClose: () => void;
}