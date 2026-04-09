import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MapPin, Users, Ruler, CalendarDays, ArrowLeft } from "lucide-react";

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
            <ArrowLeft className="h-3.5 w-3.5" />
            Quay lại
          </button>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{room?.title || "Chi tiết phòng"}</h1>
          <p className="mt-3 inline-flex items-center gap-2 text-slate-200">
            <MapPin className="h-4 w-4 text-primary-light" />
            {room?.building_address || "Đang cập nhật địa chỉ"}
          </p>
        </div>
      </section>

      <div className="bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
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
                    <Badge variant="secondary" className="rounded-full bg-primary-light text-primary">Phòng sẵn sàng</Badge>
                    <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">{room.province_name || "Việt Nam"}</Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Sức chứa</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Users className="h-4 w-4 text-primary" />
                        {room.people || 0} khách
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Diện tích</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <Ruler className="h-4 w-4 text-primary" />
                        {room.area || "--"} m2
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Linh hoạt</p>
                      <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <CalendarDays className="h-4 w-4 text-primary" />
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

                  {services.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Dịch vụ bổ sung</h2>
                      <div className="mt-3 grid gap-2">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm">
                            <span className="inline-flex items-center gap-2 text-slate-700">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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
            <CardContent className="space-y-5 p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Giá từ</p>
                <p className="mt-2 text-3xl font-bold text-primary">{formatPrice(room?.cheapest_daily_price || 0)}</p>
                <p className="text-sm text-slate-500">/ đêm, chưa bao gồm dịch vụ bổ sung</p>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p>Có thể hủy linh hoạt theo chính sách của đối tác.</p>
                <p>Hỗ trợ xác nhận nhanh qua email và số điện thoại.</p>
              </div>

              <Button asChild className="w-full rounded-xl gradient-primary hover:opacity-90 shadow-md transition-all active:scale-95">
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
