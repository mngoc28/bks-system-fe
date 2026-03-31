import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserSearchSectionProps } from "@/dataHelper/user.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";

const UserSearchSection: React.FC<UserSearchSectionProps> = ({
  open,
  searchQ,
  setSearchQ,
  searchEmail,
  setSearchEmail,
  searchPhone,
  setSearchPhone,
  filters,
  setFilters,
  onReset,
  onClose
}) => {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="mt-4 w-full rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
      <div className="space-y-3">
        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("user.filter_name")}</label>
            <Input
              value={searchQ || ""}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder={t("user.filter_name_placeholder")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("user.filter_email")}</label>
            <Input
              value={searchEmail || ""}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder={t("user.filter_email_placeholder")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("user.filter_phone")}</label>
            <Input
              value={searchPhone || ""}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder={t("user.filter_phone_placeholder")}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("user.filter_role")}</label>
            <select
              className="flex h-12 w-full rounded border border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 transition-colors"
              value={filters.role || ""}
              onChange={(e) => setFilters((s) => ({ ...s, role: e.target.value }))}
            >
              <option value="">{t("user.filter_all")}</option>
              <option value="admin">{t("common.role_admin")}</option>
              <option value="partner">{t("common.role_partner")}</option>
              <option value="user">{t("common.role_user")}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("user.filter_status")}</label>
            <select
              className="flex h-12 w-full rounded border border-slate-300 bg-white px-4 py-3 text-sm text-slate-500 transition-colors"
              value={filters.status || ""}
              onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
            >
              <option value="">{t("user.filter_all")}</option>
              <option value="0">{t("common.pending")}</option>
              <option value="1">{t("common.active")}</option>
              <option value="2">{t("common.blocked")}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-700">{t("user.filter_created_at")}</label>
            <Input type="date" value={filters.created_at_from || ""} onChange={(e) => setFilters((s) => ({ ...s, created_at_from: e.target.value }))} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onReset} type="button">
            {t("common.reset")}
          </Button>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t("common.close")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchSection;
