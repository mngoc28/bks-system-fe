import { useEffect, useMemo, useState } from "react";
import { ImagePlus, RotateCcw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CLOUDINARY_HEADER_IMAGE_URL, IMAGE_ALLOWED_TYPES, IMAGE_MAX_SIZE } from "@/constant";
import { PartnerDetail } from "@/dataHelper/partner.dataHelper";
import { useUpdatePartnerProfileMutation } from "@/hooks/usePartnerQuery";
import { resolveImageUrl } from "@/utils/imageUtils";
import { appendImageField } from "@/utils/utils";

type ImageField = "image_1" | "image_2" | "image_3";
type ImageValue = File | "delete" | null;

interface PartnerPublicImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerDetail?: PartnerDetail;
}

export const PARTNER_PUBLIC_IMAGE_SLOTS: Array<{ field: ImageField; description: string }> = [
  {
    field: "image_1",
    description: "Ảnh đại diện thương hiệu — hiển thị trên trang chủ và danh sách đối tác. Nên dùng ngoại cảnh, sảnh hoặc không gian chung; tránh ảnh nội thất phòng ngủ.",
  },
  {
    field: "image_2",
    description: "Ảnh bổ sung trên trang chi tiết đối tác. Ưu tiên khu vực nổi bật (hồ bơi, vườn, sảnh) — khác với ảnh phòng/cơ sở.",
  },
  {
    field: "image_3",
    description: "Ảnh bổ sung trên trang chi tiết đối tác. Góc chụp thương hiệu khác, không trùng với ảnh phòng trong gallery.",
  },
];

const SLOT_CONFIG = PARTNER_PUBLIC_IMAGE_SLOTS;

const EMPTY_SELECTIONS: Record<ImageField, ImageValue> = {
  image_1: null,
  image_2: null,
  image_3: null,
};

const EMPTY_ERRORS: Record<ImageField, string | null> = {
  image_1: null,
  image_2: null,
  image_3: null,
};

