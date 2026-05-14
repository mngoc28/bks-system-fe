import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MapPin, Users, Ruler, CalendarDays, ArrowLeft, FileText, CreditCard, Zap, Droplets, Info } from "lucide-react";

import { roomApi } from "@/api/EU/roomApi";
import Breadcrumb from "@/components/common/Breadcrumb";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { formatPrice } from "@/utils/utils";

const PublicRoomDetail = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const id = Number(roomId || 0);

  const { data: room, isLoading, isError } = useQuery({
    queryKey: ["public-room-detail", id],
    queryFn: async () => {
      const response = await roomApi.getRoomDetail(id);
      return response.data;
    },
    enabled: !!id,
  });

  const roomImages = useMemo(() => {
    if (!room) {
      return [] as string[];
    }

    const galleryFromImages = Array.isArray(room.images)
      ? room.images
          .map((image: any) => image?.image_url)
          .filter(Boolean)
          .map((url: string) => `${CLOUDINARY_HEADER_IMAGE_URL}${url}`)
      : [];

    const cover = room.room_image ? `${CLOUDINARY_HEADER_IMAGE_URL}/${room.room_image}` : null;

    return [cover, ...galleryFromImages].filter(Boolean) as string[];
  }, [room]);

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

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40">
        <PublicHeader />
        <main className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-slate-600">Không tìm thấy phòng hợp lệ.</p>
          <Button className="mt-5" onClick={() => navigate(ROUTERS.SEARCH_ROOMS)}>
            Quay lại tìm phòng
          </Button>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      <section className="relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary-light transition hover:bg-white/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-3.5" />
            Quay lại
          </button>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{room?.title || "Chi tiết phòng"}</h1>
          <p className="mt-3 inline-flex items-center gap-2 text-slate-200">
            <MapPin className="size-4 text-primary-light" />
            {room?.property_address || "Đang cập nhật địa chỉ"}
          </p>
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
            <div className="rounded-3xl border border-dashed border-slate-300/70 bg-white px-6 py-12 text-center text-slate-500">
              Đang tải chi tiết phòng...
            </div>
          ) : isError || !room ? (
            <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/90 px-6 py-12 text-center text-rose-600">
              Không thể tải thông tin phòng. Vui lòng thử lại.
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white sm:col-span-2">
                  <img
                    src={roomImages[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80"}
                    alt={room.title}
                    className="h-[320px] w-full object-cover sm:h-[420px]"
                  />
                </div>
                {roomImages.slice(1, 5).map((image, index) => (
                  <div key={`${image}-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img src={image} alt={`${room.title}-${index + 2}`} className="h-40 w-full object-cover" />
                  </div>
                ))}
              </div>

              <Card className="rounded-3xl border-slate-200 shadow-sm">
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {room.property_type_name && (
                      <Badge variant="outline" className="rounded-full border-primary/30 bg-primary/5 px-3 text-primary font-bold">
                        {room.property_type_name}
                      </Badge>
                    )}
                    {(room.property_type_name?.includes("Căn hộ dịch vụ") || room.property_type_name?.includes("Homestay")) && (
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
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Linh hoạt</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <CalendarDays className="size-4 text-primary" />
                        Đặt theo ngày
                      </p>
                    </div>
                  </div>

                  {room.description && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Mô tả phòng</h2>
                      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{room.description}</p>
                    </div>
                  )}

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
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-amber-600 border-amber-200 bg-amber-50">Bắt buộc</Badge>
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
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px]">Đã bao gồm</Badge>
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
                      <div>
                        <h4 className="text-sm font-bold text-sky-900">Chính sách tiền cọc</h4>
                        <p className="text-xs text-sky-700 mt-1 leading-relaxed">
                          Đối với hợp đồng thuê dài hạn, quý khách cần đặt cọc từ {' '}
                          <span className="font-bold underline">
                            {allPrices.find((p: any) => p.unit === 'month')?.deposit_amount / allPrices.find((p: any) => p.unit === 'month')?.price || 1} tháng
                          </span> {' '}
                          tiền phòng. Tiền cọc sẽ được hoàn trả sau khi kết thúc hợp đồng.
                        </p>
                      </div>
                    </div>
                  )}

                  {services.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Dịch vụ bổ sung (Tùy chọn)</h2>
                      <div className="mt-3 grid gap-2">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/50">
                            <span className="inline-flex items-center gap-2 text-slate-700 font-medium">
                              <CheckCircle2 className="size-4 text-emerald-500" />
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
            </>
          )}
        </section>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4">
                {allPrices.map((price: any, index: number) => (
                  <div key={index} className={`p-4 rounded-2xl border ${price.unit === 'month' ? 'border-sky-200 bg-sky-50/50' : 'border-slate-100 bg-slate-50/50'}`}>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">
                      {price.unit === 'month' ? 'Thuê theo tháng' : 'Thuê theo đêm'}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary">{formatPrice(price.price)}</span>
                      <span className="text-sm text-slate-500">/{price.unit === 'month' ? 'tháng' : 'đêm'}</span>
                    </div>
                    {price.minimum_stay > 0 && (
                      <p className="text-[10px] text-amber-600 mt-2 font-medium flex items-center gap-1">
                        <Info className="size-3" />
                        Yêu cầu thuê tối thiểu {price.minimum_stay} {price.unit === 'month' ? 'tháng' : 'đêm'}
                      </p>
                    )}
                  </div>
                ))}
                {!allPrices.length && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Giá từ</p>
                    <p className="mt-2 text-3xl font-bold text-primary">{formatPrice(room?.cheapest_daily_price || 0)}</p>
                    <p className="text-sm text-slate-500">/ đêm, chưa bao gồm dịch vụ bổ sung</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-[11px] text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <p>Cam kết giá tốt nhất khi đặt trực tiếp.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <p>Hỗ trợ pháp lý & hợp đồng điện tử 24/7.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <p>Hệ thống an ninh & quản lý chuyên nghiệp.</p>
                </div>
              </div>

              <Button asChild className="w-full h-12 rounded-xl bg-gradient-to-r from-primary via-sky-600 to-sky-700 text-white font-bold shadow-lg shadow-sky-200 transition-all hover:shadow-sky-300 active:scale-[0.98]">
                <Link to={`${ROUTERS.BOOKING}/${id}`}>Đặt phòng ngay</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>

      <PublicFooter />
    </div>
  );
};

export default PublicRoomDetail;

