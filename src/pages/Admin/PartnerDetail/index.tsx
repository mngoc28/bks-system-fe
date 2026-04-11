import EmptyPage from "@/components/EmptyPage";
import { Button } from "@/components/ui/button";
import ImageLightbox from "@/components/ui/image-lightbox";
import { ROUTERS } from "@/constant"
import { usePartnerQuery } from "@/hooks/usePartnerQuery";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { useTranslation } from "react-i18next";
import { ArrowLeftIcon, EditIcon, ImageIcon, Loader2 } from "lucide-react";
import React from "react";
import { ThreeDot } from "react-loading-indicators";
import { useNavigate, useParams } from "react-router";

/**
 * Partner Detail Page
 * Provides a comprehensive view of a partner's profile, including contact info, company details, and uploaded images.
 */
const PartnerDetail: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const partnerId = id ? parseInt(id, 10) : 0;
    const { data: partnerData, isLoading: partnerLoading, isError: partnerError } = usePartnerQuery(partnerId);
    const partner = partnerData?.data || null;
    const VITE_IMAGES_URL = import.meta.env.VITE_IMAGES_URL;
    const images = partner ? [
        partner.image_1,
        partner.image_2,
        partner.image_3
    ] : [];
    const [open, setOpen] = React.useState(false);
    const [index, setIndex] = React.useState(0);
    const imagesLightbox = images?.map((image) => ({ src: VITE_IMAGES_URL + image }));
    const handlePartners = () => {
        navigate(ROUTERS.PARTNER_MANAGEMENT)
    }

    const handleEditPartner = () => {
        navigate(`${ROUTERS.PARTNER_MANAGEMENT}/edit/${id}`)
    }

    return (
        <>
            {<div className="flex flex-col pl-3 pr-3 sm:pl-6 sm:pr-6 gap-y-10 pt-5">
                <div className="flex flex-row justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 py-3 whitespace-nowrap">{t('partner.detail_partner')}</h2>
                    <div className="flex flex-row gap-3 items-start justify-center">
                        <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 h-11 w-[80%] xl:w-full text-[14px] xl:text-[16px]" onClick={handleEditPartner}>
                            <EditIcon className="size-5" />
                            <span className="hidden lg:block">
                                {t('partner.edit_partner')}
                            </span>
                        </Button>
                        <Button variant="outline" className="bg-gray-600 text-white hover:bg-gray-700 h-11 w-[80%] xl:w-full text-[14px] xl:text-[16px]" onClick={handlePartners}>
                            <ArrowLeftIcon className="size-5" />
                            <span className="hidden lg:block">
                                {t('common.back')}
                            </span>
                        </Button>
                    </div>
                </div>
                {partnerError && <EmptyPage title="partner.empty_title_partner" description="partner.empty_description" icon={<Loader2 className="size-10 animate-spin text-blue-500" />} loading={false} />}
                {partnerLoading && <>
                    <div className="flex-items-center justify-center">
                        <ThreeDot variant="bounce" color="#064F80" size="small" />
                    </div>
                </>}
                {partner && !partnerError && <div className="flex flex-col gap-2 md:gap-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("partner.user_name")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{partner?.user_name || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("partner.province_name")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{partner?.province_name || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("partner.ward_name")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{partner?.ward_name || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("partner.address")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{partner?.address || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("partner.company_name")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{partner?.company_name || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("partner.website")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{partner?.website || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("partner.phone")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{partner?.phone || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("partner.description")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{partner?.description || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-1">
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("partner.created_at")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{safeFormatDateTime(partner?.created_at)}</div>
                        </div>
                        <div className="grid grid-cols-10 border border-gray-200 rounded-md overflow-hidden">
                            <div className="col-span-3 flex items-center px-3 bg-slate-100 border-r border-slate-200 font-medium">
                                {t("partner.updated_at")}
                            </div>
                            <div className="col-span-7 p-3 min-h-[52px]">{safeFormatDateTime(partner?.updated_at)}</div>
                        </div>
                    </div>
                </div>}
                <h3 className="text-2xl font-bold text-gray-900 py-3 whitespace-nowrap">{t('partner.image_list')}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {images.map((url, idx) => (
                        <div key={idx} className="w-full relative overflow-hidden bg-gray-100">

                            <div className="absolute top-2 left-2 w-5 h-5 bg-black opacity-80 rounded-full flex items-center justify-center z-10">
                                <div className="text-[14px] text-white text-center font-semibold whitespace-nowrap">
                                    {idx + 1}
                                </div>
                            </div>

                            {url ? (
                                <img
                                    src={VITE_IMAGES_URL + url}
                                    alt={"image-" + idx}
                                    onError={(e) => (e.currentTarget.src = "/assets/images/photo_error2.png")}
                                    onClick={() => {
                                        setIndex(idx);
                                        setOpen(true);
                                    }}
                                    className="w-[400px] h-full object-cover border rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                                />
                            ) : (
                                <div className="text-center flex flex-col items-center justify-center
                                bg-gray-200 border rounded-sm p-4 h-full w-full max-w-[400px] min-h-[200px] mx-auto">
                                    <ImageIcon className="size-10 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-500">{t("partner.no_images_yet")}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>}
            <ImageLightbox
                open={open}
                onClose={() => setOpen(false)}
                index={index}
                slides={imagesLightbox || []}
            />
        </>
    )
}

export default PartnerDetail