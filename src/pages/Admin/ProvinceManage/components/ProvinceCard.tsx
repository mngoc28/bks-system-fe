import React from "react";
import { useTranslation } from "react-i18next";
import { Provinces } from "@/dataHelper/province.dataHelper";
import { Building2, Home, ImageOff, Sparkles } from "lucide-react";
import { resolveCloudinaryUrl } from "@/utils/imageUtils";
import { getProvinceImage } from "@/utils/fallbackImages";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";

interface ProvinceCardProps {
  province: Provinces;
  onView: (id: number) => void;
}

/**
 * Province Card — premium hero-image style
 * Text and stats float over the image with a gradient scrim.
 * Tap / click anywhere to navigate to the detail page.
 */
const ProvinceCard: React.FC<ProvinceCardProps> = ({ province, onView }) => {
  const { t } = useTranslation();
  const [imgError, setImgError] = React.useState(false);

  const cloudinarySrc = province.image
    ? (resolveCloudinaryUrl(province.image, CLOUDINARY_HEADER_IMAGE_URL) ?? undefined)
    : undefined;

  const fallbackSrc = getProvinceImage(province.name) ?? undefined;
  const coverSrc = imgError ? fallbackSrc : (cloudinarySrc ?? fallbackSrc);
  const hasCustomImage = !!province.image;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onView(province.id)}
      onKeyDown={(e) => e.key === "Enter" && onView(province.id)}
      className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* ── Background image ── */}
      {coverSrc ? (
        <img
          src={coverSrc}
          alt={province.name}
          className="absolute inset-0 size-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
          <ImageOff className="size-10 text-slate-300 dark:text-slate-600" />
        </div>
      )}

      {/* ── Gradient scrim (bottom-heavy) ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {/* ── Top-right: ID pill ── */}
      <div className="absolute right-2.5 top-2.5">
        <span className="rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          #{province.id}
        </span>
      </div>

      {/* ── Top-left: custom-image badge ── */}
      {hasCustomImage && (
        <div className="absolute left-2.5 top-2.5">
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
            <Sparkles className="size-2.5" />
            Ảnh thật
          </span>
        </div>
      )}

      {/* ── Bottom: name + stats ── */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        {/* Province name */}
        <h3 className="mb-0.5 truncate text-base font-black leading-tight text-white drop-shadow-md">
          {province.name}
        </h3>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/60">
          {province.name_en}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 backdrop-blur-sm">
            <Building2 className="size-3 text-cyan-300" />
            <span className="text-[11px] font-bold text-white">{province.ward_count}</span>
            <span className="text-[9px] font-medium uppercase tracking-tight text-white/60">
              {t("province.ward")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 backdrop-blur-sm">
            <Home className="size-3 text-emerald-300" />
            <span className="text-[11px] font-bold text-white">{province.room_count}</span>
            <span className="text-[9px] font-medium uppercase tracking-tight text-white/60">
              {t("province.room")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Hover shine overlay ── */}
      <div className="absolute inset-0 rounded-2xl opacity-0 ring-inset ring-2 ring-white/20 transition-opacity duration-300 group-hover:opacity-100" />
    </article>
  );
};

export default ProvinceCard;
