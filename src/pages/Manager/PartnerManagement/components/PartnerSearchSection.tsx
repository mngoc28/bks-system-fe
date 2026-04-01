import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartnerSearchSectionProps } from "@/dataHelper/partner.dataHelper";
import { t } from "i18next";
import React from "react";

const PartnerSearchSection: React.FC<PartnerSearchSectionProps> = ({
    open,
    value,
    onChange,
    onReset,
    onClose,
}) => {
    if (!open) return null;

    return (
        <div className="w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-3">
                <div className="flex flex-col items-end gap-3">
                    <div className="grid grid-cols-3 gap-3 w-full">
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm text-slate-700">{t('partner.search_user_name')}</label>
                            <Input
                                value={value.user_name || ''}
                                onChange={(e) => onChange({ ...value, user_name: e.target.value })}
                                placeholder={t('partner.search_user_name_placeholder')}
                                className="h-9"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 text-sm text-slate-700">{t('partner.search_province_name')}</label>
                            <Input
                                value={value.province_name || ''}
                                onChange={(e) => onChange({ ...value, province_name: e.target.value })}
                                placeholder={t('partner.search_province_placeholder')}
                                className="h-9"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 text-sm text-slate-700">{t('partner.search_ward_name')}</label>
                            <Input
                                value={value.ward_name || ''}
                                onChange={(e) => onChange({ ...value, ward_name: e.target.value })}
                                placeholder={t('partner.search_ward_name_placeholder')}
                                className="h-9"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 text-sm text-slate-700">{t('partner.search_phone')}</label>
                            <Input
                                value={value.phone || ''}
                                onChange={(e) => onChange({ ...value, phone: e.target.value })}
                                placeholder={t('partner.search_phone_placeholder')}
                                className="h-9"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1 text-sm text-slate-700">{t('partner.search_address')}</label>
                            <Input
                                value={value.address || ''}
                                onChange={(e) => onChange({ ...value, address: e.target.value })}
                                placeholder={t('partner.search_address_placeholder')}
                                className="h-9"
                            />
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
        </div >
    );
};

export default PartnerSearchSection;