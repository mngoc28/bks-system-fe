import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { 
  Building2, 
  MapPin, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  ShieldCheck, 
  CreditCard,
  ArrowRight,
  Info,
  Star
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CLOUDINARY_HEADER_IMAGE_URL, PROVINCES, ROUTERS } from "@/constant";
import { usePartnerQuery } from "@/hooks/EU/usePartnerQuery";
import { PublicHeader, PublicFooter } from "@/components/layout/Public";
import Breadcrumb from "@/components/common/Breadcrumb";
import { resolveImageUrl } from "@/utils/imageUtils";

const getProvinceHeroImage = (provinceName: string | undefined): string => {
  if (!provinceName) return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80"; // Luxury resort default

  const name = provinceName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (name.includes("da nang")) {
    return "https://images.unsplash.com/photo-1559592442-7486a0952042?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("ha noi")) {
    return "https://images.unsplash.com/photo-1509060464153-44667396260f?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("ho chi minh") || name.includes("sai gon")) {
    return "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("quang ninh") || name.includes("ha long")) {
    return "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("nha trang") || name.includes("khanh hoa")) {
    return "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("lam dong") || name.includes("da lat")) {
    return "https://images.unsplash.com/photo-1583002621936-e82a0134ba44?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("lao cai") || name.includes("sa pa") || name.includes("sapa")) {
    return "https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=1600&q=80";
  }
  if (name.includes("phu quoc") || name.includes("kien giang")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80";
  }

  return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80";
};

