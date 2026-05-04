import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FilterPortal from "@/components/common/FilterPortal";
import { PartnerSearchSectionProps } from "@/dataHelper/partner.dataHelper";
import { useTranslation } from "react-i18next";
import React from "react";
import { X, Search, RotateCcw } from "lucide-react";

/**
 * Enhanced PartnerSearchSection Component
 * Modern, clean, and interactive search interface for management.
 * Optimized for Partner (Company) searching.
 */
const PartnerSearchSection: React.FC<PartnerSearchSectionProps> = ({
    open,
    value,
    onChange,
    onReset,
    onClose,
}) => {
    const { t } = useTranslation();

    return (
        <FilterPortal open={open} onClose={onClose}>
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/50 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between border-b border-slate-50 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-indigo-500 p-1.5 text-white">
                        <Search className="size-4" />
                    </div>
                    <h3 className="text-sm font-bold tracking-tight text-slate-800">
                      {t('common.advanced_filter', { defaultValue: "Lọc nâng cao" })}
                    </h3>
                </div>
                <button 
                  onClick={onClose}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                    <X className="size-4" />
                </button>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {/* Company Name Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t('partner.company_name', { defaultValue: "Tên công ty" })}
                        </label>
                        <Input
                            value={value.company_name || ''}
                            onChange={(e) => onChange({ ...value, company_name: e.target.value })}
                            placeholder={t('partner.company_name_placeholder', { defaultValue: "Nhập tên công ty..." })}
                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Website Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t('partner.website', { defaultValue: "Website" })}
                        </label>
                        <Input
                            value={value.website || ''}
                            onChange={(e) => onChange({ ...value, website: e.target.value })}
                            placeholder={t('partner.website_placeholder', { defaultValue: "Nhập website..." })}
                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t('user.filter_status', { defaultValue: "Trạng thái" })}
                        </label>
                        <select
                            value={value.status || ''}
                            onChange={(e) => onChange({ ...value, status: e.target.value })}
                            className="flex h-10 w-full rounded-xl border border-slate-100 bg-slate-50/50 px-3 text-sm text-slate-600 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        >
                            <option value="">{t('user.filter_all', { defaultValue: "-- Tất cả --" })}</option>
                            <option value="0">{t('common.pending', { defaultValue: "Đang chờ" })}</option>
                            <option value="1">{t('common.active', { defaultValue: "Hoạt động" })}</option>
                            <option value="2">{t('common.blocked', { defaultValue: "Đã khóa" })}</option>
                        </select>
                    </div>

                    {/* Username Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t('partner.representative', { defaultValue: "Người đại diện" })}
                        </label>
                        <Input
                            value={value.user_name || ''}
                            onChange={(e) => onChange({ ...value, user_name: e.target.value })}
                            placeholder={t('partner.search_user_name_placeholder')}
                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Phone Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t('partner.search_phone')}
                        </label>
                        <Input
                            value={value.phone || ''}
                            onChange={(e) => onChange({ ...value, phone: e.target.value })}
                            placeholder={t('partner.search_phone_placeholder')}
                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Province Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t('partner.search_province_name')}
                        </label>
                        <Input
                            value={value.province_name || ''}
                            onChange={(e) => onChange({ ...value, province_name: e.target.value })}
                            placeholder={t('partner.search_province_placeholder')}
                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Ward Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t('partner.search_ward_name')}
                        </label>
                        <Input
                            value={value.ward_name || ''}
                            onChange={(e) => onChange({ ...value, ward_name: e.target.value })}
                            placeholder={t('partner.search_ward_name_placeholder')}
                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Address Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {t('partner.search_address')}
                        </label>
                        <Input
                            value={value.address || ''}
                            onChange={(e) => onChange({ ...value, address: e.target.value })}
                            placeholder={t('partner.search_address_placeholder')}
                            className="h-10 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-50 pt-6">
                    <Button 
                      variant="ghost" 
                      onClick={onReset} 
                      className="h-10 gap-2 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
                    >
                        <RotateCcw className="size-4" />
                        {t('common.reset')}
                    </Button>
                </div>
            </div>
        </div>
        </FilterPortal>
    );
};

export default PartnerSearchSection;