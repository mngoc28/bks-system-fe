export interface propertyImage {
  id: number;
  property_id?: number;
  image_url?: string;
  image_type?: number;
  id_image_cloudinary?: string;
  sort?: number;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RequestPropertyImage {
  image_url?: string;
  image_type?: number;
  id_image_cloudinary?: string;
  property_id?: number;
  sort?: number;
}

export interface PropertyImageFormProps {
  propertyImages: propertyImage[];
  onSubmit: (data: RequestPropertyImage) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isError?: boolean;
}
export interface PropertyImageEditFormProps {
  userId?: number;
  propertyId?: number;
  images: propertyImage[];
  isLoadingData?: boolean;
  isErrorData?: boolean;
  updatingImageIds?: Set<number>;
  isErrorUpdate?: boolean;
  isErrorDelete?: boolean;
  onDeleteSelected?: () => void;
  isBusy?: boolean;
  onStateChange?: (state: { hasChanges: boolean; selectedCount: number; totalCount: number }) => void;
}
export interface PropertyImageEditFormRef {
  getUpdatedImages: () => propertyImage[];
  getSelectedImages: () => number[];
  selectAllImages: () => void;
  clearSelectedImages: () => void;
  resetImages: () => void;
}
export interface PropertyAddImageProps {
  userId: number;
  propertyId: number;
  open: boolean;
  onClose: () => void;
}
