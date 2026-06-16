import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckSquare, ImageIcon, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toastError } from "@/components/ui/toast";
import { CLOUDINARY_HEADER_IMAGE_URL, ROOM_IMAGE_TYPE, getFilteredRoomImageTypes } from "@/constant";
import { useRoomQuery } from "@/hooks/useRoomQuery";
import { RoomImage, RoomImageListProps, SortableItemProps } from "@/dataHelper/roomImage.dataHelper";
import { useDeleteMultipleRoomImagesMutation, useRoomImagesQuery, useUpdateMultipleRoomImageTypesMutation, useUpdateRoomImageSortMutation } from "@/hooks/useRoomImageQuery";

const getRoomImageSrc = (imageUrl: string) => {
  if (!imageUrl) return "";
  return imageUrl.startsWith("http") ? imageUrl : `${CLOUDINARY_HEADER_IMAGE_URL}/${imageUrl}`;
};

/**
 * Sortable Item
 * A draggable image component representing a single room photo, integrated with dnd-kit for reordering and type selection.
 */
const SortableItem: React.FC<SortableItemProps> =
  ({
    image,
    onTypeChange,
    currentType,
    isSelected,
    onSelect,
    t,
    hasPending,
    oldType,
    onResetPending,
    filteredTypes
  }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 0.0001s ease-out',
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className={`
          group relative overflow-hidden rounded-lg shadow-sm transition-shadow hover:shadow-md
          ${isDragging ? 'opacity-50' : ''}
          ${hasPending ? 'border-4 border-blue-400' : 'border border-gray-200'}
          ${isSelected ? 'border-4 border-red-500' : ''}
        `}
        onClick={(e) => { e.stopPropagation(); if (isSelected) onSelect(image.id, false); }}
        {...attributes}
        {...listeners}
      >
        <img
          src={getRoomImageSrc(image.image_url)}
          alt={`${t("rooms.image")} ${image.sort}`}
          className="aspect-[4/3] w-full object-cover"
        />

        {/* Checkbox for selection */}
        <div className="absolute right-2 top-2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect(image.id, checked as boolean)}
            onPointerDown={(e) => e.stopPropagation()}
          />
        </div>

        {/* Sort number badge */}
        <div className="absolute left-2 top-2 rounded bg-black bg-opacity-50 px-2 py-1 text-sm font-medium text-white">
          #{image.sort}
        </div>

        
      </div>
      {/* Select for image type below the image */}
      <div className="bg-white p-2">
        <Select
          value={currentType.toString()}
          onValueChange={(value) => {
            const numValue = Number(value);
            if (numValue === oldType) {
              onResetPending(image.id);
            } else {
              onTypeChange(image.id, numValue);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(filteredTypes || Object.entries(ROOM_IMAGE_TYPE)).map(([key, value]) => (
              <SelectItem
                key={value}
                value={value.toString()}
                className={value === oldType ? 'bg-gray-100 text-blue-600' : ''}
              >
                {t(`room_images.types.${key.toLowerCase()}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const getImageTypeLabel = (type: number, t: (key: string) => string) => {
  switch (type) {
    case ROOM_IMAGE_TYPE.OTHER:
      return t('room_images.types.other');
    case ROOM_IMAGE_TYPE.MAIN_ROOM:
      return t('room_images.types.main_room');
    case ROOM_IMAGE_TYPE.INTERIOR:
      return t('room_images.types.interior');
    case ROOM_IMAGE_TYPE.EXTERIOR:
      return t('room_images.types.exterior');
    case ROOM_IMAGE_TYPE.BATHROOM:
      return t('room_images.types.bathroom');
    case ROOM_IMAGE_TYPE.KITCHEN:
      return t('room_images.types.kitchen');
    case ROOM_IMAGE_TYPE.BALCONY:
      return t('room_images.types.balcony');
    case ROOM_IMAGE_TYPE.LIVING_ROOM:
      return t('room_images.types.living_room');
    case ROOM_IMAGE_TYPE.BEDROOM:
      return t('room_images.types.bedroom');
    case ROOM_IMAGE_TYPE.DINING_ROOM:
      return t('room_images.types.dining_room');
    case ROOM_IMAGE_TYPE.GARDEN:
      return t('room_images.types.garden');
    case ROOM_IMAGE_TYPE.PARKING:
      return t('room_images.types.parking');
    case ROOM_IMAGE_TYPE.ENTRANCE:
      return t('room_images.types.entrance');
    case ROOM_IMAGE_TYPE.STAIRCASE:
      return t('room_images.types.staircase');
    case ROOM_IMAGE_TYPE.HALLWAY:
      return t('room_images.types.hallway');
    case ROOM_IMAGE_TYPE.OFFICE:
      return t('room_images.types.office');
    default:
      return t('unknown');
  }
};

/**
 * Room Image List
 * Manages the interactive grid of room images, supporting drag-and-drop reordering, bulk deletion, and category updates.
 */
export const RoomImageList: React.FC<RoomImageListProps> = ({ roomId, onSave }) => {
  const { t } = useTranslation();
  const deleteMultipleMutation = useDeleteMultipleRoomImagesMutation();
  const updateMultipleTypesMutation = useUpdateMultipleRoomImageTypesMutation();
  const updateSortMutation = useUpdateRoomImageSortMutation();

  const { data: images, isLoading } = useRoomImagesQuery(roomId);
  const { data: room } = useRoomQuery(roomId);
  const filteredTypes = getFilteredRoomImageTypes(room?.property_type_id);
  const [_isUpdating, setIsUpdating] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{ [key: number]: number }>({});
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const displayImages = images || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      updateSortMutation.mutate({ roomId, imageIdA: active.id as number, imageIdB: over.id as number });
    }
  };

  const handleTypeChange = (imageId: number, newType: number) => {
    setPendingChanges(prev => ({ ...prev, [imageId]: newType }));
  };

  const handleSaveAll = async () => {
    const updates = Object.entries(pendingChanges).map(([id, type]) => ({
      id: Number(id),
      image_type: type
    }));

    if (updates.length === 0) return;

    setIsUpdating(true);
    try {
      await updateMultipleTypesMutation.mutateAsync(updates);
    } catch {
      toastError(t('room_images.update_failed'));
    } finally {
      setIsUpdating(false);
    }
  };

  setTimeout(() => {
    setPendingChanges(prev => {
      const newPending = { ...prev };
      displayImages.forEach((img: RoomImage) => {
        if (newPending[img.id] === img.image_type) {
          delete newPending[img.id];
        }
      });
      return newPending;
    });
  }, 1000);

  const handleSelect = (imageId: number, checked: boolean) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(imageId);
      } else {
        newSet.delete(imageId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedImages(new Set(displayImages.map((img: RoomImage) => img.id)));
  };

  const handleDeselectAll = () => {
    setSelectedImages(new Set());
  };

  const handleDeleteSelected = () => {
    if (selectedImages.size === 0) return;
    setIsDeleteDialogOpen(true);
  };

  useEffect(() => {
    if (onSave) {
      onSave({ save: () => handleSaveAll(), hasChanges: Object.keys(pendingChanges).length > 0 });
    }
  }, [onSave, pendingChanges]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">{t("loading")}</p>
        </div>
      ) : !displayImages || displayImages.length === 0 ? (
        <div className="py-12 text-center">
          <ImageIcon className="mx-auto mb-4 size-12 text-gray-400" />
          <p className="text-gray-500">{t("rooms.no_images_yet")}</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={displayImages.length === selectedImages.size ? handleDeselectAll : handleSelectAll}
              title={displayImages.length === selectedImages.size ? t("common.deselect_all") : t("common.select_all")}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              <CheckSquare className="size-4" />
            </Button>
            <Button
              variant="outline" size="sm"
              onClick={handleDeleteSelected}
              disabled={selectedImages.size === 0}
              title={t("common.delete")}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
          <SortableContext items={displayImages.map((img: RoomImage) => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {displayImages.map((image: RoomImage) => (
                <SortableItem
                  key={image.id}
                  image={image}
                  onTypeChange={handleTypeChange}
                  currentType={pendingChanges[image.id] ?? image.image_type}
                  isSelected={selectedImages.has(image.id)}
                  onSelect={handleSelect}
                  getImageTypeLabel={(type) => getImageTypeLabel(type, t)}
                  t={t}
                  hasPending={pendingChanges[image.id] !== undefined}
                  oldType={image.image_type}
                  onResetPending={(id) => setPendingChanges(prev => {
                    const newP = {...prev};
                    delete newP[id];
                    return newP
                  })}
                  filteredTypes={filteredTypes}
                />
              ))}
            </div>
          </SortableContext>
        </>
      )}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("room_images.confirm_delete")}</DialogTitle>
            <DialogDescription>
              {t("room_images.confirm_delete_description", { count: selectedImages.size })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                deleteMultipleMutation.mutate(Array.from(selectedImages));
                setSelectedImages(new Set());
                setIsDeleteDialogOpen(false);
              }}
              disabled={deleteMultipleMutation.isPending}
            >
              {deleteMultipleMutation.isPending ? t("common.deleting") : t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
};