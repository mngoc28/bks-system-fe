import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CLOUDINARY_HEADER_IMAGE_URL, PROVINCES, ROUTERS } from "@/constant";
import { Room } from "@/dataHelper/EU/room.dataHelper";
import { usePartnerDetailQuery } from "@/hooks/EU/usePartnerQuery";
import { useRoomsQuery } from "@/hooks/EU/useRoomQuery";
import { resolveImageUrl } from "@/utils/imageUtils";
import { formatCurrencyInput } from "@/utils/utils";
import { ArrowRight, ChevronLeft, ChevronRight, Globe, Mail, MapPin, Phone, Users } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { PublicHeader, PublicFooter } from "@/components/layout/Public";
import Breadcrumb from "@/components/common/Breadcrumb";

// Partner Detail Page
const PartnerDetail = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { partner_id } = useParams<{ partner_id: string }>();
    const partnerId = partner_id ? Number(partner_id) : -1;

    // call api to get partner detail
    const { data: partnerData, isLoading, error } = usePartnerDetailQuery(partnerId);

    // call api to get rooms of partner
    const { data: roomsData } = useRoomsQuery({ partner_id: partnerId }, { enabled: !!partnerId });

    const partnerImages = [partnerData?.image_1, partnerData?.image_2, partnerData?.image_3].filter(Boolean);

    const provinceNameEn = PROVINCES.find(p => p.id === Number(partnerData?.province_id))?.name_en || "";

    // room data
    const roomsArray: Array<{ province: string; rooms: any[] }> = roomsData ?
        (Object.entries(
            roomsData.reduce((acc: Record<string, any[]>, room: Room) => {
                const provinceName = room.province_name || "";
                if (!acc[provinceName]) acc[provinceName] = [];
                acc[provinceName].push({
                    id: room.id,
                    name: room.title,
                    description: room.description,
                    price: room.cheapest_daily_price,
                    currency: "VNĐ",
                    capacity: room.people,
                    amenities: room.amenities ? room.amenities.split(',').map((a: string) => a.trim()) : [],
                    image: room.room_image || "",
                });
                return acc;
            }, {} as Record<string, any[]>)
        ) as [string, any[]][]).map(([province, rooms]) => ({ province, rooms }))
        : [];

    // state for carousel
    const [currentSlides, setCurrentSlides] = useState<Record<number, number>>({});

    // ref for swiper
    const splideRefs = useRef<Record<number, any>>({});

    // loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">{t("partnerDetail.loading")}</p>
                </div>
            </div>
        );
    }

    // error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-lg text-red-600">{t("common.loading_error")}: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
            <PublicHeader/>

            {/* Partner Header */}
            <div className="relative overflow-hidden bg-slate-950 text-white min-h-56 flex items-start pt-12">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900/80" />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pb-12">
                    <div className="text-center">
                        {/* Company Name */}
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-4 animate-fade-in">
                            {partnerData?.company_name ?? ""}
                        </h1>

                        {/* Subtitle with location */}
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <MapPin className="h-6 w-6 text-sky-300" />
                            <p className="text-xl sm:text-2xl text-slate-200 font-light">
                                {partnerData?.address}, {partnerData?.province_name}
                            </p>
                        </div>

                        {/* Decorative line */}
                        <div className="w-24 h-1 bg-sky-300/70 mx-auto rounded-full mb-8"></div>

                        {/* Short description if available */}
                        {partnerData?.description && (
                            <p className="text-lg sm:text-xl text-slate-100 max-w-3xl mx-auto leading-relaxed">
                                {partnerData.description.length > 150 ? `${partnerData.description.substring(0, 150)}...` : partnerData.description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-slate-50 border-b border-slate-200">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <Breadcrumb
                        items={[
                            { label: t("breadcrumb.home"), href: "/" },
                            { label: partnerData?.province_name || "", href: `/${provinceNameEn}/partners` },
                            { label: t("endUserPartners.breadcrumb.list"), href: `/${provinceNameEn}/partners` },
                            { label: partnerData?.company_name || "" }
                        ]}
                        className="text-sm"
                    />
                </div>
            </div>

            {/* Partner Gallery Section */}
            {partnerImages.length > 0 && (
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{t("partnerDetail.partnerGallery")}</h2>
                    <div className={`grid gap-4 ${partnerImages.length === 1 ? 'grid-cols-1 justify-center' : partnerImages.length === 2 ? 'grid-cols-2 justify-center' : 'grid-cols-1 md:grid-cols-3'}`}>
                        {partnerImages.map((img, index) => (
                            <div key={index} className="aspect-video rounded-lg overflow-hidden shadow-lg">
                                <img
                                    src={resolveImageUrl(img, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/photo_error2.png"}
                                    alt={`Partner image ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "/assets/images/photo_error2.png";
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Partner Information Section */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Card className="shadow-sm border-slate-200/80">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-gray-900">{t("partnerDetail.partnerInfo")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">{t("partnerDetail.description")}</h3>
                                <p className="text-gray-600 leading-relaxed">{partnerData?.description}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-4 text-center">{t("partnerDetail.contactInfo")}</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-sky-600" />
                                        <span className="text-gray-700">{partnerData?.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="h-5 w-5 text-sky-600" />
                                        <span className="text-gray-700">{partnerData?.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="h-5 w-5 text-sky-600" />
                                        <span className="text-gray-700">{partnerData?.user_email}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Globe className="h-5 w-5 text-sky-600" />
                                        <a href={partnerData?.website} className="text-sky-600 hover:underline" target="_blank" rel="noopener noreferrer">
                                            {partnerData?.website}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rooms Section */}
            {roomsArray.length > 0 && (
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("partnerDetail.availableRooms")}</h2>

                    {/* Provinces with Rooms */}
                    {roomsArray.map((provinceData, provinceIndex) => (
                        <div key={provinceIndex} className="mb-12">
                            {/* Province Title */}
                            <div className="text-center mb-6">
                                <h3 className="text-2xl font-semibold text-sky-600 mb-2">
                                    {provinceData.province}
                                </h3>
                                <div className="w-24 h-1 bg-sky-600 mx-auto rounded-full"></div>
                            </div>

                            {/* Carousel Container */}
                            <div className="relative">
                                {/* Navigation Arrows */}
                                <button
                                    disabled={provinceData.rooms.length < 3}
                                    onClick={() => {
                                        if (provinceData.rooms.length >= 3) {
                                            splideRefs.current[provinceIndex]?.slideTo(splideRefs.current[provinceIndex].activeIndex - 3)
                                        }
                                    }}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                                    style={{ transform: 'translateY(-50%) translateX(-50%)' }}
                                >
                                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                                </button>

                                <button
                                    disabled={provinceData.rooms.length < 3}
                                    onClick={() => {
                                        if (provinceData.rooms.length >= 3) {
                                            splideRefs.current[provinceIndex]?.slideTo(splideRefs.current[provinceIndex].activeIndex + 3);
                                        }
                                    }}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                                    style={{ transform: 'translateY(-50%) translateX(50%)' }}
                                >
                                    <ChevronRight className="h-6 w-6 text-gray-700" />
                                </button>
                                {/* Rooms Grid */}
                                <Swiper
                                    onSwiper={(swiper) => (splideRefs.current[provinceIndex] = swiper)}
                                    slidesPerView={3}
                                    spaceBetween={16}
                                    navigation={false}
                                    pagination={false}
                                    grabCursor={true}
                                    // centeredSlides={true}
                                    centerInsufficientSlides={true}
                                    breakpoints={{
                                        640: { slidesPerView: 2 },
                                        1024: { slidesPerView: 3 },
                                    }}
                                    onSlideChange={(swiper) => {
                                        setCurrentSlides(prev => ({ ...prev, [provinceIndex]: swiper.activeIndex }));
                                    }}
                                >
                                    {provinceData.rooms.map((room: any) => (
                                        <SwiperSlide key={room.id}>
                                            <Card
                                                key={room.id}
                                                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col"
                                            >
                                                <div className="relative">

                                                    <img
                                                        src={room.image.startsWith('http') ? room.image : `${CLOUDINARY_HEADER_IMAGE_URL}/${room.image}`}
                                                        alt={room.name}
                                                        className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
                                                    />
                                                </div>
                                                <CardHeader className="pb-3 flex-shrink-0">
                                                    <CardTitle className="flex items-center justify-between">
                                                        <span className="text-lg font-semibold truncate pr-2">{room.name}</span>
                                                        <span className="text-l font-bold text-red-600 flex-shrink-0">
                                                            {formatCurrencyInput(room.price.toString())} {room.currency}
                                                        </span>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1 flex flex-col justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-gray-600 mb-4 line-clamp-2 min-h-[3rem]">{room.description}</p>
                                                        <div className="flex items-center gap-4 mb-4">
                                                            <div className="flex items-center gap-1">
                                                                <Users className="h-4 w-4 text-sky-700" />
                                                                <span className="text-sm text-sky-700">{t("partnerDetail.maxGuests")} {room.capacity} {t("partnerDetail.guests")}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mb-4 min-h-[2rem]">
                                                            {room.amenities.slice(0, 4).map((amenity: string, index: number) => (
                                                                <Badge key={index} variant="outline" className="text-xs">
                                                                    {amenity}
                                                                </Badge>
                                                            ))}
                                                            {room.amenities.length > 4 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    +{room.amenities.length - 4}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        className="w-full mt-auto bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 transition-all duration-200 hover:opacity-90"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`${ROUTERS.BOOKING}/${room.id}`);
                                                        }}
                                                    >
                                                        {t("partnerDetail.bookNow")}
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                {/* Slide Indicators */}
                                <div className="flex justify-center mt-6 gap-2">
                                    {provinceData.rooms.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => splideRefs.current[provinceIndex]?.slideTo(index)}
                                            className={`w-3 h-3 rounded-full transition-all duration-200 hover:scale-125 ${index === (currentSlides[provinceIndex] || 0)
                                                ? 'bg-sky-600 scale-110'
                                                : 'bg-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* View All Button */}
                            <div className="flex justify-center mt-8">
                                <Button
                                    variant="outline"
                                    disabled={provinceData.rooms.length < 3}
                                    className={`group hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 ${provinceData.rooms.length < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => {
                                        // TODO: Navigate to all rooms of this province
                                    }}
                                >
                                    <span className="mr-2">{t("common.viewAll")}</span>
                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <PublicFooter/>
        </div>
    );
};

export default PartnerDetail;
