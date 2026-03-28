import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServiceSearchSectionProps } from "@/dataHelper/service.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";

const ServiceSearchSection: React.FC<ServiceSearchSectionProps> = ({
    open,
    value,
    onChange,
    onReset,
    onClose,
}) => {
    const { t } = useTranslation();

    if (!open) return null;

    return (
        <div className="mt-4 w-full rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
            <div className="space-y-3">
                <div className="flex flex-col items-end gap-3">
                    <div className="flex w-full items-end gap-3">
                        <div className="flex basis-1/3 flex-col">
                            <label className="mb-1 block text-sm text-slate-700">{t('serviceManagement.search_name')}</label>
                            <Input
                                value={value.name || ''}
                                onChange={(e) => onChange({ ...value, name: e.target.value })}
                                placeholder={t('serviceManagement.search_name_placeholder')}
                                className="h-9"
                            />
                        </div>
                        <div className="flex flex-col basis-2/3">
                            <label className="mb-1 block text-sm text-slate-700">{t('serviceManagement.price_range')}</label>
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    value={value.priceMin || ''}
                                    onChange={(e) => onChange({ ...value, priceMin: e.target.value ? e.target.value : "" })}
                                    placeholder={t('serviceManagement.min_price_placeholder')}
                                    className="h-9"
                                />
                                <Input
                                    type="text"
                                    value={value.priceMax || ''}
                                    onChange={(e) => onChange({ ...value, priceMax: e.target.value ? e.target.value : "" })}
                                    placeholder={t('serviceManagement.price_max_placeholder')}
                                    className="h-9"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={onReset} type="button" className="h-9">
                            {t('common.reset')}
                        </Button>
                        <Button variant="secondary" size="sm" onClick={onClose} className="h-9">
                            {t('common.close')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceSearchSection;