import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toastError } from "@/components/ui/toast";
import { IMAGE_COMPRESS_QUALITY, IMAGE_FOLDER, IMAGE_MAX_FILES, IMAGE_MAX_WIDTH, ROOM_IMAGE_TYPE, getFilteredRoomImageTypes } from "@/constant";
import { FilePreview, UploadRoomImageProps } from "@/dataHelper/roomImage.dataHelper";
import { useRoomImagesQuery, useUploadRoomImageMutation } from "@/hooks/useRoomImageQuery";
import { useRoomQuery } from "@/hooks/useRoomQuery";
import { singleImageSchema } from "@/shared/shema";
import { AlertCircle, Image as ImageIcon, Upload, X } from "lucide-react";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Upload Room Image Modal
 * An interactive upload dialog that supports drag-and-drop, client-side image compression, and category assignment for room photos.
 */
export const UploadRoomImage: React.FC<UploadRoomImageProps> = ({ roomId, onClose }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const uploadMutation = useUploadRoomImageMutation();
  const { data: images } = useRoomImagesQuery(roomId);
  const { data: room } = useRoomQuery(roomId);

  const imageSchema = singleImageSchema(t);

  // Compress image
  const compressImage = useCallback(async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const ratio = IMAGE_MAX_WIDTH / img.width;
        canvas.width = IMAGE_MAX_WIDTH;
        canvas.height = img.height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        }, 'image/jpeg', IMAGE_COMPRESS_QUALITY);
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Handle file selection
  const processFiles = useCallback(async (selectedFiles: File[]) => {
    const maxFiles = IMAGE_MAX_FILES;
    const currentImagesCount = images?.length || 0;
    const availableSlots = maxFiles - currentImagesCount;

    if (selectedFiles.length > availableSlots) {
      toastError(t('room_images.upload_exceeded_available', { available: availableSlots }));
      return;
    }

    const newPreviews: FilePreview[] = [];

    for (const file of selectedFiles) {
      const validation = imageSchema.safeParse({ file });
      if (!validation.success) {
        const errorMessage = validation.error.issues[0]?.message || t('room_images.accepted_file_types');
        newPreviews.push({
          file,
          url: URL.createObjectURL(file),
          error: errorMessage
        });
      } else {
        try {
          const compressedFile = await compressImage(file);
          newPreviews.push({
            file: compressedFile,
            url: URL.createObjectURL(compressedFile),
            imageType: ROOM_IMAGE_TYPE.MAIN_ROOM,
          });
        } catch {
          newPreviews.push({
            file,
            url: URL.createObjectURL(file),
            imageType: ROOM_IMAGE_TYPE.MAIN_ROOM,
          });
        }
      }
    }

    setFiles(prev => [...prev, ...newPreviews]);
  }, [compressImage, imageSchema, images, t]);

  // File input change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  // Drag leave handler
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Drop handler
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  }, [processFiles]);

  // Remove file from preview list
  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    URL.revokeObjectURL(fileToRemove.url);
    setFiles(files.filter((_, i) => i !== index));
  };

  // Handle upload button click
  const handleUpload = async () => {
    const validFiles = files.filter(f => !f.error);

    if (validFiles.length === 0) {
      toastError(t('room_images.no_valid_files'));
      return;
    }

    try {
      await Promise.all(validFiles.map(async (filePreview) => {
        const formData = new FormData();
        formData.append('images[]', filePreview.file);
        formData.append('room_id', roomId.toString());
        formData.append('image_type', String(filePreview.imageType ?? ROOM_IMAGE_TYPE.MAIN_ROOM));
        formData.append('folder', IMAGE_FOLDER);
        await uploadMutation.mutateAsync(formData);
      }));

      // Clean up all preview URLs
      files.forEach(file => URL.revokeObjectURL(file.url));
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const validFilesCount = files.filter(f => !f.error).length;
  const hasErrors = files.some(f => f.error);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            {t("common.upload")} {t("rooms.image")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
              id="file-upload"
            />
            <ImageIcon className="mx-auto mb-2 size-8 text-gray-400" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                {t("common.upload")} {t("rooms.image")} (PNG, JPG, JPEG, WebP)
              </p>
              <p className="text-xs text-gray-500">
                {t('room_images.drag_drop_instruction')}
              </p>
              <p className="text-xs text-gray-500">
                {t('room_images.max_size_auto_compress')}
              </p>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <label htmlFor="file-upload" className="cursor-pointer whitespace-nowrap text-sm font-medium text-gray-400">
                {t("room_images.select_file")}
              </label>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          </div>

          {/* File Previews */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">{t('room_images.selected_files', { count: files.length })}</h4>
              <div className="grid max-h-60 grid-cols-1 gap-4 overflow-y-auto sm:grid-cols-2 md:grid-cols-3">
                {files.map((filePreview, index) => (
                  <div key={index} className="group relative rounded-md border bg-white p-2">
                    <img
                      src={filePreview.url}
                      alt={`Preview ${index + 1}`}
                      className={`aspect-square w-full rounded border object-cover ${
                        filePreview.error ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />

                    {/* Error indicator */}
                    {filePreview.error && (
                      <div className="absolute left-1 top-1 rounded bg-red-500 p-1 text-white">
                        <AlertCircle className="size-3" />
                      </div>
                    )}

                    {/* Remove button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="absolute right-1 top-1 size-6 bg-red-500 p-0 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                    >
                      <X className="size-3" />
                    </Button>

                    {/* File info */}
                    <div className="absolute inset-x-0 bottom-0 truncate bg-black bg-opacity-50 p-1 text-xs text-white">
                      {filePreview.file.name}
                    </div>

                    {/* Error message */}
                    {filePreview.error && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-500 p-1 text-xs text-white">
                        {filePreview.error}
                      </div>
                    )}

                    {!filePreview.error && (
                      <div className="mt-2">
                        <label className="text-xs text-gray-600">{t('room_images.image_type')}</label>
                        <Select
                          value={String(filePreview.imageType ?? ROOM_IMAGE_TYPE.MAIN_ROOM)}
                          onValueChange={(value) => {
                            setFiles((prev) => prev.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, imageType: Number(value) } : item
                            ));
                          }}
                        >
                          <SelectTrigger className="mt-1 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {getFilteredRoomImageTypes(room?.property_type_id).map(([key, value]) => (
                              <SelectItem key={value} value={value.toString()}>
                                {t(`room_images.types.${key.toLowerCase()}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Status */}
          {hasErrors && (
            <div className="rounded border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                {t('room_images.some_files_invalid')}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleUpload}
              disabled={uploadMutation.isPending || validFilesCount === 0}
            >
              {uploadMutation.isPending
                ? t('room_images.uploading')
                : t('room_images.upload_count', { count: validFilesCount })
              }
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};