const PartnerPublicImageDialog = ({ open, onOpenChange, partnerDetail }: PartnerPublicImageDialogProps) => {
  const updatePartnerProfileMutation = useUpdatePartnerProfileMutation();
  const [imageSelections, setImageSelections] = useState<Record<ImageField, ImageValue>>(EMPTY_SELECTIONS);
  const [errors, setErrors] = useState<Record<ImageField, string | null>>(EMPTY_ERRORS);

  useEffect(() => {
    if (!open) {
      setImageSelections(EMPTY_SELECTIONS);
      setErrors(EMPTY_ERRORS);
    }
  }, [open]);

  const previewUrls = useMemo(() => {
    const urls: Record<ImageField, string | null> = {
      image_1: null,
      image_2: null,
      image_3: null,
    };

    for (const field of Object.keys(imageSelections) as ImageField[]) {
      const value = imageSelections[field];
      if (value instanceof File) {
        urls[field] = URL.createObjectURL(value);
      }
    }

    return urls;
  }, [imageSelections]);

  useEffect(() => {
    return () => {
      for (const url of Object.values(previewUrls)) {
        if (url) {
          URL.revokeObjectURL(url);
        }
      }
    };
  }, [previewUrls]);

  const handleFileChange = (field: ImageField, file: File | null) => {
    if (!file) {
      return;
    }

    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, [field]: "Chỉ chấp nhận file ảnh JPEG, PNG, JPG hoặc WebP." }));
      setImageSelections((prev) => ({ ...prev, [field]: null }));
      return;
    }

    if (file.size > IMAGE_MAX_SIZE) {
      setErrors((prev) => ({ ...prev, [field]: "Kích thước file không được vượt quá 5MB." }));
      setImageSelections((prev) => ({ ...prev, [field]: null }));
      return;
    }

    setErrors((prev) => ({ ...prev, [field]: null }));
    setImageSelections((prev) => ({ ...prev, [field]: file }));
  };

  const handleRestore = (field: ImageField) => {
    setErrors((prev) => ({ ...prev, [field]: null }));
    setImageSelections((prev) => ({ ...prev, [field]: null }));
  };

  const handleDelete = (field: ImageField) => {
    setErrors((prev) => ({ ...prev, [field]: null }));
    setImageSelections((prev) => ({ ...prev, [field]: "delete" }));
  };

  const handleClose = () => {
    if (updatePartnerProfileMutation.isPending) {
      return;
    }
    onOpenChange(false);
  };

  const handleSave = async () => {
    const changedEntries = Object.entries(imageSelections).filter(([, value]) => value instanceof File || value === "delete");
    if (changedEntries.length === 0) {
      onOpenChange(false);
      return;
    }

    const formData = new FormData();
    for (const [field, value] of changedEntries as Array<[ImageField, ImageValue]>) {
      appendImageField(formData, field, value);
    }

    try {
      await updatePartnerProfileMutation.mutateAsync(formData);
      onOpenChange(false);
    } catch {
      // Toast handled by mutation onError
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[min(90vh,calc(100vh-2rem))] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 space-y-2 border-b border-slate-100 px-6 pb-4 pt-6">
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            <span className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
              <ImagePlus size={18} />
            </span>
            Quản lý ảnh giới thiệu đối tác
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Tối đa 3 ảnh thương hiệu đối tác trên trang chủ và trang chi tiết. Đây là ảnh giới thiệu cơ sở, không phải ảnh phòng hay ảnh đại diện tài khoản quản lý.
          </DialogDescription>
        </DialogHeader>

        <div className="custom-scrollbar grid flex-1 gap-4 overflow-y-auto p-6 lg:grid-cols-3">
          {SLOT_CONFIG.map((slot) => {
            const currentImage = partnerDetail?.[slot.field];
            const previewImage = previewUrls[slot.field];
            const isMarkedForDelete = imageSelections[slot.field] === "delete";
            const displayImage = !isMarkedForDelete
              ? previewImage || resolveImageUrl(currentImage, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL })
              : null;

            return (
              <div key={slot.field} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs leading-relaxed text-slate-500">{slot.description}</p>

                <div className="relative overflow-hidden rounded-lg border border-dashed border-slate-200 bg-white">
                  {displayImage ? (
                    <div className="relative aspect-[4/3]">
                      <img
                        src={displayImage}
                        alt="Ảnh giới thiệu đối tác"
                        className="size-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/assets/images/photo_error2.png";
                        }}
                      />
                      {previewImage ? (
                        <span className="absolute left-3 top-3 rounded-full bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                          Ảnh mới — chưa lưu
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 px-4 text-center">
                      <div className="rounded-full bg-slate-100 p-3 text-slate-400">
                        <Upload className="size-5" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        {isMarkedForDelete ? "Ảnh sẽ được xóa sau khi bạn lưu thay đổi." : "Chưa tải ảnh cho vị trí này."}
                      </p>
                      <p className="text-xs text-slate-400">PNG, JPG, JPEG, WebP tối đa 5MB</p>
                    </div>
                  )}
                </div>

                {errors[slot.field] ? (
                  <p className="mt-3 text-xs font-semibold text-rose-600">{errors[slot.field]}</p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700">
                    <Upload className="size-3.5" />
                    {displayImage ? "Thay ảnh" : "Tải ảnh"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleFileChange(slot.field, e.target.files?.[0] ?? null);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {previewImage || isMarkedForDelete ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-slate-200"
                      onClick={() => handleRestore(slot.field)}
                      disabled={updatePartnerProfileMutation.isPending}
                    >
                      <RotateCcw className="mr-1 size-3.5" />
                      Hủy thay đổi
                    </Button>
                  ) : null}

                  {(currentImage || previewImage) && !isMarkedForDelete ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      onClick={() => handleDelete(slot.field)}
                      disabled={updatePartnerProfileMutation.isPending}
                    >
                      <Trash2 className="mr-1 size-3.5" />
                      Xóa ảnh
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex shrink-0 flex-row flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={updatePartnerProfileMutation.isPending}
            className="min-w-[96px]"
          >
            Đóng
          </Button>
          <Button
            type="button"
            className="min-w-[120px] bg-amber-600 hover:bg-amber-700"
            onClick={() => void handleSave()}
            disabled={updatePartnerProfileMutation.isPending}
          >
            {updatePartnerProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerPublicImageDialog;
