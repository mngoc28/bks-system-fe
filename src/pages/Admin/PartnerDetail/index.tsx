import EmptyPage from "@/components/EmptyPage";
import { Button } from "@/components/ui/button";
import ImageLightbox from "@/components/ui/image-lightbox";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant"
import { usePartnerQuery } from "@/hooks/usePartnerQuery";
import { safeFormatDateTime } from "@/utils/dateUtils";
import { resolveImageUrl } from "@/utils/imageUtils";
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
    const images = partner ? [
        partner.image_1,
        partner.image_2,
        partner.image_3
    ] : [];
    const [open, setOpen] = React.useState(false);
    const [index, setIndex] = React.useState(0);
    const imagesLightbox = images?.map((image) => ({
        src: resolveImageUrl(image, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/photo_error2.png",
    }));
    const handlePartners = () => {
        navigate(ROUTERS.PARTNER_MANAGEMENT)
    }

    const handleEditPartner = () => {
        navigate(`${ROUTERS.PARTNER_MANAGEMENT}/edit/${id}`)
    }

    return (
        <>
            {<div className="flex flex-col gap-y-10 px-3 pt-5 sm:px-6">
                <div className="flex flex-row items-center justify-between">
                    <h2 className="whitespace-nowrap py-3 text-2xl font-bold text-gray-900">{t('partner.detail_partner')}</h2>
                    <div className="flex flex-row items-start justify-center gap-3">
                        <Button variant="outline" className="h-11 w-4/5 bg-blue-500 text-[14px] text-white hover:bg-blue-600 xl:w-full xl:text-[16px]" onClick={handleEditPartner}>
                            <EditIcon className="size-5" />
                            <span className="hidden lg:block">
                                {t('partner.edit_partner')}
                            </span>
                        </Button>
                        <Button variant="outline" className="h-11 w-4/5 bg-gray-600 text-[14px] text-white hover:bg-gray-700 xl:w-full xl:text-[16px]" onClick={handlePartners}>
                            <ArrowLeftIcon className="size-5" />
                            <span className="hidden lg:block">
                                {t('common.back')}
                            </span>
                        </Button>
                    </div>
                </div>
                {partnerError && <EmptyPage title="partner.empty_title_partner" description="partner.empty_description" icon={<Loader2 className="size-10 animate-spin text-blue-500" />} loading={false} />}
                {partnerLoading && <>
                    <div className="flex items-center justify-center">
                        <ThreeDot variant="bounce" color="#064F80" size="small" />
                    </div>
                </>}
                {partner && !partnerError && <div className="flex flex-col gap-2 md:gap-1">
                    <div className="grid grid-cols-1 gap-2 md:gap-1 lg:grid-cols-2">
                        <div className="grid grid-cols-10 overflow-hidden rounded-md border border-gray-200">
                            <div className="col-span-3 flex items-center border-r border-slate-200 bg-slate-100 px-3 font-medium">
                                {t("partner.user_name")}
                            </div>
                            <div className="col-span-7 min-h-[52px] p-3">{partner?.user_name || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 overflow-hidden rounded-md border border-gray-200">
                            <div className="col-span-3 flex items-center border-r border-slate-200 bg-slate-100 px-3 font-medium">
                                {t("partner.province_name")}
                            </div>
                            <div className="col-span-7 min-h-[52px] p-3">{partner?.province_name || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:gap-1 lg:grid-cols-2">
                        <div className="grid grid-cols-10 overflow-hidden rounded-md border border-gray-200">
                            <div className="col-span-3 flex items-center border-r border-slate-200 bg-slate-100 px-3 font-medium">
                                {t("partner.ward_name")}
                            </div>
                            <div className="col-span-7 min-h-[52px] p-3">{partner?.ward_name || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 overflow-hidden rounded-md border border-gray-200">
                            <div className="col-span-3 flex items-center border-r border-slate-200 bg-slate-100 px-3 font-medium">
                                {t("partner.address")}
                            </div>
                            <div className="col-span-7 min-h-[52px] p-3">{partner?.address || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:gap-1 lg:grid-cols-2">
                        <div className="grid grid-cols-10 overflow-hidden rounded-md border border-gray-200">
                            <div className="col-span-3 flex items-center border-r border-slate-200 bg-slate-100 px-3 font-medium">
                                {t("partner.company_name")}
                            </div>
                            <div className="col-span-7 min-h-[52px] p-3">{partner?.company_name || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 overflow-hidden rounded-md border border-gray-200">
                            <div className="col-span-3 flex items-center border-r border-slate-200 bg-slate-100 px-3 font-medium">
                                {t("partner.website")}
                            </div>
                            <div className="col-span-7 min-h-[52px] p-3">{partner?.website || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:gap-1 lg:grid-cols-2">
                        <div className="grid grid-cols-10 overflow-hidden rounded-md border border-gray-200">
                            <div className="col-span-3 flex items-center border-r border-slate-200 bg-slate-100 px-3 font-medium">
                                {t("partner.phone")}
                            </div>
                            <div className="col-span-7 min-h-[52px] p-3">{partner?.phone || ""}</div>
                        </div>
                        <div className="grid grid-cols-10 overflow-hidden rounded-md border border-gray-200">
                            <div className="col-span-3 flex items-center border-r border-slate-200 bg-slate-100 px-3 font-medium">
                                {t("partner.description")}
                            </div>
                            <div className="col-span-7 min-h-[52px] p-3">{partner?.description || ""}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:gap-1 lg:grid-cols-2">
                        <div className="grid grid-cols-10 overflow-hidden rounded-md border border-gray-200">
                            <div className="col-span-3 flex items-center border-r border-slate-200 bg-slate-100 px-3 font-medium">
                                {t("partner.created_at")}
                            </div>
                            <div className="col-span-7 min-h-[52px] p-3">{safeFormatDateTime(partner?.created_at)}</div>
                        </div>
                        <div className="grid grid-cols-10 overflow-hidden rounded-md border border-gray-200">
                            <div className="col-span-3 flex items-center border-r border-slate-200 bg-slate-100 px-3 font-medium">
                                {t("partner.updated_at")}
                            </div>
                            <div className="col-span-7 min-h-[52px] p-3">{safeFormatDateTime(partner?.updated_at)}</div>
                        </div>
                    </div>
                </div>}
                <h3 className="whitespace-nowrap py-3 text-2xl font-bold text-gray-900">{t('partner.image_list')}</h3>
                <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {images.map((url, idx) => (
                        <div key={idx} className="relative w-full overflow-hidden bg-gray-100">

                            <div className="absolute left-2 top-2 z-10 flex size-5 items-center justify-center rounded-full bg-black opacity-80">
                                <div className="whitespace-nowrap text-center text-[14px] font-semibold text-white">
                                    {idx + 1}
                                </div>
                            </div>

                            {url ? (
                                <img
                                    src={resolveImageUrl(url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/photo_error2.png"}
                                    alt={"image-" + idx}
                                    onError={(e) => (e.currentTarget.src = "/assets/images/photo_error2.png")}
                                    onClick={() => {
                                        setIndex(idx);
                                        setOpen(true);
                                    }}
                                    className="h-full w-[400px] cursor-pointer rounded-sm border object-cover transition-opacity hover:opacity-80"
                                />
                            ) : (
                                <div className="mx-auto flex size-full min-h-[200px] max-w-[400px]
                                flex-col items-center justify-center rounded-sm border bg-gray-200 p-4 text-center">
                                    <ImageIcon className="mx-auto mb-4 size-10 text-gray-400" />
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