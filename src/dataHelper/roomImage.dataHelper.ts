// Data helper interfaces and types for room images
export interface RoomImage {
    id: number;
    room_id: number;
    image_url: string;
    id_image_cloudinary: string;
    image_type: number;
    sort: number;
    created_by: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
    full_url: string;
}

// Props for the upload room image component
export interface UploadRoomImageProps {
  roomId: number;
  onClose: () => void;
}

// Props for the file preview component
export interface FilePreview {
  file: File;
  url: string;
  error?: string;
}

// Props for the room image list component
export interface RoomImageListProps {
  roomId: number;
  onSave?: (config: { save: () => void; hasChanges: boolean }) => void;
}

// Props for the file preview component
export interface FilePreview {
  file: File;
  url: string;
  error?: string;
}

// Props for a sortable item component representing a room image
export interface SortableItemProps {
  image: RoomImage;
  onTypeChange: (imageId: number, newType: number) => void;
  currentType: number;
  isSelected: boolean;
  onSelect: (imageId: number, checked: boolean) => void;
  getImageTypeLabel: (type: number) => string;
  t: (key: string) => string;
  hasPending: boolean;
  oldType: number;
  onResetPending: (imageId: number) => void;
}