import { useMemo, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MapPin, Users, Ruler, CalendarDays, ArrowLeft, FileText, CreditCard, Zap, Droplets, Info, Star, Building2, Phone, Mail, UserCheck, Plus, RotateCcw } from "lucide-react";
import { useRoomReviewsQuery } from "@/hooks/useReviewQuery";
import { resolveImageUrl } from "@/utils/imageUtils";

import { roomApi } from "@/api/EU/roomApi";
import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePickerField } from "@/components/ui/date-picker-field";
import ImageLightbox from "@/components/ui/image-lightbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { Matcher } from "react-day-picker";
import { ReviewsModal } from "@/components/rooms/ReviewsModal";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { normalizeStayPropertyTypeLabel, supportsElectronicContractByPropertyType, isApartmentSegmentPropertyType } from "@/utils/stayPropertyType";
import { formatPrice, formatPhoneNumber } from "@/utils/utils";
import { resolveTouristSpotName } from "@/utils/touristSummary";
import { RoomTouristSpotsSection } from "@/components/rooms/RoomTouristSpotsSection";

function parseYmdToLocalDate(value: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

const PublicRoomDetail = () => {
  const isMobileViewport = useMediaQuery("(max-width: 767px)");
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = Number(roomId || 0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ["public-room-detail", id],
    queryFn: async () => {
      const response = await roomApi.getRoomDetail(id);
      return response.data;
    },
    enabled: !!id,
  });

  // Fetch booked dates list
  const { data: bookedDatesResponse } = useQuery({
    queryKey: ["room-booked-dates", id],
    queryFn: async () => {
      const response = await roomApi.getBookedDates(id);
      return response.data;
    },
    enabled: !!id,
  });
  const bookedDates = bookedDatesResponse || [];

  const checkin = searchParams.get("startDate") || "";
  const checkout = searchParams.get("endDate") || "";

  const handleStartDateChange = (dateStr: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("startDate", dateStr);
    if (checkout && checkout <= dateStr) {
      newParams.delete("endDate");
    }
    setSearchParams(newParams);
  };

  const handleEndDateChange = (dateStr: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("endDate", dateStr);
    setSearchParams(newParams);
  };

  const selectedRange = useMemo(() => {
    return {
      from: checkin ? new Date(checkin) : undefined,
      to: checkout ? new Date(checkout) : undefined,
    };
  }, [checkin, checkout]);

  const handleRangeSelect = (range: any) => {
    if (!range) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("startDate");
      newParams.delete("endDate");
      setSearchParams(newParams);
      return;
    }

    const { from, to } = range;

    if (from && to && bookedDates.length > 0) {
      const startStr = format(from, 'yyyy-MM-dd');
      const endStr = format(to, 'yyyy-MM-dd');
      const hasConflict = bookedDates.some(dateStr => {
        return dateStr > startStr && dateStr < endStr;
      });

      if (hasConflict) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("startDate", format(to, 'yyyy-MM-dd'));
        newParams.delete("endDate");
        setSearchParams(newParams);
        return;
      }
    }

    const newParams = new URLSearchParams(searchParams);
    if (from) {
      newParams.set("startDate", format(from, 'yyyy-MM-dd'));
    } else {
      newParams.delete("startDate");
    }
    if (to) {
      newParams.set("endDate", format(to, 'yyyy-MM-dd'));
    } else {
      newParams.delete("endDate");
    }
    setSearchParams(newParams);
  };

  const handleClearDates = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("startDate");
    newParams.delete("endDate");
    setSearchParams(newParams);
  };

  const scrollToCalendar = () => {
    const el = document.getElementById("booking-calendar-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const inlineCalendarDisabledMatchers = useMemo((): Matcher[] => {
    const matchers: Matcher[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    matchers.push({ before: today });

    if (bookedDates && bookedDates.length > 0) {
      bookedDates.forEach((dStr) => {
        const dObj = parseYmdToLocalDate(dStr);
        if (dObj) {
          matchers.push(dObj);
        }
      });
    }
    return matchers;
  }, [bookedDates]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { data: reviewsData, isLoading: isLoadingReviews } = useRoomReviewsQuery(id, {
    enabled: !!id,
  });

  const roomImages = useMemo(() => {
    if (!room) {
      return [] as string[];
    }

    let rawImages = room.images;
    if (typeof rawImages === 'string') {
      try {
        rawImages = JSON.parse(rawImages);
      } catch {
        rawImages = [];
      }
    }

    const galleryFromImages = Array.isArray(rawImages)
      ? rawImages
        .map((image: any) => image?.image_url)
        .filter(Boolean)
        .map((url: string) => resolveImageUrl(url, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }))
      : [];

    const cover = room.room_image ? resolveImageUrl(room.room_image, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) : null;

    return Array.from(new Set([cover, ...galleryFromImages].filter(Boolean))) as string[];
  }, [room]);

  const lightboxSlides = useMemo(() => {
    return roomImages.map((src) => ({ src }));
  }, [roomImages]);

  const amenities = useMemo(() => {
    if (!room?.amenities) {
      return [] as string[];
    }

    if (Array.isArray(room.amenities)) {
      return room.amenities
        .map((item: any) => item?.name || item?.toString())
        .filter(Boolean)
        .map((item: string) => item.trim());
    }

    return room.amenities
      .toString()
      .split(",")
      .map((item: string) => item.trim())
      .filter(Boolean);
  }, [room]);

  const services = useMemo(() => {
    if (!room?.services) {
      return [] as Array<{ id: number; name: string; price: string }>;
    }

    try {
      const parsedServices = JSON.parse(room.services);
      if (!Array.isArray(parsedServices)) {
        return [];
      }
      return parsedServices.map((service: any) => ({
        id: service.id,
        name: service.name,
        price: service.price?.toString() || "0",
      }));
    } catch {
      return [];
    }
  }, [room]);

  const allPrices = useMemo(() => {
    if (!room?.all_prices) return [] as any[];
    try {
      return JSON.parse(room.all_prices);
    } catch { return []; }
  }, [room]);

  const utilityFees = useMemo(() => {
    if (!room?.utility_fees) return [] as any[];
    try {
      return JSON.parse(room.utility_fees);
    } catch { return []; }
  }, [room]);

  const isLongTerm = useMemo(() => {
    const isApartment = room?.property_type_name ? isApartmentSegmentPropertyType(room.property_type_name) : false;
    const hasMonthPrice = allPrices.some((p: any) => p.unit === 'month');
    const hasDayPrice = allPrices.some((p: any) => p.unit === 'day');
    return isApartment || (hasMonthPrice && !hasDayPrice);
  }, [room, allPrices]);

  const propertyTypeLabel = normalizeStayPropertyTypeLabel(room?.property_type_name);

  const renderBookingCard = () => {
    return (
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-4">
            {allPrices.map((price: any, index: number) => {
              const isMonth = price.unit === 'month';
              const isDay = price.unit === 'day';

              let unitTitle = "Thuê theo đêm";
              let unitLabel = "đêm";
              if (isMonth) {
                unitTitle = "Thuê dài hạn";
                unitLabel = "tháng";
              } else if (isDay) {
                unitTitle = "Thuê ngắn hạn";
                unitLabel = "ngày";
              } else if (price.unit) {
                unitTitle = `Thuê theo ${price.unit}`;
                unitLabel = price.unit;
              }

              return (
                <div key={index} className={`p-4 rounded-2xl border ${isMonth ? 'border-sky-200 bg-sky-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                    {unitTitle}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-primary">{formatPrice(price.price)}</span>
                    <span className="text-sm text-slate-500">/{unitLabel}</span>
                  </div>
                  {price.minimum_stay > 0 && (
                    <p className="text-[10px] text-amber-600 mt-2 font-medium flex items-center gap-1 bg-amber-50/50 p-1.5 rounded-lg border border-amber-100/50">
                      <Info className="size-3.5 text-amber-500 shrink-0" />
                      <span>Yêu cầu thuê tối thiểu {price.minimum_stay} {unitLabel}</span>
                    </p>
                  )}
                </div>
              );
            })}
            {!allPrices.length && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Giá từ</p>
                <p className="mt-2 text-3xl font-bold text-primary">{formatPrice(room?.cheapest_daily_price || 0)}</p>
                <p className="text-sm text-slate-500">/ đêm, chưa bao gồm dịch vụ bổ sung</p>
              </div>
            )}
          </div>

          {/* Widget Chọn Ngày */}
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <h4 className="text-sm font-bold text-slate-800">Thời gian lưu trú</h4>
            <div className="grid grid-cols-2 gap-3">
              <DatePickerField
                label="Nhận phòng"
                value={checkin}
                onChange={handleStartDateChange}
                minDate={todayStr}
                excludeDates={bookedDates}
                triggerClassName="h-9 px-2 text-xs rounded-md"
                labelClassName="text-[10px] font-bold text-slate-500"
                placeholder="Chọn ngày"
              />
              <DatePickerField
                label="Trả phòng"
                value={checkout}
                onChange={handleEndDateChange}
                minDate={checkin || todayStr}
                excludeDates={bookedDates}
                triggerClassName="h-9 px-2 text-xs rounded-md"
                labelClassName="text-[10px] font-bold text-slate-500"
                placeholder="Chọn ngày"
                disabled={!checkin}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-medium">
            <span>✓ Giá tốt nhất</span>
            <span>✓ Hỗ trợ 24/7</span>
            <span>✓ An ninh & Hợp đồng</span>
          </div>

          {checkin && checkout ? (
            <Button asChild variant="gradient" className="w-full rounded-full">
              <Link to={`${ROUTERS.BOOKING}/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}>Đặt phòng ngay</Link>
            </Button>
          ) : (
            <Button disabled className="w-full rounded-full bg-slate-200 text-slate-400 cursor-not-allowed">
              Vui lòng chọn ngày để đặt
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
        <PublicHeader />
        <main className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-slate-600">Không tìm thấy phòng hợp lệ.</p>
          <Button className="mt-5 rounded-full" onClick={() => navigate(ROUTERS.SEARCH_ROOMS)}>
            Quay lại tìm phòng
          </Button>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900 pb-20 lg:pb-0">
      <PublicHeader />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Background scenic image */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src={roomImages[0] || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=75"}
            alt="hero background"
            className="h-full w-full object-cover"
            style={{ opacity: 0.35 }}
          />
        </div>
        {/* Multi-layer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />
        {/* Ambient glow orbs */}
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-sky-600/15 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(148,163,184,1) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-light transition hover:bg-white/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-3.5" />
            Quay lại
          </button>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{room?.title || "Chi tiết phòng"}</h1>
          <div className="mt-4 flex flex-col gap-2.5 text-slate-200">
            <p className="inline-flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="size-4 text-primary-light shrink-0" />
              <span>{room?.property_address || "Đang cập nhật địa chỉ"}</span>
            </p>

            {room && (room.partner_company_name || room.partner_name) && (
              <p className="inline-flex items-center gap-2 text-sm sm:text-base text-slate-200/95">
                <Building2 className="size-4 text-primary-light shrink-0" />
                <span>
                  Đơn vị vận hành:{" "}
                  {room.partner_id ? (
                    <Link
                      to={ROUTERS.PARTNER_DETAIL.replace(":partner_id", String(room.partner_id))}
                      className="font-bold text-sky-300 hover:text-white hover:underline transition-all duration-200 inline-flex items-center gap-1.5"
                    >
                      {room.partner_company_name || room.partner_name}
                      <CheckCircle2 className="size-4 text-sky-400 shrink-0" />
                    </Link>
                  ) : (
                    <span className="font-bold text-white">{room.partner_company_name || room.partner_name}</span>
                  )}
                </span>
              </p>
            )}

            {reviewsData && reviewsData.total_count > 0 && (
              <p className="inline-flex items-center gap-2 text-sm sm:text-base text-slate-200/95">
                <span className="inline-flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < Math.round(reviewsData.average_rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-500"
                        }`}
                    />
                  ))}
                </span>
                <span className="font-bold text-amber-400">{reviewsData.average_rating}</span>
                <span className="text-slate-300">({reviewsData.total_count} đánh giá)</span>
              </p>
            )}

            {room?.tourist_summary?.has_tourist_mapping && resolveTouristSpotName(room.tourist_summary.tourist_spot_name) && (
              <p className="inline-flex items-center gap-2 text-sm text-primary-light/95">
                <MapPin className="size-4 shrink-0 text-amber-200" aria-hidden />
                <span className="font-medium">{resolveTouristSpotName(room.tourist_summary.tourist_spot_name)}</span>
                {room.tourist_summary.travel_time_label && (
                  <span className="text-slate-300 font-normal">• {room.tourist_summary.travel_time_label}</span>
                )}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: ROUTERS.HOME },
              { label: "Tìm phòng", href: ROUTERS.SEARCH_ROOMS },
              { label: room?.title || "Chi tiết phòng" },
            ]}
            className="text-sm"
          />
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <section className="space-y-6">
          {isLoading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <Spinner size="lg" showText text="Đang tải chi tiết phòng..." className="text-slate-500 font-bold" />
            </div>
          ) : isError || !room ? (
            <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/90 px-6 py-12 text-center text-rose-600">
              Không thể tải thông tin phòng. Vui lòng thử lại.
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div 
                  className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white sm:col-span-2 cursor-pointer group"
                  onClick={() => {
                    setLightboxIndex(0);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={roomImages[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80"}
                    alt={room.title}
                    className="h-[320px] w-full object-cover sm:h-[420px] transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xs font-bold bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm shadow-md">
                      Xem tất cả ảnh
                    </span>
                  </div>
                </div>
                {roomImages.slice(1, 5).map((image, index) => (
                  <div 
                    key={`${image}-${index}`} 
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white cursor-pointer group relative"
                    onClick={() => {
                      setLightboxIndex(index + 1);
                      setLightboxOpen(true);
                    }}
                  >
                    <img 
                      src={image} 
                      alt={`${room.title}-${index + 2}`} 
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        Phóng to
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {lightboxOpen && (
                <ImageLightbox
                  open={lightboxOpen}
                  onClose={() => setLightboxOpen(false)}
                  index={lightboxIndex}
                  slides={lightboxSlides}
                />
              )}

              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {room.property_type_name && (
                      <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 px-3 text-primary font-bold">
                        {propertyTypeLabel}
                      </Badge>
                    )}
                    {supportsElectronicContractByPropertyType(room.property_type_name) && (
                      <Badge className="rounded-full bg-indigo-500 text-white border-none px-3 font-bold flex gap-1.5 items-center">
                        <FileText className="size-3" />
                        Hỗ trợ Hợp đồng điện tử
                      </Badge>
                    )}
                    <Badge variant="secondary" className="rounded-full bg-emerald-100 text-emerald-700 font-bold">Phòng sẵn sàng</Badge>
                    <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">{room.province_name || "Việt Nam"}</Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Sức chứa</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Users className="size-4 text-primary" />
                        {room.people || 0} khách
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Diện tích</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Ruler className="size-4 text-primary" />
                        {room.area || "--"} m2
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Hình thức thuê</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                        {isLongTerm ? (
                          <>
                            <FileText className="size-4 text-primary" />
                            Thuê dài hạn (Hợp đồng)
                          </>
                        ) : (
                          <>
                            <CalendarDays className="size-4 text-primary" />
                            Đặt theo ngày (Ngắn hạn)
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {room.description && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Mô tả phòng</h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{room.description}</p>
                    </div>
                  )}

                  <RoomTouristSpotsSection summary={room.tourist_summary} />

                  {amenities.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Tiện nghi nổi bật</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {amenities.map((amenity: string) => (
                          <Badge key={amenity} variant="secondary" className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {utilityFees.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        Phụ phí & Tiền cọc
                        <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold text-amber-700 border-amber-100 bg-amber-50">Bắt buộc</Badge>
                      </h2>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {utilityFees.map((fee: any, index: number) => (
                          <div key={index} className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 bg-white hover:border-sky-200 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                                {fee.type === 'electricity' && <Zap className="size-4 text-yellow-500" />}
                                {fee.type === 'water' && <Droplets className="size-4 text-sky-500" />}
                                {fee.type === 'service' && <Info className="size-4 text-indigo-500" />}
                                {fee.type === 'electricity' ? 'Tiền điện' : fee.type === 'water' ? 'Tiền nước' : 'Phí dịch vụ'}
                              </span>
                              {fee.included ? (
                                <Badge className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px]">Đã bao gồm</Badge>
                              ) : (
                                <span className="text-sm font-bold text-sky-600">
                                  {formatPrice(fee.price)}
                                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                                    /{fee.method === 'per_unit' ? 'số' : fee.method === 'per_person' ? 'người' : 'tháng'}
                                  </span>
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 italic">
                              {fee.method === 'per_unit' ? 'Tính theo chỉ số đồng hồ thực tế' : fee.method === 'per_person' ? 'Chia đều theo số người lưu trú' : 'Cố định hàng tháng'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {allPrices.some((p: any) => p.deposit_amount > 0) && (
                    <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4 flex items-start gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <CreditCard className="size-5 text-sky-600" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <h4 className="text-sm font-bold text-sky-900">Chính sách tiền cọc</h4>
                        <div className="text-xs text-sky-700 leading-relaxed space-y-1">
                          <p>Đối với hợp đồng lưu trú, quý khách cần đặt cọc khoản phí để bảo đảm tình trạng phòng:</p>
                          <ul className="list-disc pl-4 space-y-1 mt-1 font-medium">
                            {allPrices
                              .filter((p: any) => p.deposit_amount > 0)
                              .map((p: any, idx: number) => {
                                let unitLabel = "ngày";
                                if (p.unit === 'month') {
                                  unitLabel = "tháng";
                                } else if (p.unit === 'day') {
                                  unitLabel = "ngày";
                                } else if (p.unit) {
                                  unitLabel = p.unit;
                                }
                                return (
                                  <li key={idx}>
                                    Gói thuê theo {unitLabel}: Tiền cọc là <span className="font-bold underline">{formatPrice(p.deposit_amount)}</span>.
                                  </li>
                                );
                              })}
                          </ul>
                          <p className="text-[10px] text-sky-600/90 italic mt-1.5">Tiền cọc sẽ được hoàn trả đầy đủ sau khi kết thúc hợp đồng và bàn giao phòng.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {services.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Dịch vụ bổ sung (Tùy chọn)</h2>
                      <div className="mt-3 grid gap-2">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/50 hover:bg-slate-50 transition-colors">
                            <span className="inline-flex items-center gap-2 text-slate-700 font-medium">
                              <Plus className="size-4 text-slate-400" />
                              {service.name}
                            </span>
                            <span className="font-semibold text-primary">{formatPrice(service.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lịch trống & Đặt phòng Inline Card */}
              <Card id="booking-calendar-card" className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
                <CardContent className="p-6 space-y-6">
                  <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarDays className="size-5 text-primary" />
                        Lịch trống & Đặt phòng
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Chọn ngày nhận và trả phòng trực tiếp trên lịch</p>
                    </div>
                    {(checkin || checkout) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearDates}
                        className="text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-100 hover:border-rose-200 transition-all duration-200 h-8 font-semibold px-3 rounded-full flex items-center gap-1.5 shadow-sm"
                      >
                        <RotateCcw className="size-3.5" />
                        Xóa ngày chọn
                      </Button>
                    )}
                  </div>

                  <div className="flex border border-slate-100 bg-slate-50/50 rounded-2xl p-4 md:p-6 overflow-x-auto w-full">
                    <Calendar
                      mode="range"
                      locale={vi}
                      selected={selectedRange}
                      onSelect={handleRangeSelect}
                      disabled={inlineCalendarDisabledMatchers}
                      numberOfMonths={isMobileViewport ? 1 : 2}
                      showOutsideDays={false}
                      className="p-0 w-full"
                      classNames={{
                        months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0 justify-between w-full gap-x-6",
                        month: "space-y-4 flex-1",
                        head_row: "flex w-full",
                        head_cell: "text-slate-500 w-full font-medium text-[0.8rem] text-center",
                        row: "flex w-full mt-2",
                        cell: "relative h-10 w-full p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-slate-100 [&:has([aria-selected].day-outside)]:bg-slate-100/50 [&:has([disabled])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                        day: "h-10 w-full p-0 font-normal text-slate-900 aria-selected:opacity-100 hover:bg-slate-100 rounded-lg",
                      }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 justify-center sm:justify-start pt-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-blue-600 block"></span>
                      <span>Ngày chọn của bạn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-slate-200/80 border border-slate-300 block"></span>
                      <span>Hôm nay</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-white border border-slate-200 block"></span>
                      <span>Còn trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded bg-slate-50 border border-slate-200 relative overflow-hidden block">
                        <span className="absolute inset-0 bg-slate-300 h-[1px] top-1/2 -translate-y-1/2 rotate-45 block text-slate-300"></span>
                      </span>
                      <span className="line-through text-slate-400">Đã được đặt / Khóa</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Booking Card (shown only on mobile/tablet) */}
              <div className="block lg:hidden">
                {renderBookingCard()}
              </div>

              {/* Partner Information Card */}
              {room && (room.partner_name || room.partner_company_name) && (
                <Card className="rounded-3xl border-slate-200 shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">
                  <CardContent className="p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Building2 className="size-5 text-primary" />
                        Thông tin nhà cung cấp
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Đơn vị vận hành và quản lý căn hộ/phòng</p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-4">
                        {room.partner_company_name && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">Tên doanh nghiệp / Đơn vị</p>
                            {room.partner_id ? (
                              <Link
                                to={ROUTERS.PARTNER_DETAIL.replace(":partner_id", String(room.partner_id))}
                                className="mt-1 inline-block text-base font-bold text-slate-800 hover:text-primary hover:underline transition-all duration-200"
                              >
                                {room.partner_company_name}
                              </Link>
                            ) : (
                              <p className="mt-1 text-base font-bold text-slate-800">{room.partner_company_name}</p>
                            )}
                          </div>
                        )}

                        {room.partner_name && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">Người đại diện</p>
                            {room.partner_id ? (
                              <Link
                                to={ROUTERS.PARTNER_DETAIL.replace(":partner_id", String(room.partner_id))}
                                className="mt-1 text-sm font-medium text-slate-700 flex items-center gap-1.5 hover:text-primary hover:underline transition-all duration-200"
                              >
                                <UserCheck className="size-4 text-emerald-500 shrink-0" />
                                {room.partner_name}
                              </Link>
                            ) : (
                              <p className="mt-1 text-sm font-medium text-slate-700 flex items-center gap-1.5">
                                <UserCheck className="size-4 text-emerald-500 shrink-0" />
                                {room.partner_name}
                              </p>
                            )}
                          </div>
                        )}

                        {room.partner_address && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">Địa chỉ văn phòng</p>
                            <p className="mt-1 text-sm text-slate-700 flex items-start gap-2 leading-relaxed break-words">
                              <MapPin className="size-4.5 text-slate-400 mt-0.5 shrink-0" />
                              <span className="font-medium">{room.partner_address}</span>
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {room.partner_phone && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">Số điện thoại liên hệ</p>
                            <p className="mt-1 text-sm text-slate-700 flex items-center gap-2 font-bold">
                              <Phone className="size-4 text-sky-500" />
                              <a href={`tel:${room.partner_phone}`} className="transition-colors duration-200 hover:text-primary">
                                {formatPhoneNumber(room.partner_phone)}
                              </a>
                            </p>
                          </div>
                        )}

                        {room.partner_email && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">Email liên hệ</p>
                            <p className="mt-1 text-sm text-slate-700 flex items-center gap-2 font-medium">
                              <Mail className="size-4 text-sky-500" />
                              <a href={`mailto:${room.partner_email}`} className="transition-colors duration-200 hover:text-primary underline decoration-slate-200 hover:decoration-primary">
                                {room.partner_email}
                              </a>
                            </p>
                          </div>
                        )}

                        {room.partner_description && (
                          <div>
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-400 font-semibold">Giới thiệu</p>
                            <p className="mt-1 text-sm text-slate-600 italic leading-relaxed">
                              "{room.partner_description}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Room Reviews List */}
              <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Đánh giá từ khách hàng</h2>
                      <p className="text-xs text-slate-500 mt-1">Trải nghiệm thực tế từ các vị khách đã lưu trú</p>
                    </div>
                    {reviewsData && reviewsData.total_count > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-2xl font-black text-slate-900 flex items-center gap-1.5 justify-end">
                            <Star className="size-5 text-amber-500 fill-amber-500 shrink-0" />
                            {reviewsData.average_rating}
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">/ {reviewsData.total_count} đánh giá</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isLoadingReviews ? (
                    <div className="py-8 text-center">
                      <Spinner size="md" />
                    </div>
                  ) : !reviewsData || reviewsData.reviews.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      Chưa có đánh giá nào cho phòng này. Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận!
                    </div>
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
                                    className={`size-3.5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
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
                            title="Đánh giá về phòng"
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
            </>
          )}
        </section>

        <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
          {renderBookingCard()}
        </aside>
      </main>

      <PublicFooter />

      {/* Sticky Bottom Bar for Mobile & Tablet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Giá từ</span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-primary">{formatPrice(room?.cheapest_daily_price || 0)}</span>
              <span className="text-xs text-slate-500">/đêm</span>
            </div>
            {checkin && checkout ? (
              <span className="text-[10px] font-bold text-emerald-600 mt-0.5">
                Đã chọn {checkin.split('-').slice(1).reverse().join('/')} - {checkout.split('-').slice(1).reverse().join('/')}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 mt-0.5">Chưa chọn ngày</span>
            )}
          </div>

          {checkin && checkout ? (
            <Button asChild variant="gradient" className="rounded-full px-6 text-xs font-bold h-10 shadow-md">
              <Link to={`${ROUTERS.BOOKING}/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}>
                Đặt ngay
              </Link>
            </Button>
          ) : (
            <Button onClick={scrollToCalendar} className="rounded-full bg-primary hover:bg-primary/90 text-white text-xs font-bold px-6 h-10 shadow-md">
              Chọn ngày
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicRoomDetail;

