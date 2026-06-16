import { Input } from "@/components/ui/input";
import AdvancedFilterPanel, {
  FilterField,
  FilterSelect,
  filterInputClassName,
  filterSelectTriggerClassName,
} from "@/components/common/AdvancedFilterPanel";
import { SEARCH_DEBOUNCE_DELAY_MS } from "@/constant";
import { RoomSearchSectionProps } from "@/dataHelper/room.dataHelper";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SearchableSelect from "@/components/ui/searchable-select";
import { useAllPropertiesQuery } from "@/hooks/usePropertyQuery";
import { useListPartnerQuery } from "@/hooks/usePartnerQuery";
import { useGetUserProfileQuery } from "@/hooks/useUserQuery";

const RoomSearchSection: React.FC<RoomSearchSectionProps> = ({ open, filters, setFilters, onReset, onClose }) => {
  const { t } = useTranslation();
  const [localTitle, setLocalTitle] = useState(filters.title || "");
  const [localRoomNumber, setLocalRoomNumber] = useState(filters.room_number || "");

  // Fetch user profile, partners list, and properties list
  const { data: userProfile } = useGetUserProfileQuery();
  const isAdmin = userProfile?.data?.role === "admin";
  const { data: partnersResponse } = useListPartnerQuery({ per_page: 200 }, { enabled: open && isAdmin });
  const partnersPayload: any = partnersResponse;
  const partners: any[] = Array.isArray(partnersPayload?.data?.data)
    ? partnersPayload.data.data
    : Array.isArray(partnersPayload?.data)
    ? partnersPayload.data
    : [];
  
  const { data: allProperties } = useAllPropertiesQuery();
  const properties = allProperties ?? [];

  useEffect(() => {
    const timer = setTimeout(() => setFilters((s) => ({ ...s, title: localTitle })), SEARCH_DEBOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [localTitle, setFilters]);

  useEffect(() => {
    const timer = setTimeout(() => setFilters((s) => ({ ...s, room_number: localRoomNumber })), SEARCH_DEBOUNCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [localRoomNumber, setFilters]);

  useEffect(() => setLocalTitle(filters.title || ""), [filters.title]);
  useEffect(() => setLocalRoomNumber(filters.room_number || ""), [filters.room_number]);

  const selectedPartnerUserId = partners.find((pt: any) => pt.id === filters.partner_id)?.user_id;
  const filteredProperties = selectedPartnerUserId
    ? properties.filter((p: any) => p.user_id === selectedPartnerUserId)
    : properties;

  return (
    <AdvancedFilterPanel open={open} onClose={onClose} onReset={onReset}>
      <FilterField label={t("rooms.room_title")}>
        <Input
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder={t("rooms.search_title_placeholder")}
          type="search"
          className={filterInputClassName}
        />
      </FilterField>

      {isAdmin && (
        <FilterField label={t("rooms.filter_partner", { defaultValue: "Đối tác liên kết" })}>
          <SearchableSelect
            value={filters.partner_id ? String(filters.partner_id) : ""}
            onValueChange={(next) => {
              const partnerId = next ? Number(next) : undefined;
              const selectedPartnerUserId = partners.find((pt: any) => pt.id === partnerId)?.user_id;
              setFilters((s) => {
                const nextFilters = { ...s, partner_id: partnerId };
                if (s.property_id) {
                  const prop = properties.find((p: any) => p.id === s.property_id);
                  if (prop && selectedPartnerUserId && prop.user_id !== selectedPartnerUserId) {
                    nextFilters.property_id = undefined;
                  }
                }
                return nextFilters;
              });
            }}
            placeholder={t("rooms.filter_partner_placeholder", { defaultValue: "Chọn đối tác..." }) as string}
            searchPlaceholder={t("common.search", { defaultValue: "Tìm kiếm..." }) as string}
            emptyMessage={t("common.no_data", { defaultValue: "Không có dữ liệu" }) as string}
            options={partners.map((p: any) => ({
              value: String(p.id),
              label: `${p.company_name} (${p.user_name})`,
            }))}
            triggerClassName={filterSelectTriggerClassName}
          />
        </FilterField>
      )}

      <FilterField label={t("rooms.filter_property", { defaultValue: "Dự án / Tài sản" })}>
        <SearchableSelect
          value={filters.property_id ? String(filters.property_id) : ""}
          onValueChange={(next) =>
            setFilters((s) => ({
              ...s,
              property_id: next ? Number(next) : undefined,
              ...(!s.partner_id && next && (() => {
                const prop = properties.find((p: any) => p.id === Number(next));
                const matchedPartner = partners.find((pt: any) => pt.user_id === prop?.user_id);
                return matchedPartner ? { partner_id: matchedPartner.id } : {};
              })())
            }))
          }
          placeholder={t("rooms.filter_property_placeholder", { defaultValue: "Chọn dự án..." }) as string}
          searchPlaceholder={t("common.search", { defaultValue: "Tìm kiếm..." }) as string}
          emptyMessage={t("common.no_data", { defaultValue: "Không có dữ liệu" }) as string}
          options={filteredProperties.map((p: any) => ({
            value: String(p.id),
            label: p.name,
          }))}
          triggerClassName={filterSelectTriggerClassName}
        />
      </FilterField>

      <FilterField label={t("rooms.room_number")}>
        <Input
          value={localRoomNumber}
          onChange={(e) => setLocalRoomNumber(e.target.value)}
          placeholder={t("rooms.search_room_number_placeholder")}
          type="search"
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("rooms.room_type")}>
        <FilterSelect
          value={filters.room_type ? String(filters.room_type) : ""}
          onValueChange={(next) =>
            setFilters((s) => ({ ...s, room_type: next ? Number(next) : undefined }))
          }
          options={[
            { value: "", label: t("common.all") },
            { value: "1", label: t("rooms.room_type_single") },
            { value: "2", label: t("rooms.room_type_double") },
            { value: "3", label: t("rooms.room_type_mini_apartment") },
          ]}
        />
      </FilterField>

      <FilterField label={t("rooms.status")}>
        <FilterSelect
          value={filters.status === undefined ? "" : String(filters.status)}
          onValueChange={(next) =>
            setFilters((s) => ({ ...s, status: next === "" ? undefined : next }))
          }
          options={[
            { value: "", label: t("common.all") },
            { value: "1", label: t("rooms.status_public") },
            { value: "0", label: t("rooms.status_private") },
          ]}
        />
      </FilterField>
    </AdvancedFilterPanel>
  );
};

export default RoomSearchSection;
