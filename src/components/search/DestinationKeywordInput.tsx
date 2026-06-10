import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicTouristSpotsQuery } from "@/hooks/EU/useTouristSpotQuery";
import { SUGGESTED_ROOM_SPOT_PRIORITY } from "@/constant";
import type { TouristSpotSuggestion } from "@/dataHelper/EU/touristSpot.dataHelper";

interface DestinationKeywordInputProps {
  value: string;
  onChange: (value: string) => void;
  selectedSpotSlug?: string;
  selectedSpotLabel?: string;
  onSelectSpot: (spot: TouristSpotSuggestion) => void;
  onClearSpot: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  provinceId?: number | null;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function sortByPriority(spots: TouristSpotSuggestion[]): TouristSpotSuggestion[] {
  const priorityMap = new Map(SUGGESTED_ROOM_SPOT_PRIORITY.map((name, index) => [normalizeText(name), index]));

  return [...spots].sort((a, b) => {
    const aIndex = priorityMap.get(normalizeText(a.name)) ?? Number.POSITIVE_INFINITY;
    const bIndex = priorityMap.get(normalizeText(b.name)) ?? Number.POSITIVE_INFINITY;
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    return a.name.localeCompare(b.name, "vi");
  });
}

const DestinationKeywordInput = ({
  value,
  onChange,
  selectedSpotSlug = "",
  selectedSpotLabel = "",
  onSelectSpot,
  onClearSpot,
  placeholder = "Điểm đến hoặc từ khóa...",
  className,
  inputClassName,
  provinceId = null,
}: DestinationKeywordInputProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const deferredKeyword = value.trim();

  const { data: featuredSpots = [], isLoading: isLoadingFeatured } = usePublicTouristSpotsQuery(
    {
      featured_only: provinceId ? undefined : true,
      province_id: provinceId ?? undefined,
      limit: 30,
    },
    { enabled: open },
  );

  const { data: searchedSpots = [], isLoading: isLoadingSearch } = usePublicTouristSpotsQuery(
    {
      keyword: deferredKeyword,
      province_id: provinceId ?? undefined,
      limit: 15,
    },
    { enabled: open && deferredKeyword.length >= 1 },
  );

  const suggestions = useMemo(() => {
    const source = deferredKeyword.length >= 1 ? searchedSpots : featuredSpots;
    const normalizedQuery = normalizeText(deferredKeyword);

    const filtered = normalizedQuery.length
      ? source.filter((spot) => {
          const haystack = normalizeText(`${spot.name} ${spot.region_label ?? ""} ${spot.slug}`);
          return haystack.includes(normalizedQuery);
        })
      : (provinceId
          ? source
          : source.filter((spot) => {
              const priorityNames = SUGGESTED_ROOM_SPOT_PRIORITY.map(normalizeText);
              return priorityNames.includes(normalizeText(spot.name));
            })
        );

    const ordered = sortByPriority(filtered.length ? filtered : source);

    return ordered.slice(0, 8);
  }, [deferredKeyword, featuredSpots, searchedSpots, provinceId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = selectedSpotSlug && !value ? selectedSpotLabel : value;
  const isLoading = isLoadingFeatured || isLoadingSearch;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <input
        value={displayValue}
        onChange={(event) => {
          if (selectedSpotSlug) {
            onClearSpot();
          }
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={cn(
          "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-sky-400 placeholder:truncate",
          selectedSpotSlug && !value ? "text-sky-800" : "",
          inputClassName,
        )}
        title={placeholder}
        autoComplete="off"
      />

      {open && (suggestions.length > 0 || isLoading) ? (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[600] min-w-full w-max max-w-[min(calc(100vw-2rem),20rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="border-b border-slate-100 bg-slate-50 px-3 py-2">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <Sparkles className="size-3 text-emerald-600" />
              {deferredKeyword
                ? "Gợi ý điểm du lịch"
                : (provinceId ? "Điểm du lịch tại khu vực" : "Điểm đến phổ biến")}
            </p>
          </div>

          {isLoading && suggestions.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">Đang tải gợi ý...</p>
          ) : (
            <ul className="custom-scrollbar max-h-56 overflow-y-auto overscroll-contain py-1 pr-0.5">
              {suggestions.map((spot) => (
                <li key={spot.id}>
                  <button
                    type="button"
                    className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition hover:bg-sky-50 focus-visible:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onSelectSpot(spot);
                      onChange("");
                      setOpen(false);
                    }}
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-sky-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900">{spot.name}</span>
                      {spot.region_label ? (
                        <span className="block text-xs text-slate-500">{spot.region_label}</span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default DestinationKeywordInput;
