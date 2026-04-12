import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toastError } from "@/components/ui/toast";
import { IMAGE_COMPRESS_QUALITY, IMAGE_FOLDER, IMAGE_MAX_FILES, IMAGE_MAX_WIDTH, ROOM_IMAGE_TYPE } from "@/constant";
import { FilePreview, UploadRoomImageProps } from "@/dataHelper/roomImage.dataHelper";
import { useRoomImagesQuery, useUploadRoomImageMutation } from "@/hooks/useRoomImageQuery";
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
  }, [compressImage, files, imageSchema, images, t]);

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-5" />
            {t("common.upload")} {t("rooms.image")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
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
              className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
              id="file-upload"
            />
            <ImageIcon className="size-8 mx-auto mb-2 text-gray-400" />
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
            <div className="flex items-center gap-4 mt-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <label htmlFor="file-upload" className="text-gray-400 text-sm font-medium whitespace-nowrap cursor-pointer">
                {t("room_images.select_file")}
              </label>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
          </div>

          {/* File Previews */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">{t('room_images.selected_files', { count: files.length })}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-60 overflow-y-auto">
                {files.map((filePreview, index) => (
                  <div key={index} className="relative group border rounded-md p-2 bg-white">
                    <img
                      src={filePreview.url}
                      alt={`Preview ${index + 1}`}
                      className={`w-full aspect-square object-cover rounded border ${
                        filePreview.error ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />

                    {/* Error indicator */}
                    {filePreview.error && (
                      <div className="absolute top-1 left-1 bg-red-500 text-white p-1 rounded">
                        <AlertCircle className="size-3" />
                      </div>
                    )}

                    {/* Remove button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 w-6 h-6 p-0 bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="size-3" />
                    </Button>

                    {/* File info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-1 text-xs truncate">
                      {filePreview.file.name}
                    </div>

                    {/* Error message */}
                    {filePreview.error && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-1 text-xs">
                        {filePreview.error}
                      </div>
                    )}

                    {!filePreview.error && (
                      <div className="mt-2">
                        <Label className="text-xs text-gray-600">{t('room_images.image_type')}</Label>
                        <Select
                          value={String(filePreview.imageType ?? ROOM_IMAGE_TYPE.MAIN_ROOM)}
                          onValueChange={(value) => {
                            setFiles((prev) => prev.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, imageType: Number(value) } : item
                            ));
                          }}
                        >
                          <SelectTrigger className="h-8 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROOM_IMAGE_TYPE).map(([key, value]) => (
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
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                {t('room_images.some_files_invalid')}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
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