import { useTranslation } from "react-i18next";
import { Building2, Calendar, MapPin, Minus, Plus, Search, Users } from "lucide-react";
import SearchableSelect from "@/components/ui/searchable-select";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { useHeroSearch } from "../hooks/useHeroSearch";
import { heroSearchToday } from "../hooks/useHeroSearch";

type HeroSearchState = ReturnType<typeof useHeroSearch>;

interface HeroSearchFormProps {
  search: HeroSearchState;
  variant?: "inline" | "sheet";
  className?: string;
}

const HeroSearchForm = ({ search, variant = "inline", className }: HeroSearchFormProps) => {
  const { t } = useTranslation();
  const isSheet = variant === "sheet";

  const {
    searchTab,
    setSearchTab,
    provinceId,
    wardId,
    propertyTypeId,
    setPropertyTypeId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    adults,
    setAdults,
    children,
    setChildren,
    provinceOptions,
    wardOptions,
    propertyTypeOptions,
    selectedProvinceName,
    isLoadingProvinces,
    isLoadingWards,
    isLoadingPropertyTypes,
    handleProvinceChange,
    handleWardChange,
    handleSearchSubmit,
  } = search;

  const tabContainerClass = isSheet
    ? "flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-full border border-slate-200"
    : "flex gap-2 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl w-fit border border-white/20 relative z-30";

  const tabActiveClass = isSheet
    ? "bg-white text-slate-900 shadow-md scale-105"
    : "bg-white text-slate-900 shadow-md scale-105";

  const tabInactiveClass = isSheet
    ? "text-slate-600 hover:bg-white/60"
    : "text-white hover:bg-white/10";

  const formClass = cn(
    "relative grid gap-4 rounded-[32px] border p-4 transition-all duration-500",
    isSheet
      ? "z-0 border-slate-200 bg-white shadow-sm"
      : "z-[200] border-white/20 bg-white/10 shadow-2xl backdrop-blur-2xl hover:bg-white/15 hidden md:grid",
    searchTab === "daily"
      ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
      : "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]",
    className,
  );

  const fieldTriggerClass = isSheet
    ? "h-14 rounded-2xl border border-slate-200 bg-white px-5 text-left text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-primary/50"
    : "h-14 rounded-2xl border-none bg-white/85 px-5 text-left text-base font-semibold text-slate-900 shadow-lg backdrop-blur focus-visible:ring-2 focus-visible:ring-primary/50";

  const dropdownContentClass = cn("bg-white text-slate-900", isSheet && "z-[110]");
  const overlayLayerClass = isSheet ? "z-[110]" : undefined;

  return (
    <>
      <div className={cn(tabContainerClass, !isSheet && "hidden md:flex")}>
        <button
          type="button"
          onClick={() => setSearchTab("daily")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 sm:flex-none sm:px-5",
            searchTab === "daily" ? tabActiveClass : tabInactiveClass,
          )}
        >
          <Calendar className="size-4" />
          {t("public.home.search.tabDaily")}
        </button>
        <button
          type="button"
          onClick={() => setSearchTab("monthly")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 sm:flex-none sm:px-5",
            searchTab === "monthly" ? tabActiveClass : tabInactiveClass,
          )}
        >
          <Building2 className="size-4" />
          {t("public.home.search.tabMonthly")}
        </button>
      </div>

      <form className={formClass} onSubmit={handleSearchSubmit}>
        <SearchableSelect
          value={provinceId ? provinceId.toString() : ""}
          onValueChange={handleProvinceChange}
          options={provinceOptions}
          placeholder={t("public.home.search.provincePlaceholder")}
          searchPlaceholder={t("public.home.search.provinceSearch")}
          emptyMessage={t("public.home.search.provinceEmpty")}
          disabled={isLoadingProvinces}
          loading={isLoadingProvinces}
          icon={<MapPin className="size-5" />}
          showSearch
          triggerClassName={fieldTriggerClass}
          contentClassName={dropdownContentClass}
          />

          {searchTab === "daily" ? (
          <>
            <DatePickerField
              label="Nhận phòng"
              labelClassName="hidden"
              placeholder="Nhận phòng"
              value={startDate}
              onChange={(val) => {
                setStartDate(val);
                if (endDate && val > endDate) {
                  setEndDate("");
                }
              }}
              minDate={heroSearchToday()}
              className="space-y-0"
              triggerClassName={cn(fieldTriggerClass, !isSheet && "hover:bg-white/95")}
              popoverClassName={overlayLayerClass}
              popoverModal={isSheet}
            />

            <DatePickerField
              label="Trả phòng"
              labelClassName="hidden"
              placeholder="Trả phòng"
              value={endDate}
              onChange={setEndDate}
              minDate={startDate || heroSearchToday()}
              className="space-y-0"
              triggerClassName={cn(fieldTriggerClass, !isSheet && "hover:bg-white/95")}
              popoverClassName={overlayLayerClass}
              popoverModal={isSheet}
            />

            <Popover modal={isSheet}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn("flex h-14 w-full items-center justify-start", fieldTriggerClass, !isSheet && "hover:bg-white")}
                >
                  <Users className="mr-2 size-5 shrink-0 text-slate-500" />
                  <span className="truncate">
                    {children > 0
                      ? `${adults} ${t("public.home.search.adults").toLowerCase()}, ${children} ${t("public.home.search.children").toLowerCase()}`
                      : `${adults} ${t("public.home.search.guests")}`}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className={cn(
                  "w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl text-slate-900",
                  isSheet && "z-[110]",
                )}
                align="start"
                side="bottom"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{t("public.home.search.adults")}</span>
                      <span className="text-xs text-slate-400">{t("public.home.search.adultsLabel")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full border-slate-300"
                        disabled={adults <= 1}
                        onClick={() => setAdults(adults - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-6 text-center font-bold">{adults}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full border-slate-300"
                        disabled={adults >= 10}
                        onClick={() => setAdults(adults + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{t("public.home.search.children")}</span>
                      <span className="text-xs text-slate-400">{t("public.home.search.childrenLabel")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full border-slate-300"
                        disabled={children <= 0}
                        onClick={() => setChildren(children - 1)}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-6 text-center font-bold">{children}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-8 rounded-full border-slate-300"
                        disabled={children >= 10}
                        onClick={() => setChildren(children + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </>
        ) : (
          <>
            <SearchableSelect
              value={wardId ? wardId.toString() : ""}
              onValueChange={handleWardChange}
              options={wardOptions}
              placeholder={
                provinceId
                  ? `Chọn Phường/Xã tại ${selectedProvinceName}`
                  : t("public.home.search.provinceFirstPlaceholder")
              }
              searchPlaceholder="Tìm kiếm Phường/Xã..."
              emptyMessage={provinceId ? "Không tìm thấy Phường/Xã" : "Vui lòng chọn Tỉnh/Thành trước"}
              disabled={!provinceId || isLoadingWards}
              loading={isLoadingWards}
              icon={<MapPin className="size-5" />}
              showSearch
              triggerClassName={`${fieldTriggerClass} disabled:opacity-60`}
              contentClassName={dropdownContentClass}
            />

            <SearchableSelect
              value={propertyTypeId ? propertyTypeId.toString() : ""}
              onValueChange={(val) => setPropertyTypeId(val ? Number(val) : null)}
              options={propertyTypeOptions}
              placeholder="Loại hình"
              searchPlaceholder="Tìm loại hình..."
              emptyMessage="Không tìm thấy loại hình"
              disabled={isLoadingPropertyTypes}
              loading={isLoadingPropertyTypes}
              icon={<Search className="size-5" />}
              showSearch
              triggerClassName={fieldTriggerClass}
              contentClassName={dropdownContentClass}
            />
          </>
        )}

        <button
          type="submit"
          className="flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-primary via-sky-600 to-sky-700 px-8 text-base font-semibold text-white shadow-lg shadow-sky-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!provinceId}
        >
          <Search className="mr-2 size-5" />
          {t("public.home.search.cta")}
        </button>
      </form>
    </>
  );
};

export default HeroSearchForm;
