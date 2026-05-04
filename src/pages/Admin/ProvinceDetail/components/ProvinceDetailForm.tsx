import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProvinceDetailFormProps } from "@/dataHelper/province.dataHelper";
import React from "react";
import { useTranslation } from "react-i18next";
import { Hash, Home, MapPinned } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

/**
 * Province Detail Form
 * Renders the full details of a province, including associated wards and rooms, in a structured layout.
 */
const ProvinceDetailForm: React.FC<ProvinceDetailFormProps> = ({
    onCancel,
    isLoading,
    province
}) => {
    const { t } = useTranslation();
    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-3 sm:p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{t("province.detail_province")}</h2>
                </div>
                <Card>
                    <CardContent className="flex min-h-[200px] items-center justify-center p-6">
                        <Spinner size="md" showText text={t("common.loading_data")} />
                    </CardContent>
                </Card>
            </div>
        );
    }
    if (!province) {
        return (
            <div className="flex flex-col gap-6 p-3 sm:p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{t("province.detail_province")}</h2>
                </div>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-center text-slate-500">{t("province.province_not_found")}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-3 sm:p-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t("province.detail_province")}</h2>
                    <Button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="h-[40px] rounded-md bg-gray-600 px-3 py-1 text-[15px] text-white hover:bg-gray-500"
                    >
                        {t("province.back")}
                    </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200">
                <div className="grid grid-cols-10">
                    <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                        {t("province.id")}
                    </div>
                    <div className="col-span-8 border-b border-slate-200 p-3">
                        {province.id}
                    </div>
                    <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                        {t("province.name")}
                    </div>
                    <div className="col-span-8 border-b border-slate-200 p-3">
                        {province.name}
                    </div>
                    <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                        {t("province.name_en")}
                    </div>
                    <div className="col-span-8 border-b border-slate-200 p-3">
                        {province.name_en || "-"}
                    </div>
                    <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                        {t("province.ward")}
                    </div>
                    <div className="col-span-8 border-b border-slate-200 p-3">
                        {province.ward_count || 0}
                    </div>
                    <div className="col-span-2 border-b border-slate-200 bg-slate-50 p-3 font-medium">
                        {t("province.room")}
                    </div>
                    <div className="col-span-8 border-b border-slate-200 p-3">
                        {province.room_count || 0}
                    </div>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPinned className="size-5" />
                        {t("province.ward_list")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {province.wards && province.wards.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {province.wards.map((ward) => (
                                <div
                                    key={ward.id}
                                    className="rounded-lg border border-slate-200 p-3  transition-colors"
                                >
                                    <div className="mb-1 flex items-center gap-2 text-slate-500">
                                        <Hash className="size-4" />
                                        <span className="text-sm font-medium">{ward.id}</span>
                                    </div>
                                    <p className="font-semibold text-slate-800">{ward.name}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <MapPinned className="mx-auto mb-2 size-12 text-slate-300" />
                            <p className="text-sm text-slate-400">{t("province.no_wards")}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Home className="size-5" />
                        {t("province.room_list")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {province.rooms && province.rooms.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {province.rooms.map((room) => (
                                <Card key={room.id} className="border-slate-200">
                                    <CardContent className="pt-4">
                                        <div className="mb-2 flex items-start justify-between">
                                            <div>
                                                <p className="text-lg font-bold">{room.room_number}</p>
                                                <p className="text-sm text-slate-500">{room.title}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <Home className="mx-auto mb-2 size-12 text-slate-300" />
                            <p className="text-sm text-slate-400">{t("province.no_rooms")}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ProvinceDetailForm;