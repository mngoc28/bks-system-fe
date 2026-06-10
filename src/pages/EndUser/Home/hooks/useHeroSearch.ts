import { FormEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ROUTERS } from "@/constant";
import { toastError } from "@/components/ui/toast";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetHomeWardsByProvinceId } from "@/hooks/useWardQuery";
import { usePropertyTypesQuery } from "@/hooks/usePropertyQuery";
import type { ProvinceTypes } from "@/dataHelper/province.dataHelper";
import type { Ward } from "@/dataHelper/ward.dataHelper";
import { normalizeStayPropertyTypeLabel } from "@/utils/stayPropertyType";

export type HeroSearchTab = "daily" | "monthly";

export function useHeroSearch(onSearchSuccess?: () => void) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [wardId, setWardId] = useState<number | null>(null);
  const [propertyTypeId, setPropertyTypeId] = useState<number | null>(null);
  const [searchTab, setSearchTab] = useState<HeroSearchTab>("daily");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);

  const { data: provincesData, isLoading: isLoadingProvinces } = useGetAllProvincesTypes();
  const { data: wardsData, isLoading: isLoadingWards } = useGetHomeWardsByProvinceId(provinceId ?? 0);
  const { data: propertyTypesData, isLoading: isLoadingPropertyTypes } = usePropertyTypesQuery();

  const provinceOptions = useMemo(() => {
    const options =
      provincesData?.data?.map((province: ProvinceTypes) => ({
        value: province.id.toString(),
        label: province.name,
      })) ?? [];

    const priorityNames = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Khánh Hòa", "Quảng Ninh"];

    return [...options].sort((a, b) => {
      const normalize = (label: string) =>
        label
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

      const aPriorityIndex = priorityNames.findIndex((name) =>
        normalize(a.label).includes(normalize(name)),
      );
      const bPriorityIndex = priorityNames.findIndex((name) =>
        normalize(b.label).includes(normalize(name)),
      );

      if (aPriorityIndex !== -1 && bPriorityIndex !== -1) {
        return aPriorityIndex - bPriorityIndex;
      }
      if (aPriorityIndex !== -1) return -1;
      if (bPriorityIndex !== -1) return 1;

      return a.label.localeCompare(b.label, "vi");
    });
  }, [provincesData]);

  const wardOptions = useMemo(
    () =>
      wardsData?.data?.map((ward: Ward) => ({
        value: ward.id.toString(),
        label: ward.name,
      })) ?? [],
    [wardsData],
  );

  const selectedProvinceName = useMemo(
    () => provincesData?.data?.find((p: ProvinceTypes) => p.id === provinceId)?.name,
    [provincesData, provinceId],
  );

  const propertyTypeOptions = useMemo(() => {
    const allOptions =
      propertyTypesData?.data?.map((type) => ({
        value: type.id.toString(),
        label: normalizeStayPropertyTypeLabel(type.name),
        slug: type.slug ?? "",
      })) ?? [];

    if (searchTab === "monthly") {
      return allOptions.filter((opt) => opt.slug === "can-ho-dich-vu-theo-phong");
    }
    return allOptions;
  }, [propertyTypesData, searchTab]);

  const resetWard = (nextProvince: number | null) => {
    setProvinceId(nextProvince);
    setWardId(null);
  };

  const performSearch = (
    selectedProvinceId: number | null,
    selectedWardId: number | null,
    selectedPropertyTypeId: number | null,
  ) => {
    if (!selectedProvinceId) {
      toastError(t("public.home.search.provinceRequired"));
      return false;
    }

    const params = new URLSearchParams({ provinceId: selectedProvinceId.toString() });
    if (selectedWardId) {
      params.set("wardId", selectedWardId.toString());
    }
    if (selectedPropertyTypeId) {
      params.set("propertyTypeId", selectedPropertyTypeId.toString());
    }
    navigate(`${ROUTERS.SEARCH_ROOMS}?${params.toString()}`);
    onSearchSuccess?.();
    return true;
  };

  const handleProvinceChange = (value: string) => {
    const nextProvince = value ? Number(value) : null;
    resetWard(nextProvince);
  };

  const handleWardChange = (value: string) => {
    if (!provinceId) {
      toastError("Vui lòng chọn Tỉnh/Thành trước khi chọn Phường/Xã");
      return;
    }
    setWardId(value ? Number(value) : null);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchTab === "daily") {
      if (!provinceId) {
        toastError(t("public.home.search.provinceRequired"));
        return;
      }
      const params = new URLSearchParams({
        provinceId: provinceId.toString(),
      });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("guests", (adults + children).toString());
      navigate(`${ROUTERS.SEARCH_ROOMS}?${params.toString()}`);
      onSearchSuccess?.();
    } else {
      performSearch(provinceId, wardId, propertyTypeId);
    }
  };

  return {
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
  };
}

export const heroSearchToday = () => format(new Date(), "yyyy-MM-dd");
