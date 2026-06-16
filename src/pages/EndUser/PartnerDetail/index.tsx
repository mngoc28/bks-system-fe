import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewsModal } from "@/components/rooms/ReviewsModal";
import { CLOUDINARY_HEADER_IMAGE_URL, PROVINCES, ROUTERS } from "@/constant";
import { Room } from "@/dataHelper/EU/room.dataHelper";
import { usePartnerDetailQuery } from "@/hooks/EU/usePartnerQuery";
import { useRoomsQuery } from "@/hooks/EU/useRoomQuery";
import { resolveImageUrl } from "@/utils/imageUtils";
import { formatCurrencyInput, formatProvinceName } from "@/utils/utils";
import { ArrowRight, ChevronLeft, ChevronRight, Globe, Mail, MapPin, Phone, Users, Star, Heart, Share2, Building2, Home } from "lucide-react";
import { usePartnerReviewsQuery } from "@/hooks/useReviewQuery";
import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { PublicHeader, PublicFooter } from "@/components/layout/Public";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Spinner } from "@/components/ui/spinner";
import { toastSuccess, toastError } from "@/components/ui/toast";
import { getRoomFallbackImage, getPartnerFallbackImage } from "@/utils/fallbackImages";

// Partner Detail Page
const PartnerDetail = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [wishlist, setWishlist] = useState<number[]>(() => {
        try {
            const stored = localStorage.getItem("bks_wishlist");
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("bks_wishlist", JSON.stringify(wishlist));
    }, [wishlist]);

    const handleToggleWishlist = (e: React.MouseEvent, roomId: number) => {
        e.preventDefault();
        e.stopPropagation();
        setWishlist((prev) => {
            const isAlreadyWishlisted = prev.includes(roomId);
            if (isAlreadyWishlisted) {
                toastSuccess("Đã xóa khỏi danh sách yêu thích");
                return prev.filter((id) => id !== roomId);
            } else {
                toastSuccess("Đã thêm vào danh sách yêu thích");
                return [...prev, roomId];
            }
        });
    };

    const handleShareRoom = (e: React.MouseEvent, roomId: number) => {
        e.preventDefault();
        e.stopPropagation();
        const url = window.location.origin + ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", roomId.toString());
        navigator.clipboard.writeText(url)
            .then(() => {
                toastSuccess("Đã sao chép liên kết phòng!");
            })
            .catch(() => {
                const textArea = document.createElement("textarea");
                textArea.value = url;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand("copy");
                    toastSuccess("Đã sao chép liên kết phòng!");
                } catch {
                    toastError("Không thể sao chép liên kết!");
                }
                document.body.removeChild(textArea);
            });
    };

    const { partner_id } = useParams<{ partner_id: string }>();
    const partnerId = partner_id ? Number(partner_id) : -1;

    // call api to get partner detail
    const { data: partnerData, isLoading, error } = usePartnerDetailQuery(partnerId);

    // call api to get rooms of partner
    const { data: roomsData } = useRoomsQuery({ partner_id: partnerId, with_details: true }, { enabled: !!partnerId });

    // call api to get partner reviews
    const { data: reviewsData, isLoading: isLoadingReviews } = usePartnerReviewsQuery(partnerId, { enabled: !!partnerId });

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
                    reviews_count: (room as any).reviews_count ?? 0,
                    reviews_avg_rating: (room as any).reviews_avg_rating ?? 0,
                    property_type_name: room.property_type_name,
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
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
                <Spinner 
                    size="lg" 
                    showText 
                    text={t("partnerDetail.loading")}
                    className="text-slate-600 font-bold"
                />
            </div>
        );
    }

    // error state
    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
                <Spinner 
                    size="lg" 
                    spinnerClassName="border-y-rose-600" 
                    showText 
                    text={`${t("common.loading_error")}: ${error.message}`}
                    className="text-rose-600 font-bold"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
            <PublicHeader/>

            {/* Partner Hero - 2-column premium layout */}
            <div className="relative overflow-hidden bg-slate-950 pt-10 pb-10 text-white">
                {/* Background scenic image */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=75"
                    alt="hero background"
                    className="h-full w-full object-cover"
                    style={{ opacity: 0.30 }}
                  />
                </div>
                {/* Multi-layer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-950/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />
                {/* Ambient glow effects */}
                <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl" />
                <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
                {/* Dot pattern */}
                <div
                    className="absolute inset-0 opacity-[0.07]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(148,163,184,1) 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                    }}
                />

                <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5">

                        {/* LEFT — 3/5 */}
                        <div className="lg:col-span-3">
                            {/* Badge */}
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-sm font-semibold text-sky-300">
                                <Building2 className="size-4" />
                                Đối tác BKS System
                            </div>

                            {/* Company Name */}
                            <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
                                {partnerData?.company_name ?? ""}
                            </h1>

                            {/* Location */}
                            <div className="mb-5 flex items-center gap-2 text-slate-300">
                                <MapPin className="size-5 shrink-0 text-sky-400" />
                                <span className="text-base sm:text-lg">
                                    {partnerData?.address && `${partnerData.address}, `}{formatProvinceName(partnerData?.province_name)}
                                </span>
                            </div>

                            {/* Description */}
                            {partnerData?.description && (
                                <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                                    {partnerData.description.length > 180
                                        ? `${partnerData.description.substring(0, 180)}...`
                                        : partnerData.description}
                                </p>
                            )}

                            {/* Stat cards */}
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                                    <Home className="size-5 text-sky-400" />
                                    <div>
                                        <div className="text-lg font-bold text-white">
                                            {roomsData
                                                ? roomsData.length >= 1000
                                                    ? `${Math.floor(roomsData.length / 1000)}k+`
                                                    : roomsData.length >= 100
                                                        ? `${Math.floor(roomsData.length / 100) * 100}+`
                                                        : roomsData.length > 0 ? `${roomsData.length}` : "0"
                                                : "—"}
                                        </div>
                                        <div className="text-xs text-slate-400">Phòng cho thuê</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                                    <MapPin className="size-5 text-emerald-400" />
                                    <div>
                                        <div className="text-lg font-bold text-white">
                                            {roomsArray.length > 0 ? `${roomsArray.length}` : "—"}
                                        </div>
                                        <div className="text-xs text-slate-400">Tỉnh/thành</div>
                                    </div>
                                </div>
                                {reviewsData && reviewsData.total_count > 0 && (
                                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                                        <Star className="size-5 fill-amber-400 text-amber-400" />
                                        <div>
                                            <div className="text-lg font-bold text-white">{reviewsData.average_rating}</div>
                                            <div className="text-xs text-slate-400">{reviewsData.total_count} đánh giá</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT — 2/5 — Contact card */}
                        <div className="lg:col-span-2">
                            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                <h2 className="mb-5 text-sm font-bold uppercase tracking-widest text-sky-300">Thông tin liên hệ</h2>
                                <div className="space-y-4">
                                    {partnerData?.address && (
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-500/15">
                                                <MapPin className="size-4 text-sky-400" />
                                            </div>
                                            <span className="text-sm leading-relaxed text-slate-200">{partnerData.address}</span>
                                        </div>
                                    )}
                                    {partnerData?.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                                                <Phone className="size-4 text-emerald-400" />
                                            </div>
                                            <span className="text-sm text-slate-200">{partnerData.phone}</span>
                                        </div>
                                    )}
                                    {partnerData?.user_email && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15">
                                                <Mail className="size-4 text-violet-400" />
                                            </div>
                                            <span className="text-sm text-slate-200 break-all">{partnerData.user_email}</span>
                                        </div>
                                    )}
                                    {partnerData?.website && (
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-500/15">
                                                <Globe className="size-4 text-sky-400" />
                                            </div>
                                            <a
                                                href={partnerData.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-sky-300 underline-offset-2 hover:underline break-all"
                                            >
                                                {partnerData.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="border-b border-slate-200 bg-slate-50">
                <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
                    <Breadcrumb
                        items={[
                            { label: t("breadcrumb.home"), href: "/" },
                            { label: formatProvinceName(partnerData?.province_name) || "", href: `/${provinceNameEn}/partners` },
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
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">{t("partnerDetail.partnerGallery")}</h2>
                    <div className={`grid gap-4 ${partnerImages.length === 1 ? 'grid-cols-1 justify-center' : partnerImages.length === 2 ? 'grid-cols-2 justify-center' : 'grid-cols-1 md:grid-cols-3'}`}>
                        {partnerImages.map((img, index) => (
                            <div key={index} className="aspect-video overflow-hidden rounded-lg shadow-lg">
                                <img
                                    src={resolveImageUrl(img, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || getPartnerFallbackImage()}
                                    alt={`Partner image ${index + 1}`}
                                    className="size-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = getPartnerFallbackImage();
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}



            {/* Rooms Section */}
            {roomsArray.length > 0 && (
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <h2 className="mb-8 text-3xl font-bold text-gray-900">{t("partnerDetail.availableRooms")}</h2>

                    {/* Provinces with Rooms */}
                    {roomsArray.map((provinceData, provinceIndex) => (
                        <div key={provinceIndex} className="mb-12">
                            {/* Province Title */}
                            <div className="mb-6 text-center">
                                <h3 className="mb-2 text-2xl font-semibold text-sky-600">
                                    {formatProvinceName(provinceData.province)}
                                </h3>
                                <div className="mx-auto h-1 w-24 rounded-full bg-sky-600"></div>
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
                                    className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white"
                                    style={{ transform: 'translateY(-50%) translateX(-50%)' }}
                                >
                                    <ChevronLeft className="size-6 text-gray-700" />
                                </button>

                                <button
                                    disabled={provinceData.rooms.length < 3}
                                    onClick={() => {
                                        if (provinceData.rooms.length >= 3) {
                                            splideRefs.current[provinceIndex]?.slideTo(splideRefs.current[provinceIndex].activeIndex + 3);
                                        }
                                    }}
                                    className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg transition-all duration-200 hover:scale-110 hover:bg-white"
                                    style={{ transform: 'translateY(-50%) translateX(50%)' }}
                                >
                                    <ChevronRight className="size-6 text-gray-700" />
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
                                    {provinceData.rooms.map((room: any) => {
                                        return (
                                            <SwiperSlide key={room.id} className="flex h-auto">
                                                <Card
                                                    key={room.id}
                                                    className="flex h-full w-full flex-col overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                                                >
                                                    <div className="relative h-48 w-full overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                                                        <img
                                                            src={(room.image && room.image !== "null") ? (room.image.startsWith('http') ? room.image : `${CLOUDINARY_HEADER_IMAGE_URL}/${room.image}`) : getRoomFallbackImage(room.property_type_name, room.name)}
                                                            alt={room.name}
                                                            className="size-full object-cover transition-transform duration-300 hover:scale-105"
                                                            onError={(e) => {
                                                                e.currentTarget.src = getRoomFallbackImage(room.property_type_name, room.name);
                                                            }}
                                                        />
                                                        {/* Wishlist Button */}
                                                        <div className="absolute right-2 top-2 z-10">
                                                            <button
                                                                onClick={(e) => handleToggleWishlist(e, room.id)}
                                                                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-rose-500 hover:scale-105 active:scale-95 shadow-md"
                                                                title="Thêm vào yêu thích"
                                                            >
                                                                <Heart
                                                                    className={`h-4 w-4 transition-all duration-300 ${
                                                                        wishlist.includes(room.id) ? "fill-rose-500 text-rose-500" : ""
                                                                    }`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <CardHeader className="shrink-0 pb-3">
                                                        <CardTitle className="flex items-center justify-between">
                                                            <span className="truncate pr-2 text-lg font-semibold">{room.name}</span>
                                                            <span className="text-l shrink-0 font-bold text-red-600">
                                                                {formatCurrencyInput(room.price.toString())} {room.currency}
                                                            </span>
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="flex flex-1 flex-col justify-between">
                                                        <div className="flex-1">
                                                            {room.reviews_avg_rating && Number(room.reviews_avg_rating) > 0 ? (
                                                                <div className="mb-3 flex items-center gap-1 text-[0.8rem] font-bold text-amber-500">
                                                                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                                                                    <span>{room.reviews_avg_rating}</span>
                                                                    <span className="text-slate-400 font-normal">({room.reviews_count} đánh giá)</span>
                                                                </div>
                                                            ) : (
                                                                <div className="mb-3 flex items-center gap-1 text-[0.8rem] text-slate-400">
                                                                    <Star className="size-3.5 text-slate-300" />
                                                                    <span className="font-normal text-slate-400">Chưa có đánh giá</span>
                                                                </div>
                                                            )}
                                                            <p className="mb-4 line-clamp-2 min-h-12 text-gray-600">{room.description}</p>
                                                            <div className="mb-4 flex items-center gap-4">
                                                                <div className="flex items-center gap-1">
                                                                    <Users className="size-4 text-sky-700" />
                                                                    <span className="text-sm text-sky-700">{t("partnerDetail.maxGuests")} {room.capacity} {t("partnerDetail.guests")}</span>
                                                                </div>
                                                            </div>
                                                            <div className="mb-4 flex h-14 flex-wrap gap-1 overflow-hidden content-start">
                                                                {room.amenities.slice(0, 4).map((amenity: string, index: number) => (
                                                                    <Badge key={index} variant="outline" className="text-xs rounded-full bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100">
                                                                        {amenity}
                                                                    </Badge>
                                                                ))}
                                                                {room.amenities.length > 4 && (
                                                                    <Badge variant="outline" className="text-xs rounded-full bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100">
                                                                        +{room.amenities.length - 4}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="mt-auto flex gap-2 w-full">
                                                             <Button
                                                                 variant="gradient"
                                                                 className="flex-1 rounded-full"
                                                                 onClick={(e) => {
                                                                     e.stopPropagation();
                                                                     navigate(`${ROUTERS.BOOKING}/${room.id}`);
                                                                 }}
                                                             >
                                                                 {t("partnerDetail.bookNow")}
                                                             </Button>
                                                             <Button
                                                                 variant="outline"
                                                                 type="button"
                                                                 className="shrink-0 rounded-full h-10 w-10 p-0 border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-600 hover:text-sky-600 flex items-center justify-center"
                                                                 onClick={(e) => handleShareRoom(e, room.id)}
                                                                 title="Chia sẻ phòng"
                                                             >
                                                                 <Share2 className="size-4" />
                                                             </Button>
                                                         </div>
                                                    </CardContent>
                                                </Card>
                                            </SwiperSlide>
                                        );
                                    })}
                                </Swiper>

                                {/* Slide Indicators */}
                                {provinceData.rooms.length > 1 && (
                                    <div className="mt-6 flex justify-center gap-2">
                                        {[...Array(provinceData.rooms.length > 3 ? 3 : provinceData.rooms.length)].map((_, index) => {
                                            const activeIndex = currentSlides[provinceIndex] || 0;
                                            const totalRooms = provinceData.rooms.length;
                                            const maxActiveIndex = totalRooms - 3;
                                            
                                            let isActive = false;
                                            if (totalRooms <= 3) {
                                                isActive = index === activeIndex;
                                            } else {
                                                if (index === 0 && activeIndex === 0) {
                                                    isActive = true;
                                                } else if (index === 2 && activeIndex >= maxActiveIndex) {
                                                    isActive = true;
                                                } else if (index === 1 && activeIndex > 0 && activeIndex < maxActiveIndex) {
                                                    isActive = true;
                                                }
                                            }

                                            const handleDotClick = () => {
                                                const swiper = splideRefs.current[provinceIndex];
                                                if (!swiper) return;
                                                if (totalRooms <= 3) {
                                                    swiper.slideTo(index);
                                                } else {
                                                    if (index === 0) {
                                                        swiper.slideTo(0);
                                                    } else if (index === 2) {
                                                        swiper.slideTo(totalRooms - 1);
                                                    } else {
                                                        swiper.slideTo(Math.floor((totalRooms - 1) / 2));
                                                    }
                                                }
                                            };

                                            return (
                                                <button
                                                    key={index}
                                                    onClick={handleDotClick}
                                                    className={`size-3 rounded-full transition-all duration-200 hover:scale-125 ${isActive
                                                        ? 'scale-110 bg-sky-600'
                                                        : 'bg-gray-300'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* View All Button */}
                            <div className="mt-8 flex justify-center">
                                <Button
                                    variant="outline"
                                    disabled={provinceData.rooms.length < 3}
                                    className={`group rounded-full transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 ${provinceData.rooms.length < 3 ? 'cursor-not-allowed opacity-50' : ''}`}
                                    onClick={() => {
                                        if (provinceData.rooms.length >= 3) {
                                            const prov = PROVINCES.find(p => p.name.toLowerCase() === provinceData.province.toLowerCase());
                                            const targetProvinceId = prov ? prov.id : partnerData?.province_id;
                                            if (targetProvinceId) {
                                                navigate(ROUTERS.SEARCH_ROOMS_BY_PROVINCE.replace(":provinceId", targetProvinceId.toString()));
                                            }
                                        }
                                    }}
                                >
                                    <span className="mr-2">{t("common.viewAll")}</span>
                                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reviews Section */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <Card className="rounded-3xl border-slate-200/80 shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-900">Đánh giá về đối tác</CardTitle>
                            <p className="text-xs text-slate-500 mt-1">Phản hồi thực tế của khách thuê về chủ nhà</p>
                        </div>
                        {reviewsData && reviewsData.total_count > 0 && (
                            <div className="text-right">
                                <div className="text-2xl font-black text-slate-900 flex items-center gap-1.5 justify-end">
                                    <Star className="size-5 text-amber-500 fill-amber-500 shrink-0" />
                                    {reviewsData.average_rating}
                                </div>
                                <span className="text-[11px] font-bold text-slate-400">/ {reviewsData.total_count} đánh giá</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="pt-6">
                        {isLoadingReviews ? (
                            <div className="py-8 text-center">
                                <Spinner size="md" />
                            </div>
                        ) : !reviewsData || reviewsData.reviews.length === 0 ? (
                            <p className="py-4 text-center text-slate-400 text-sm">
                                Chưa có đánh giá nào cho đối tác này.
                            </p>
                        ) : (
                            <>
                                <div className="divide-y divide-slate-100">
                                    {reviewsData.reviews.slice(0, 5).map((review) => (
                                        <div key={review.id} className="py-5 first:pt-0 last:pb-0 space-y-3">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                                        {review.user?.avatar ? (
                                                            <img src={review.user.avatar} alt={review.user.name} className="size-full object-cover" />
                                                        ) : (
                                                            <Users className="size-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-800">{review.user?.name || "Khách hàng"}</h4>
                                                        <span className="text-[10px] text-slate-400">{new Date(review.created_at).toLocaleDateString("vi-VN")}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`size-3.5 ${
                                                                i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm text-slate-600 leading-relaxed pl-13 italic">
                                                    "{review.comment}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {reviewsData.reviews.length > 5 && (
                                    <div className="mt-6 flex justify-center border-t border-slate-100 pt-4">
                                        <ReviewsModal
                                            title="Đánh giá về đối tác"
                                            reviews={reviewsData.reviews}
                                            averageRating={reviewsData.average_rating}
                                            totalCount={reviewsData.total_count}
                                            trigger={
                                                <Button
                                                    variant="outline"
                                                    className="rounded-full px-8 transition-all hover:bg-slate-50 font-semibold text-slate-700"
                                                >
                                                    Xem thêm {reviewsData.reviews.length - 5} đánh giá
                                                </Button>
                                            }
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            <PublicFooter/>
        </div>
    );
};

export default PartnerDetail;
