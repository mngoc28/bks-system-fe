import { Input } from "@/components/ui/input";
import AdvancedFilterPanel, {
  FilterField,
  FilterSelect,
  filterInputClassName,
} from "@/components/common/AdvancedFilterPanel";
import { PartnerSearchSectionProps } from "@/dataHelper/partner.dataHelper";
import { useTranslation } from "react-i18next";
import React from "react";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetWardsByProvinceId } from "@/hooks/useWardQuery";

const PartnerSearchSection: React.FC<PartnerSearchSectionProps> = ({
  open,
  value,
  onChange,
  onReset,
  onClose,
}) => {
  const { t } = useTranslation();

  // Fetch provinces and wards data for selects
  const { data: provincesData } = useGetAllProvincesTypes();
  const selectedProvince = provincesData?.data?.find((p) => p.name === value.province_name);
  const selectedProvinceId = selectedProvince?.id || 0;
  const { data: wardsData } = useGetWardsByProvinceId(selectedProvinceId);

  return (
    <AdvancedFilterPanel open={open} onClose={onClose} onReset={onReset}>
      <FilterField label={t("partner.company_name", { defaultValue: "Tên công ty" })}>
        <Input
          value={value.company_name || ""}
          onChange={(e) => onChange({ ...value, company_name: e.target.value })}
          placeholder={t("partner.company_name_placeholder", { defaultValue: "Nhập tên công ty..." })}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("partner.website", { defaultValue: "Website" })}>
        <Input
          value={value.website || ""}
          onChange={(e) => onChange({ ...value, website: e.target.value })}
          placeholder={t("partner.website_placeholder", { defaultValue: "Nhập website..." })}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("user.filter_status", { defaultValue: "Trạng thái" })}>
        <FilterSelect
          value={value.status || ""}
          onValueChange={(next) => onChange({ ...value, status: next })}
          options={[
            { value: "", label: t("user.filter_all", { defaultValue: "-- Tất cả --" }) },
            { value: "0", label: t("common.pending", { defaultValue: "Đang chờ" }) },
            { value: "1", label: t("common.active", { defaultValue: "Hoạt động" }) },
            { value: "2", label: t("common.blocked", { defaultValue: "Đã khóa" }) },
          ]}
        />
      </FilterField>

      <FilterField label={t("partner.representative", { defaultValue: "Người đại diện" })}>
        <Input
          value={value.user_name || ""}
          onChange={(e) => onChange({ ...value, user_name: e.target.value })}
          placeholder={t("partner.search_user_name_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("partner.search_phone")}>
        <Input
          value={value.phone || ""}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          placeholder={t("partner.search_phone_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>

      <FilterField label={t("partner.search_province_name")}>
        <FilterSelect
          value={value.province_name || ""}
          onValueChange={(next) =>
            onChange({
              ...value,
              province_name: next || undefined,
              ward_name: undefined,
            })
          }
          placeholder={t("partner.search_province_placeholder")}
          options={
            provincesData?.data?.map((p) => ({
              value: p.name,
              label: p.name,
            })) ?? []
          }
        />
      </FilterField>

      <FilterField label={t("partner.search_ward_name")}>
        <FilterSelect
          value={value.ward_name || ""}
          onValueChange={(next) => onChange({ ...value, ward_name: next || undefined })}
          placeholder={t("partner.search_ward_name_placeholder")}
          disabled={!selectedProvinceId}
          options={
            wardsData?.data?.map((w) => ({
              value: w.name,
              label: w.name,
            })) ?? []
          }
        />
      </FilterField>

      <FilterField label={t("partner.search_address")}>
        <Input
          value={value.address || ""}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder={t("partner.search_address_placeholder")}
          className={filterInputClassName}
        />
      </FilterField>
    </AdvancedFilterPanel>
  );
};

export default PartnerSearchSection;
