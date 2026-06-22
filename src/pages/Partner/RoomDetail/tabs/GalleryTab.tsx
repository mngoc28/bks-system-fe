import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Plus } from 'lucide-react';
import { resolveImageUrl } from '@/utils/imageUtils';
import { CLOUDINARY_HEADER_IMAGE_URL } from '@/constant';

interface GalleryTabProps {
  images: any[];
  isLoading?: boolean;
  onManageImages?: () => void;
}

export const GalleryTab: React.FC<GalleryTabProps> = ({
  images,
  isLoading,
  onManageImages,
}) => {
  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <Spinner size="lg" showText text="Đang tải thư viện ảnh..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold uppercase tracking-tighter text-slate-900 sm:text-xl">
            Thư viện hình ảnh
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Quản lý ảnh hiển thị cho phòng này trên listing và chi tiết phòng.
          </p>
        </div>
        {onManageImages && (
          <Button
            onClick={onManageImages}
            aria-label="Quản lý ảnh phòng"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-blue-700 sm:w-auto"
          >
            <Plus size={16} /> Quản lý ảnh
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.length > 0 ? images.map((img: any) => (
          <div key={img.id} className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border-4 border-white shadow-2xl shadow-slate-300/30 transition-all duration-500 hover:-translate-y-2">
            <img
              src={resolveImageUrl(img.image_url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || '/assets/images/photo_error2.png'}
              alt="Room Showcase"
              className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        )) : (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 py-24 text-center">
            <ImageIcon className="mx-auto mb-6 text-slate-200" size={64} />
            <p className="text-xs font-bold uppercase italic tracking-[0.2em] text-slate-400">
              Chưa có bộ sưu tập hình ảnh cho phòng này
            </p>
            {onManageImages && (
              <Button
                onClick={onManageImages}
                aria-label="Thêm ảnh phòng"
                className="mt-6 rounded-xl bg-blue-600 px-5 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" /> Thêm ảnh ngay
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