const PartnerList = () => {
    const { t } = useTranslation();
    const { provinceNameEn } = useParams<{ provinceNameEn: string }>();
    const [openAccordion, setOpenAccordion] = useState<number | null>(null);

    const province = PROVINCES.find(p => p.name_en === provinceNameEn);
    const provinceId = province?.id || 0;
    const provinceName = province?.name || t("common.unknown_province");

    const { data: partners = [], isLoading, error } = usePartnerQuery(provinceId);
    const hasPartners = Array.isArray(partners) && partners.length > 0;

    const toggleAccordion = (id: number) => {
      setOpenAccordion(openAccordion === id ? null : id);
    };

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <Info className="size-8" />
                    </div>
                    <p className="mb-2 text-lg font-bold uppercase text-slate-900">{t("common.loading_error")}</p>
                    <p className="mb-6 text-slate-600">{error.message}</p>
                    <Button onClick={() => window.location.reload()} className="rounded-full bg-primary px-8 shadow-lg shadow-primary/20 hover:bg-primary-hover">
                      {t("common.retry", "Thử lại")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <PublicHeader />

            {/* 1. Hero Section — Premium 2-column with background image and premium overlay */}
            <section className="relative isolate overflow-hidden bg-slate-950 py-12 text-white">
                {/* Background Image with elegant overlay */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                  <img
                    src={getProvinceHeroImage(provinceName)}
                    alt={provinceName || "Background"}
                    className="absolute inset-0 size-full object-cover opacity-60 transition-all duration-700 scale-105"
                  />
                  {/* Lighter gradients for elite readability on the left and balanced visibility/tint on the right */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-slate-950/20" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />
                </div>

                {/* Ambient glows */}
                <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl" />
                <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

                {/* Coordinate grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Glowing floating dots */}
                <div className="absolute top-12 right-1/4 h-2 w-2 rounded-full bg-sky-400/40 animate-ping pointer-events-none" />
                <div className="absolute bottom-16 left-1/4 h-3 w-3 rounded-full bg-indigo-400/30 animate-pulse pointer-events-none" />

                <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
                    {/* LEFT — 3/5 */}
                    <div className="lg:col-span-3">
                        {/* Badge */}
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-sm font-semibold text-sky-300">
                            <Building2 className="size-4" />
                            {t("endUserPartners.hero_badge", "Đối tác lưu trú")}
                        </div>

                        {/* Title */}
                        <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                            {t("endUserPartners.hero_title", "Đối tác lưu trú tại")}{" "}
                            <span className="text-sky-400">{provinceName}</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
                            {t("endUserPartners.hero_sub", "Khám phá các đơn vị quản lý lưu trú uy tín đang hoạt động tại khu vực này. Chọn đối tác phù hợp để xem danh sách phòng và đặt chỗ ngay.")}
                        </p>

                        {/* Stat cards */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                                <Building2 className="size-5 text-sky-400" />
                                <div>
                                    <div className="text-lg font-bold text-white">
                                        {isLoading ? "—" : partners.length > 0 ? (partners.length >= 100 ? `${Math.floor(partners.length / 10) * 10}+` : `${partners.length}`) : "0"}
                                    </div>
                                    <div className="text-xs text-slate-400">Đối tác</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                                <MapPin className="size-5 text-emerald-400" />
                                <div>
                                    <div className="text-lg font-bold text-white">{provinceName}</div>
                                    <div className="text-xs text-slate-400">Khu vực</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — 2/5 */}
                    <div className="hidden lg:col-span-2 lg:block">
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-sky-300">Tại sao chọn BKS?</p>
                            <ul className="space-y-3 text-sm text-slate-300">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-400" />
                                    Đối tác được xác minh và đánh giá bởi hàng nghìn người dùng
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-400" />
                                    Đặt phòng trực tiếp, không qua trung gian
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sky-400" />
                                    Tích điểm 3% mỗi giao dịch với BKS Business
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Breadcrumb below hero */}
            <div className="border-b border-slate-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <Breadcrumb
                        items={[
                            { label: t("breadcrumb.home"), href: "/" },
                            { label: t("public.newsList.breadcrumb", "Tin tức"), href: ROUTERS.PUBLIC_NEWS_LIST },
                            { label: provinceName }
                        ]}
                    />
                </div>
            </div>

            <main className="mx-auto max-w-7xl space-y-16 px-4 py-12 sm:px-6 lg:px-8">
                
                {/* 2. Partner Grid (2-column) */}
                <section className="space-y-8">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex gap-6 rounded-3xl border border-slate-100 p-6">
                            <Skeleton className="size-20 shrink-0 rounded-2xl" />
                            <div className="flex-1 space-y-3">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))
                    ) : !hasPartners ? (
                        <div className="col-span-full rounded-[40px] border-2 border-dashed border-slate-200 bg-slate-50 py-24 text-center">
                            <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                                <Building2 className="size-10" />
                            </div>
                            <h3 className="mb-2 text-xl font-black text-slate-900">
                                {t("endUserPartners.no_partners_title", { province: provinceName })}
                            </h3>
                            <p className="mx-auto mb-8 max-w-md font-medium text-slate-500">
                                {t("endUserPartners.no_partners_description", { province: provinceName })}
                            </p>
                            <Button asChild variant="outline" className="rounded-full border-slate-200 px-8 hover:border-primary/40 hover:bg-primary-light hover:font-bold hover:text-primary">
                              <Link to={ROUTERS.PUBLIC_NEWS_LIST}>{t("endUserPartners.back_to_news", "Xem tin tức khác")}</Link>
                            </Button>
                        </div>
                    ) : (
                      partners.map((partner) => {
                        const imageUrl = resolveImageUrl(partner.image_1, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });

                        return (
                          <Link 
                            key={partner.id} 
                            to={`${ROUTERS.PARTNER_DETAIL.replace(":partner_id", partner.id.toString())}`}
                            className="group flex items-center gap-6 rounded-3xl border border-slate-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-2xl"
                          >
                            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={partner.company_name}
                                  className="size-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/assets/images/photo_error2.png";
                                    e.currentTarget.className = "size-full object-contain p-2 bg-slate-50 opacity-60";
                                  }}
                                />
                              ) : (
                                <Building2 className="size-8 text-slate-300" />
                              )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                              <h3 className="truncate text-lg font-black text-slate-900 transition-colors group-hover:text-primary">
                                {partner.company_name}
                              </h3>
                              {partner.reviews_avg_rating && Number(partner.reviews_avg_rating) > 0 ? (
                                <div className="flex items-center gap-1 text-[0.75rem] font-bold text-amber-500">
                                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                                  <span>{partner.reviews_avg_rating}</span>
                                  <span className="text-slate-400 font-normal">({partner.reviews_count} đánh giá)</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-[0.75rem] text-slate-400">
                                  <Star className="size-3.5 text-slate-300" />
                                  <span className="font-normal text-slate-400">Chưa có đánh giá</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                                <MapPin className="size-3.5 text-primary" />
                                <span className="truncate">{partner.address || "Địa chỉ chưa cập nhật"}</span>
                              </div>
                            </div>
                            <div className="flex size-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all group-hover:bg-primary-light group-hover:text-primary">
                              <ChevronRight className="size-6" />
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                  
                  {hasPartners && (
                    <div className="text-center">
                      <Button variant="outline" className="h-14 rounded-full border-slate-100 bg-slate-50/50 px-10 font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                        {t("endUserPartners.view_all_link", "Xem danh sách các nhà cung cấp dịch vụ cho thuê nhà tại các khu vực khác...")}
                      </Button>
                    </div>
                  )}
                </section>

                {/* 3. Info Banner (Middle) */}
                <section className="flex flex-col items-center gap-8 rounded-[40px] border border-primary/10 bg-primary-light px-8 py-10 shadow-sm md:flex-row md:px-12">
                  <div className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-white text-primary shadow-lg">
                    <CheckCircle2 className="size-12" />
                  </div>
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900">
                      {t("endUserPartners.info_banner_title", "Trung tâm hỗ trợ và đối tác của BKS Business")}
                    </h3>
                    <p className="font-medium leading-relaxed text-slate-600">
                      {t("endUserPartners.info_banner_sub", "Đăng ký và chuyển đến thông qua BKS Business, bạn chắc chắn sẽ nhận được điểm thưởng tương đương 3% tiền thuê nhà.")}
                    </p>
                  </div>
                  <Button className="h-14 rounded-full bg-primary px-8 font-black shadow-lg shadow-primary/20 hover:bg-primary-hover">
                    {t("endUserPartners.info_banner_cta", "Về dịch vụ tích điểm")}
                  </Button>
                </section>

                {/* 4. Accordion Section (Regional Info) */}
                <section className="space-y-6">
                  <h2 className="text-2xl font-black text-slate-900">
                    {t("endUserPartners.accordion_title", `Tìm kiếm thông tin theo khu vực tại ${provinceName}`)}
                  </h2>
                  <div className="space-y-3">
                    {[
                      { id: 1, title: `Tìm kiếm căn hộ / căn hộ dịch vụ lưu trú ngắn và trung hạn tại ${provinceName} bằng cách xem danh sách đẹp mắt...` },
                      { id: 2, title: `Thu hẹp phạm vi tìm kiếm của bạn và khám phá căn hộ / căn hộ dịch vụ lưu trú ngắn và trung hạn tại ${provinceName} trực tiếp trên bản đồ của chúng tôi.` },
                      { id: 3, title: `Tìm kiếm căn hộ / căn hộ dịch vụ lưu trú ngắn và trung hạn tại ${provinceName} theo tuyến tàu và danh sách...` }
                    ].map((item) => (
                      <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-100 transition-colors hover:border-primary/20">
                        <button 
                          onClick={() => toggleAccordion(item.id)}
                          className={`flex w-full items-center justify-between px-6 py-5 text-left transition-all ${openAccordion === item.id ? 'bg-primary-light text-primary' : 'bg-white hover:bg-slate-50'}`}
                        >
                          <span className="pr-4 text-sm font-bold md:text-base">{item.title}</span>
                          {openAccordion === item.id ? <ChevronDown className="size-5 shrink-0" /> : <ChevronRight className="size-5 shrink-0 text-slate-300" />}
                        </button>
                        {openAccordion === item.id && (
                          <div className="border-t border-primary/10 bg-white px-8 py-6 text-sm font-medium leading-relaxed text-slate-600 duration-300 animate-in fade-in slide-in-from-top-2">
                            {t("endUserPartners.accordion_content", "Chúng tôi cung cấp giải pháp lọc thông tin chi tiết giúp bạn nhanh chóng tìm được các đối tác đáp ứng đúng nhu cầu lưu trú của mình. Hãy lựa chọn phương thức tìm kiếm phù hợp nhất ở trên.")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5. Features Section (3 columns) */}
                <section className="space-y-12">
                  <h2 className="text-center text-2xl font-black text-slate-900">
                    {t("endUserPartners.features_title", "Đặc điểm của các căn hộ cho thuê hàng tháng")}
                  </h2>
                  <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                    {[
                      { 
                        icon: <ShieldCheck className="size-8 text-primary" />, 
                        title: "Không cần đặt hàng trước hay tiền giữ chỗ!",
                        desc: "Khác với việc thuê nhà truyền thống bình thường, căn hộ cho thuê ngắn hạn không yêu cầu phí môi giới, tiền lót tay trước hay các chi phí chuyển đến đắt đỏ."
                      },
                      { 
                        icon: <Building2 className="size-8 text-primary" />, 
                        title: "Đồ đạc và thiết hỗ trợ đầy đủ đã được lắp đặt sẵn.",
                        desc: "Các phòng đều được trang bị đầy đủ nội thất (giường, tủ lạnh, tivi, máy giặt,...) giúp bạn có thể chuyển vào ở ngay chỉ với các đồ dùng cá nhân tối thiểu."
                      },
                      { 
                        icon: <CreditCard className="size-8 text-primary" />, 
                        title: "Tiền thuê nhà có thể được thanh toán linh hoạt!",
                        desc: "Tiền thuê căn hộ ngắn hạn có thể thanh toán theo từng giai đoạn hoặc thông qua thẻ tín dụng giúp công ty quản lý tài chính dễ dàng."
                      }
                    ].map((feature, idx) => (
                      <div key={idx} className="group space-y-6 text-center">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-slate-50 shadow-sm transition-all duration-300 group-hover:bg-primary-light group-hover:text-white">
                          {feature.icon}
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-primary">{feature.title}</h4>
                          <p className="text-sm font-medium leading-relaxed text-slate-500">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 6. CTA Section with Background Image */}
                <section className="relative overflow-hidden rounded-[40px] bg-slate-900 text-white shadow-2xl">
                  <div className="absolute inset-0">
                    <img 
                      src="https://images.unsplash.com/photo-1497366750644-64e526279f53?q=80&w=2071&auto=format&fit=crop" 
                      alt="CTA Background" 
                      className="size-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-primary/40" />
                  </div>
                  
                  <div className="relative flex flex-col items-center gap-12 px-8 py-16 md:flex-row md:px-16">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary-light">
                        <span className="relative flex size-2">
                          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-light opacity-75"></span>
                          <span className="relative inline-flex size-2 rounded-full bg-primary-light"></span>
                        </span>
                        Bạn cần hỗ trợ?
                      </div>
                      <h2 className="text-3xl font-black leading-tight md:text-5xl">
                        Chỉ cần cho chúng tôi biết các điều kiện mong muốn của bạn để nhận báo giá chi tiết và kiểm tra chỗ trống.
                      </h2>
                      <p className="text-lg font-medium text-slate-300 md:text-xl">
                        Chúng tôi sẽ giúp bạn tìm kiếm các phương án tốt nhất từ danh sách hơn 3.000 phòng trên toàn quốc.
                      </p>
                    </div>
                    <div className="shrink-0 space-y-4">
                      <Button className="group flex h-16 items-center gap-2 rounded-full bg-white px-10 text-lg font-black text-slate-900 shadow-xl hover:bg-primary-light">
                        {t("common.contact_us", "Liên hệ hỗ trợ ngay")}
                        <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                      <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400">{t("common.response_time", "Phản hồi trong 24h")}</p>
                    </div>
                  </div>
                </section>

                <div className="h-10" />
            </main>

            <PublicFooter />
        </div>
    );
};

export default PartnerList;

