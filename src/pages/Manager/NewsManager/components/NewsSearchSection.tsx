import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toastError } from "@/components/ui/toast";
import { NewsSearchSectionProps } from "@/dataHelper/news.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";

const NewsSearchSection: React.FC<NewsSearchSectionProps> = ({ open, filters, setFilters, onReset, onClose }) => {
    const { t } = useTranslation();
    if (!open) return null;
    const isValidTimeRange = (nextFilters = filters) => {
        const start = nextFilters.published_at_start;
        const end = nextFilters.published_at_end;
        if (start && end && new Date(start) > new Date(end)) {
            toastError(t("news.filter_published_start_at_error"));
            return false;
        }
        return true;
    };

    const handleStartDateChange = (value: string) => {
        const nextFilters = { ...filters, published_at_start: value };
        if (!isValidTimeRange(nextFilters)) return;
        setFilters(nextFilters);
    };

    const handleEndDateChange = (value: string) => {
        const nextFilters = { ...filters, published_at_end: value };
        if (!isValidTimeRange(nextFilters)) return;
        setFilters(nextFilters);
    };
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-3">
                <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-sm text-slate-700">{t("news.filter_user_name")}</label>
                        <Input value={filters.user_name || ""} onChange={(e) => {
                            setFilters({ ...filters, user_name: e.target.value });
                        }} placeholder={t("news.filter_user_name_placeholder")} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-slate-700">{t("news.filter_title")}</label>
                        <Input value={filters.title || ""} onChange={(e) => {
                            setFilters({ ...filters, title: e.target.value });
                        }} placeholder={t("news.filter_title_placeholder")} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm text-slate-700">{t("news.filter_status")}</label>
                        <Select value={filters.status?.toString() || ""} onValueChange={(value) => setFilters({ ...filters, status: value ? Number(value) : undefined })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={t("news.filter_status_placeholder")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">{t("news.filter_status_draft")}</SelectItem>
                                <SelectItem value="1">{t("news.filter_status_published")}</SelectItem>
                                <SelectItem value="2">{t("news.filter_status_archived")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 items-end gap-3">
                        <label className="mb-1 block text-sm text-slate-700">{t("news.filter_published_start_at")}</label>
                        <Input
                            type="date"
                            value={filters.published_at_start || ""}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 items-end gap-3">
                        <label className="mb-1 block text-sm text-slate-700">{t("news.filter_published_end_at")}</label>
                        <Input
                            type="date"
                            value={filters.published_at_end || ""}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={onReset} type="button">
                            {t("common.reset")}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={onClose} type="button">
                            {t("common.close")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewsSearchSection;