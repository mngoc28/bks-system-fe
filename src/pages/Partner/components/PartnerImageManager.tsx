import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { partnerService } from '@/services/partnerService';
import { partnerCloudinaryApi } from '@/api/partnerCloudinaryApi';
import { toastSuccess, toastError } from '@/components/ui/toast';

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

  const handleDelete = async (imageId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;

    try {
      if (type === 'property') {
        await partnerService.deletePropertyImage(targetId, imageId);
      } else {
        await partnerService.deleteRoomImage(targetId, imageId);
      }
      toastSuccess('Đã xóa ảnh.');
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Delete error:', error);
      toastError('Xóa ảnh thất bại.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden p-0">
        <DialogHeader className="border-b bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <ImageIcon className="text-blue-600" size={24} />
              Quản lý hình ảnh - {targetName}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {/* Upload Button Card */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 transition-all hover:border-blue-500 hover:bg-blue-50"
            >
              {saving ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                  <span className="text-xs font-medium text-gray-500">Đang lưu ảnh...</span>
                </div>
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
                    src={img.image_url} 
                    alt="Property" 
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(img.id)}
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
        </div>

        <div className="flex justify-end gap-3 border-t bg-gray-50 p-4">
          {pendingImages.some((item) => !item.error) && (
            <Button onClick={handleCommitPendingImages} disabled={saving}>
              {saving ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
              Lưu {pendingImages.filter((item) => !item.error).length} ảnh
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerImageManager;

