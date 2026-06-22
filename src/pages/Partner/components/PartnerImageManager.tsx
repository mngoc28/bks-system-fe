import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Loader2, Plus } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from "@/components/ui/button";
import { partnerService } from '@/services/partnerService';
import { partnerCloudinaryApi } from '@/api/partnerCloudinaryApi';
import { toastSuccess, toastError } from '@/components/ui/toast';
import { CLOUDINARY_HEADER_IMAGE_URL } from '@/constant';
import { resolveCloudinaryUrl } from '@/utils/imageUtils';
import PartnerConfirmDialog from './PartnerConfirmDialog';
import InlineSheet from './InlineSheet';

interface PartnerImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'property' | 'room';
  targetId: string;
  targetName: string;
  userId?: string | number;
}

interface ImageItem {
  id: number;
  image_url: string;
  id_image_cloudinary: string;
  image_type: number;
}

interface PendingImageItem {
  id: string;
  file: File;
  previewUrl: string;
  error?: string;
}

const PartnerImageManager: React.FC<PartnerImageManagerProps> = ({
  isOpen,
  onClose,
  type,
  targetId,
  targetName,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && targetId) {
      fetchImages();
    }
  }, [isOpen, targetId, type]);

  useEffect(() => {
    if (!isOpen && pendingImages.length > 0) {
      pendingImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setPendingImages([]);
    }
  }, [isOpen, pendingImages]);

  useEffect(() => {
    if (!isOpen) {
      setDeleteTargetId(null);
      setIsDeleting(false);
    }
  }, [isOpen]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = type === 'property' 
        ? await partnerService.getPropertyImages(targetId)
        : await partnerService.getRoomImages(targetId);
      
      const data = res.data;
      setImages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toastError('Không thể tải danh sách hình ảnh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const nextItems: PendingImageItem[] = Array.from(files).map((file) => {
      let error = '';
      if (!file.type.startsWith('image/')) {
        error = 'Chỉ chấp nhận file ảnh.';
      } else if (file.size > 5 * 1024 * 1024) {
        error = 'Dung lượng vượt quá 5MB.';
      }

      return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        error,
      };
    });

    setPendingImages((prev) => [...prev, ...nextItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingImage = (id: string) => {
    setPendingImages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const getUploadData = (response: any) => {
    const payload = response?.data ?? response;
    const nested = payload?.data ?? payload;

    return {
      url: nested?.url,
      publicId: nested?.public_id,
    };
  };

  const handleCommitPendingImages = async () => {
    const validItems = pendingImages.filter((item) => !item.error);
    if (validItems.length === 0) {
      toastError('Không có ảnh hợp lệ để lưu.');
      return;
    }

    setSaving(true);
    const uploadedPublicIds: string[] = [];

    try {
      const folder = `bks-system/${type}/${targetId}`;

      for (const item of validItems) {
        const cloudRes = await partnerCloudinaryApi.uploadImage(item.file, folder);
        const cloudData = getUploadData(cloudRes);

        if (!cloudData.url || !cloudData.publicId) {
          throw new Error('Cloudinary upload response is invalid.');
        }

        uploadedPublicIds.push(cloudData.publicId);

        const dbData = {
          image_url: cloudData.url,
          id_image_cloudinary: cloudData.publicId,
          image_type: 1,
        };

        if (type === 'property') {
          await partnerService.addPropertyImage(targetId, dbData);
        } else {
          await partnerService.addRoomImage(targetId, dbData);
        }
      }

      toastSuccess(`Đã lưu ${validItems.length} ảnh.`);
      pendingImages.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      setPendingImages([]);
      fetchImages();
    } catch (error) {
      await Promise.allSettled(
        uploadedPublicIds.map((publicId) => partnerCloudinaryApi.deleteImage(publicId))
      );
      console.error('Commit pending images failed:', error);
      toastError('Lưu ảnh thất bại. Đã rollback các ảnh vừa tải lên.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (imageId: number) => {
    setDeleteTargetId(imageId);
  };

  const executeDelete = async () => {
    if (deleteTargetId == null) return;

    try {
      setIsDeleting(true);
      if (type === 'property') {
        await partnerService.deletePropertyImage(targetId, deleteTargetId);
      } else {
        await partnerService.deleteRoomImage(targetId, deleteTargetId);
      }
      toastSuccess('Đã xóa ảnh.');
      setImages((prev) => prev.filter((img) => img.id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (error) {
      console.error('Delete error:', error);
      toastError('Xóa ảnh thất bại.');
    } finally {
      setIsDeleting(false);
    }
  };

  const pendingValidCount = pendingImages.filter((item) => !item.error).length;

  return (
    <>
    <InlineSheet
      open={isOpen}
      onClose={onClose}
      title={`Quản lý hình ảnh - ${targetName}`}
      widthClassName="w-full md:max-w-3xl lg:max-w-4xl"
      footer={(
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          {pendingValidCount > 0 ? (
            <Button onClick={handleCommitPendingImages} disabled={saving}>
              {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
              Lưu {pendingValidCount} ảnh
            </Button>
          ) : null}
        </div>
      )}
    >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {/* Upload Button Card */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 transition-all hover:border-blue-500 hover:bg-blue-50"
            >
              {saving ? (
                <Spinner size="sm" showText text="Đang lưu ảnh..." />
              ) : (
                <>
                  <div className="rounded-full bg-gray-100 p-3 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
                    <Plus size={24} />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-blue-700">Thêm ảnh mới</span>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept="image/*"
                onChange={handleSelectFiles}
                disabled={saving}
              />
            </div>

            {pendingImages.map((img) => (
              <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
                <img
                  src={img.previewUrl}
                  alt="Pending"
                  className="size-full object-cover"
                />
                <div className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white">
                  Chưa lưu
                </div>
                {img.error && (
                  <div className="absolute inset-x-2 bottom-2 rounded-md bg-red-600 px-2 py-1 text-center text-[10px] text-white">
                    {img.error}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removePendingImage(img.id)}
                    className="rounded-full shadow-lg"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}

            {/* Image List */}
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-100" />
              ))
            ) : images.length > 0 ? (
              images.map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
                  <img 
                    src={resolveCloudinaryUrl(img.image_url, CLOUDINARY_HEADER_IMAGE_URL) || '/assets/images/photo_error2.png'} 
                    alt="Property" 
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/photo_error2.png';
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRequest(img.id);
                      }}
                      className="rounded-full shadow-lg"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))
            ) : !saving && pendingImages.length === 0 && (
              <div className="col-span-full py-10 text-center">
                <p className="italic text-gray-400">Chưa có hình ảnh nào cho {type === 'property' ? 'bất động sản' : 'phòng'} này.</p>
              </div>
            )}
          </div>
    </InlineSheet>

    <PartnerConfirmDialog
      open={deleteTargetId != null}
      onOpenChange={(open) => {
        if (!open && !isDeleting) setDeleteTargetId(null);
      }}
      title="Xác nhận xóa ảnh"
      description="Bạn có chắc chắn muốn xóa ảnh này? Thao tác này không thể hoàn tác."
      confirmLabel="Xóa ảnh"
      cancelLabel="Hủy"
      destructive
      isLoading={isDeleting}
      onConfirm={executeDelete}
    />
    </>
  );
};

export default PartnerImageManager;

