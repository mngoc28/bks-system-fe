import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterPortal from "@/components/common/FilterPortal";
import { UserSearchSectionProps } from "@/dataHelper/user.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";
import { Search, X, RotateCcw } from "lucide-react";

/**
 * User Search Section
 * An advanced filtering dashboard for the user management page, enabling targeted searches by name, email, phone, role, and account status.
 */
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
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <FilterPortal open={open} onClose={onClose}>
    <div className="animate-in fade-in slide-in-from-top-4 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-500 p-1.5 text-white">
            <Search className="size-4" />
          </div>
          <h3 className="text-sm font-bold tracking-tight text-slate-800">
            {t("common.advanced_filter", { defaultValue: "Bộ lọc nâng cao" })}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Body */}
      <div className="p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {/* Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("user.filter_name")}
            </label>
            <Input
              value={searchQ || ""}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder={t("user.filter_name_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("user.filter_email")}
            </label>
            <Input
              value={searchEmail || ""}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder={t("user.filter_email_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("user.filter_phone")}
            </label>
            <Input
              value={searchPhone || ""}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder={t("user.filter_phone_placeholder")}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("user.filter_role")}
            </label>
            <select
              className="flex h-10 w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-sm text-slate-600 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={filters.role || ""}
              onChange={(e) => setFilters((s) => ({ ...s, role: e.target.value }))}
            >
              <option value="">{t("user.filter_all")}</option>
              <option value="admin">{t("common.role_admin")}</option>
              <option value="partner">{t("common.role_partner")}</option>
              <option value="user">{t("common.role_user")}</option>
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("user.filter_status")}
            </label>
            <select
              className="flex h-10 w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-sm text-slate-600 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
              value={filters.status || ""}
              onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
            >
              <option value="">{t("user.filter_all")}</option>
              <option value="0">{t("common.pending")}</option>
              <option value="1">{t("common.active")}</option>
              <option value="2">{t("common.blocked")}</option>
            </select>
          </div>

          {/* Created At */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t("user.filter_created_at")}
            </label>
            <Input
              type="date"
              value={filters.created_at_from || ""}
              onChange={(e) => setFilters((s) => ({ ...s, created_at_from: e.target.value }))}
              className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-50 pt-6">
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-10 gap-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
          >
            <RotateCcw className="size-4" />
            {t("common.reset")}
          </Button>
        </div>
      </div>
    </div>
    </FilterPortal>
  );
};

export default UserSearchSection;
