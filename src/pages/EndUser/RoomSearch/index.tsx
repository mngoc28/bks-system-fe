import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, MapPin, SearchX, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetHomeWardsByProvinceId } from "@/hooks/useWardQuery";
import { useRoomsQuery } from "@/hooks/EU/useRoomQuery";
import { formatPrice } from "@/utils/utils";

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const RoomSearch = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("price_asc");

  const provinceId = Number(searchParams.get("provinceId") || 0);
  const districtId = Number(searchParams.get("districtId") || 0);

  const { data: provincesData } = useGetAllProvincesTypes();
  const { data: districtsData } = useGetHomeWardsByProvinceId(provinceId);
  const { data: rooms = [], isLoading, isError } = useRoomsQuery({}, { enabled: true });

  const selectedProvince = useMemo(
    () => provincesData?.data?.find((province) => province.id === provinceId),
    [provinceId, provincesData],
  );

  const selectedDistrict = useMemo(
    () => districtsData?.data?.find((district) => district.id === districtId),
    [districtId, districtsData],
  );

  const filteredRooms = useMemo(() => {
    const provinceName = selectedProvince?.name ? normalize(selectedProvince.name) : "";
    const districtName = selectedDistrict?.name ? normalize(selectedDistrict.name) : "";
    const keywordText = normalize(keyword);

    const matched = rooms.filter((room) => {
      const roomProvince = normalize(room.province_name || "");
      const roomAddress = normalize(room.building_address || "");
      const roomTitle = normalize(room.title || "");
      const roomDescription = normalize(room.description || "");

      const matchesProvince = !provinceName || roomProvince.includes(provinceName);
      const matchesDistrict = !districtName || roomAddress.includes(districtName);
      const matchesKeyword =
        !keywordText || roomTitle.includes(keywordText) || roomAddress.includes(keywordText) || roomDescription.includes(keywordText);

      return matchesProvince && matchesDistrict && matchesKeyword;
    });

    return matched.sort((a, b) => {
      if (sortBy === "price_desc") {
        return b.cheapest_daily_price - a.cheapest_daily_price;
      }
      if (sortBy === "capacity_desc") {
        return b.people - a.people;
      }
      return a.cheapest_daily_price - b.cheapest_daily_price;
    });
  }, [rooms, selectedProvince, selectedDistrict, keyword, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50/40 text-slate-900">
      <PublicHeader />

      <div className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900/80" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">
            Kết quả tìm kiếm
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Tìm phòng lưu trú phù hợp</h1>
          <p className="mt-3 text-slate-200">
            {selectedProvince?.name ? `Khu vực: ${selectedProvince.name}` : "Tất cả tỉnh/thành"}
            {selectedDistrict?.name ? ` - ${selectedDistrict.name}` : ""}
          </p>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: t("breadcrumb.home"), href: ROUTERS.HOME },
              { label: "Tìm phòng" },
            ]}
            className="text-sm"
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên phòng, địa chỉ..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-sky-400"
            />
          </div>
          <div className="relative">
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-400"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="price_asc">Giá thấp đến cao</option>
              <option value="price_desc">Giá cao đến thấp</option>
              <option value="capacity_desc">Sức chứa cao nhất</option>
            </select>
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-slate-300/70 bg-white/80 px-6 py-16 text-center text-slate-500">
            {t("common.loading")}
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/90 px-6 py-16 text-center text-sm font-semibold text-rose-600">
            {t("common.loading_error")}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/70 bg-white/80 px-6 py-16 text-center">
            <SearchX className="mx-auto mb-3 size-8 text-slate-400" />
            <p className="text-base font-semibold text-slate-700">Không tìm thấy phòng phù hợp</p>
            <p className="mt-2 text-sm text-slate-500">Thử đổi bộ lọc hoặc tìm ở khu vực khác.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Tìm thấy <span className="font-semibold text-slate-900">{filteredRooms.length}</span> phòng phù hợp
              </p>
              <Badge variant="secondary" className="rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                <Filter className="mr-1 size-3.5" />
                Đã áp dụng bộ lọc
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredRooms.map((room) => {
                const roomImage = room.room_image
                  ? `${CLOUDINARY_HEADER_IMAGE_URL}/${room.room_image}`
                  : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

                return (
                  <Card
                    key={room.id}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img src={roomImage} alt={room.title} className="size-full object-cover transition duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent" />
                    </div>
                    <CardContent className="space-y-3 p-5">
                      <div>
                        <h3 className="line-clamp-1 text-lg font-semibold text-slate-900">{room.title}</h3>
                        <p className="mt-1 inline-flex items-start gap-2 text-sm text-slate-600">
                          <MapPin className="mt-0.5 size-4 text-sky-500" />
                          <span className="line-clamp-2">{room.building_address}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <Users className="size-4 text-sky-500" />
                          {room.people} khách
                        </span>
                        <span className="font-semibold text-sky-600">{formatPrice(room.cheapest_daily_price)}/đêm</span>
                      </div>

                      {room.amenities && (
                        <div className="flex flex-wrap gap-2">
                          {room.amenities
                            .split(",")
                            .slice(0, 3)
                            .map((amenity) => (
                              <Badge key={`${room.id}-${amenity}`} variant="secondary" className="rounded-full bg-slate-100 text-slate-700">
                                {amenity.trim()}
                              </Badge>
                            ))}
                        </div>
                      )}

                      <div className="pt-1">
                        <Button asChild className="w-full rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:opacity-90">
                          <Link to={ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", room.id.toString())}>Xem chi tiết</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};

export default RoomSearch;
