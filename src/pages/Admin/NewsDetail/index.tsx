import EmptyPage from "@/components/EmptyPage";
import { Button } from "@/components/ui/button";
import ImageLightbox from "@/components/ui/image-lightbox";
import { Label } from "@/components/ui/label";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { useNewsByIdQuery } from "@/hooks/useNewsQuery";
import { useGetUserProfileByIdQuery } from "@/hooks/useUserQuery";
import { formatDateTimeVietnam } from "@/utils/dateUtils";
import { statusNews } from "@/utils/utils";
import { ArrowLeft, EditIcon, ImageIcon, Loader2 } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { ThreeDot } from "react-loading-indicators";
import { useNavigate, useParams } from "react-router";

/**
 * News Detail Page
 * Displays the full content of a news article, including metadata and the featured image.
 */
const NewsDetail: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams();
    const idNews = id ? parseInt(id, 10) : 0;
    const { data: newsData, isLoading: newsLoading, isError: newsError } = useNewsByIdQuery(idNews);
    const getUserProfile = useGetUserProfileByIdQuery(newsData?.data?.user_id ?? 0);
    const userProfile = getUserProfile.data?.data;
    const [open, setOpen] = React.useState(false);
    const image = [{ src: CLOUDINARY_HEADER_IMAGE_URL + '/' + newsData?.data?.image_url }];
    // back to news list
    const handleBackToListNews = () => {
        navigate(ROUTERS.NEWS);
    }
    // handle to edit news
    const handleToEditNews = () => {
        navigate(ROUTERS.NEWS_EDIT + "/" + idNews);
    }

    return (
        <>
            {newsError && <EmptyPage title="news.empty_title_news" description="news.empty_description" icon={<Loader2 className="size-10 animate-spin text-blue-500" />} loading={false} />}
            {newsLoading && <>
                <div className="flex h-full items-center justify-center">
                    <ThreeDot variant="bounce" color="#064F80" size="large" />
                </div>
            </>}
            {newsData && !newsError &&
                <div className="flex flex-col pl-3 pr-3 sm:pl-6 sm:pr-6 pt-5 gap-2">
                    <div className="flex flex-row justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900 py-3 whitespace-nowrap">{t("news_detail.title")}</h2>
                        <div className="flex flex-row gap-2">
                            <Button variant="outline" onClick={handleToEditNews} className="text-[16px] bg-blue-600 hover:bg-blue-700 h-11 rounded-md text-white">
                                <EditIcon className="size-4" />
                                <span className="hidden lg:block">
                                    {t("news_detail.update")}
                                </span>
                            </Button>
                            <Button variant="outline" onClick={() => handleBackToListNews()} className="text-[16px] bg-gray-600 hover:bg-gray-700 h-11 rounded-md text-white">
                                <ArrowLeft className="size-4" />
                                <span className="hidden lg:block">
                                    {t("news_detail.back")}
                                </span>
                            </Button>
                        </div>

                    </div>
                    <div>
                        <div className="flex flex-row gap-2 items-start justify-start border border-gray-200 rounded-md p-2">
                            <Label className="text-[16px] text-black font-semibold whitespace-nowrap">{t("news_detail.news_name")} :</Label>
                            <p className="text-[14px] text-black font-normal pt-1">{newsData?.data?.title}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-start justify-start border border-gray-200 rounded-md p-2">
                            <Label className="text-[16px] text-black font-semibold whitespace-nowrap">{t("news_detail.user_name")} :</Label>
                            <p className="text-[14px] text-black font-normal pt-1">{userProfile?.name}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-start justify-start border border-gray-200 rounded-md p-2">
                            <Label className="text-[16px] text-black font-semibold whitespace-nowrap">{t("news_detail.slug")} :</Label>
                            <p className="text-[14px] text-black font-normal pt-1">{newsData?.data?.slug}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-start justify-start border border-gray-200 rounded-md p-2">
                            <Label className="text-[16px] text-black font-semibold whitespace-nowrap">{t("news_detail.summary")} :</Label>
                            <p className="text-[14px] text-black font-normal pt-1">{newsData?.data?.summary}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-start justify-start border border-gray-200 rounded-md p-2">
                            <Label className="text-[16px] text-black font-semibold whitespace-nowrap">{t("news_detail.content")} :</Label>
                            <div dangerouslySetInnerHTML={{ __html: newsData?.data?.content || "" }} />
                        </div>
                        <div className="flex flex-row gap-2 items-start justify-start border border-gray-200 rounded-md p-2">
                            <Label className="text-[16px] text-black font-semibold whitespace-nowrap">{t("news_detail.status")} :</Label>
                            <p className="text-[14px] text-black font-normal pt-1">{t(statusNews(newsData?.data?.status ?? 0).status)}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-start justify-start border border-gray-200 rounded-md p-2">
                            <Label className="text-[16px] text-black font-semibold whitespace-nowrap">{t("news_detail.created_at")} :</Label>
                            <p className="text-[14px] text-black font-normal pt-1">{formatDateTimeVietnam(newsData?.data?.created_at ?? new Date())}</p>
                        </div>
                        <div className="flex flex-row gap-2 items-start justify-start border border-gray-200 rounded-md p-2">
                            <Label className="text-[16px] text-black font-semibold whitespace-nowrap">{t("news_detail.updated_at")} :</Label>
                            <p className="text-[14px] text-black font-normal pt-1">{formatDateTimeVietnam(newsData?.data?.updated_at ?? new Date())}</p>
                        </div>
                    </div>
                    {
                        newsData?.data?.image_url !== null && newsData?.data?.image_url !== "" ? (
                            <img className="text-[14px] w-[200px] h-[200px] md:w-[400px] md:h-[400px] object-cover text-black font-normal pt-1"
                                src={CLOUDINARY_HEADER_IMAGE_URL + '/' + newsData?.data?.image_url}
                                alt={newsData?.data?.title}
                                onError={(e) => (e.currentTarget.src = "/assets/images/photo_error2.png")}
                                onClick={() => setOpen(true)}
                            />
                        ) : (
                            <div className="w-[200px] h-[200px] md:w-[400px] md:h-[400px] text-center flex flex-col items-center justify-center bg-gray-200 p-4">
                                <ImageIcon className="size-10 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500 text-sm">{t("news.no_image")}</p>
                            </div>
                        )
                    }
                    <ImageLightbox
                        open={open}
                        onClose={() => setOpen(false)}
                        index={0}
                        slides={image}
                    />
                </div>
                
                }
        </>
    );
};

export default NewsDetail;