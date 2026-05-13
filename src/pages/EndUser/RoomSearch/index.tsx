import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, MapPin, SearchX, Users, ArrowDownWideNarrow } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PublicFooter, PublicHeader } from "@/components/layout/Public";
import Breadcrumb from "@/components/common/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CLOUDINARY_HEADER_IMAGE_URL, DEFAULT_ROOM_IMAGE, ROUTERS } from "@/constant";
import { useGetAllProvincesTypes } from "@/hooks/useProvinceQuery";
import { useGetHomeWardsByProvinceId } from "@/hooks/useWardQuery";
import { useRoomsQuery } from "@/hooks/EU/useRoomQuery";
import { useBuildingTypesQuery } from "@/hooks/useBuildingQuery";
import { formatPrice } from "@/utils/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const RoomSearch = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [sortBy, setSortBy] = useState("price_asc");
  const [selectedPropertyTypeId, setSelectedPropertyTypeId] = useState<number | null>(
    searchParams.get("propertyTypeId") ? Number(searchParams.get("propertyTypeId")) : null,
  );

  const provinceId = Number(searchParams.get("provinceId") || 0);
  const wardId = Number(searchParams.get("wardId") || 0);

  const { data: provincesData } = useGetAllProvincesTypes();
  const { data: wardsData } = useGetHomeWardsByProvinceId(provinceId);
  const { data: propertyTypesData } = useBuildingTypesQuery();
  const { data: rooms = [], isLoading, isError } = useRoomsQuery({}, { enabled: true });

  const selectedProvince = useMemo(
    () => provincesData?.data?.find((province) => province.id === provinceId),
    [provinceId, provincesData],
  );

  const selectedWard = useMemo(
    () => wardsData?.data?.find((ward) => ward.id === wardId),
    [wardId, wardsData],
  );

  const filteredRooms = useMemo(() => {
    const provinceName = selectedProvince?.name ? normalize(selectedProvince.name) : "";
    const wardName = selectedWard?.name ? normalize(selectedWard.name) : "";
    const keywordText = normalize(keyword);

    const matched = rooms.filter((room) => {
      const roomProvince = normalize(room.province_name || "");
      const roomAddress = normalize(room.building_address || "");
      const roomTitle = normalize(room.title || "");
      const roomDescription = normalize(room.description || "");

      const matchesProvince = !provinceName || roomProvince.includes(provinceName);
      const matchesWard = !wardName || roomAddress.includes(wardName);
      const matchesKeyword =
        !keywordText || roomTitle.includes(keywordText) || roomAddress.includes(keywordText) || roomDescription.includes(keywordText);
      const matchesPropertyType = !selectedPropertyTypeId || Number(room.property_type_id) === Number(selectedPropertyTypeId);

      return matchesProvince && matchesWard && matchesKeyword && matchesPropertyType;
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
  }, [rooms, selectedProvince, selectedWard, keyword, sortBy, selectedPropertyTypeId]);

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
            {selectedWard?.name ? ` - ${selectedWard.name}` : ""}
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
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl p-4 sm:px-6 lg:px-8">
        <section className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Filter className="h-5 w-5 text-sky-600" />
              Lọc theo loại hình
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={selectedPropertyTypeId === null ? "default" : "outline"}
              className="rounded-full px-6 transition-all"
              onClick={() => setSelectedPropertyTypeId(null)}
            >
              Tất cả
            </Button>
            {propertyTypesData?.data?.map((type) => (
              <Button
                key={type.id}
                variant={selectedPropertyTypeId === type.id ? "default" : "outline"}
                className={`rounded-full px-6 transition-all ${
                  selectedPropertyTypeId === type.id ? "bg-sky-600 hover:bg-sky-700" : "hover:border-sky-300 hover:text-sky-600"
                }`}
                onClick={() => setSelectedPropertyTypeId(type.id)}
              >
                {type.name}
              </Button>
            ))}
          </div>
        </section>
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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white font-medium text-slate-700 shadow-sm transition-all hover:border-sky-400 focus:ring-sky-500/10">
                <div className="flex items-center gap-2">
                  <ArrowDownWideNarrow className="h-4 w-4 text-sky-500" />
                  <SelectValue placeholder="Sắp xếp theo" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                <SelectItem value="price_asc" className="rounded-xl">Giá thấp đến cao</SelectItem>
                <SelectItem value="price_desc" className="rounded-xl">Giá cao đến thấp</SelectItem>
                <SelectItem value="capacity_desc" className="rounded-xl">Sức chứa cao nhất</SelectItem>
              </SelectContent>
            </Select>
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
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300/70 bg-white/80 px-6 py-16 text-center">
            <SearchX className="mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900">Không tìm thấy phòng nào</h3>
            <p className="mt-1 text-slate-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn</p>
            <Button
              variant="outline"
              className="mt-6 rounded-xl"
              onClick={() => {
                setKeyword("");
                setSelectedPropertyTypeId(null);
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredRooms.map((room) => {
              const prices = JSON.parse(room.all_prices || "[]");
              const hasMonthlyPrice = prices.some((p: any) => p.unit === "month");
              const isHotel = room.property_type_name?.toLowerCase().includes("khách sạn") || room.property_type_name?.toLowerCase().includes("hotel");

              return (
                <Link key={room.id} to={ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", room.id.toString())} className="group h-full">
                  <Card className="h-full overflow-hidden border-slate-200 transition-all duration-300 hover:translate-y-[-4px] hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/10">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={room.room_image ? `${CLOUDINARY_HEADER_IMAGE_URL}${room.room_image}` : DEFAULT_ROOM_IMAGE}
                        alt={room.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite loop
                          target.src = DEFAULT_ROOM_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="absolute right-3 top-3 flex flex-col gap-2">
                        {hasMonthlyPrice && (
                          <Badge className={isHotel ? "bg-amber-500 hover:bg-amber-600" : "bg-sky-600 hover:bg-sky-700"}>
                            {isHotel ? "Ưu đãi ở dài hạn" : "Thuê dài hạn"}
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-white/95 text-slate-900 shadow-sm backdrop-blur-sm">
                          {room.property_type_name}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="flex flex-col p-4">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="line-clamp-1 flex-1 font-bold text-slate-800 transition-colors group-hover:text-sky-600">
                          {room.title}
                        </h3>
                      </div>

                      <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin className="h-4 w-4 shrink-0 text-sky-500" />
                          <span className="line-clamp-1">
                            {room.province_name} - {room.building_address}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Filter className="h-4 w-4 text-sky-500" />
                            {room.area}m²
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-sky-500" />
                            {room.people} người
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Giá từ</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-sky-600">{formatPrice(room.cheapest_daily_price)}</span>
                            <span className="text-xs font-medium text-slate-400">/đêm</span>
                          </div>
                        </div>
                        <Button className="rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-all hover:bg-sky-600">
                          Chi tiết
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};

export default RoomSearch;
