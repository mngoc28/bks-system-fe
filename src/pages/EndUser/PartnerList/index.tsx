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
  Building,
  ArrowRight,
  Info
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PROVINCES, ROUTERS } from "@/constant";
import { usePartnerQuery } from "@/hooks/EU/usePartnerQuery";
import { PublicHeader, PublicFooter } from "@/components/layout/Public";
import Breadcrumb from "@/components/common/Breadcrumb";

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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-bold text-slate-900 mb-2 uppercase">{t("common.loading_error")}</p>
                    <p className="text-slate-600 mb-6">{error.message}</p>
                    <Button onClick={() => window.location.reload()} className="rounded-full px-8 bg-sky-500 hover:bg-sky-600">
                      {t("common.retry", "Thử lại")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900">
            <PublicHeader />

            {/* 1. Breadcrumb Header */}
            <div className="bg-slate-50 border-b border-slate-100">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex flex-col gap-4">
                    <Breadcrumb
                        items={[
                            { label: t("breadcrumb.home"), href: "/" },
                            { label: t("public.newsList.breadcrumb", "Tin tức"), href: ROUTERS.PUBLIC_NEWS_LIST },
                            { label: provinceName }
                        ]}
                    />
                    <div className="space-y-1">
                      <p className="text-sky-600 font-bold text-sm uppercase tracking-widest">
                        {t("endUserPartners.hero_badge", "Danh mục đối tác")}
                      </p>
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                          {t("endUserPartners.hero_title", "Tìm kiếm các đơn vị quản lý vận hành tại")} {provinceName}
                      </h1>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
                
                {/* 2. Partner Grid (2-column) */}
                <section className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="p-6 border border-slate-100 rounded-3xl flex gap-6">
                            <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
                            <div className="flex-1 space-y-3">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))
                    ) : !hasPartners ? (
                        <div className="col-span-full text-center py-24 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm text-slate-400">
                                <Building2 className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">
                                {t("endUserPartners.no_partners_title", { province: provinceName })}
                            </h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                                {t("endUserPartners.no_partners_description", { province: provinceName })}
                            </p>
                            <Button asChild variant="outline" className="rounded-full border-slate-200 px-8 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-600 hover:font-bold">
                              <Link to={ROUTERS.PUBLIC_NEWS_LIST}>{t("endUserPartners.back_to_news", "Xem tin tức khác")}</Link>
                            </Button>
                        </div>
                    ) : (
                      partners.map((partner) => (
                        <Link 
                          key={partner.id} 
                          to={`${ROUTERS.PARTNER_DETAIL.replace(":partner_id", partner.id.toString())}`}
                          className="group p-6 bg-white border border-slate-100 rounded-3xl flex gap-6 items-center transition-all duration-300 hover:shadow-2xl hover:border-sky-200 hover:-translate-y-1"
                        >
                          <div className="h-20 w-20 bg-slate-50 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
                            {partner.image_1 ? (
                              <img src={partner.image_1} alt={partner.company_name} className="w-full h-full object-cover" />
                            ) : (
                              <Building className="h-8 w-8 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <h3 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                              {partner.company_name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                              <MapPin className="h-3.5 w-3.5 text-sky-500" />
                              <span className="truncate">{partner.address || "Địa chỉ chưa cập nhật"}</span>
                            </div>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 transition-all">
                            <ChevronRight className="h-6 w-6" />
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  
                  {hasPartners && (
                    <div className="text-center">
                      <Button variant="outline" className="rounded-full border-slate-100 bg-slate-50/50 px-10 h-14 font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                        {t("endUserPartners.view_all_link", "Xem danh sách các nhà cung cấp dịch vụ cho thuê nhà tại các khu vực khác...")}
                      </Button>
                    </div>
                  )}
                </section>

                {/* 3. Info Banner (Middle) */}
                <section className="bg-sky-50 rounded-[40px] px-8 py-10 md:px-12 flex flex-col md:flex-row items-center gap-8 border border-sky-100 shadow-sm">
                  <div className="h-24 w-24 bg-white rounded-3xl shadow-lg flex items-center justify-center text-sky-500 shrink-0">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <h3 className="text-xl font-black text-slate-900">
                      {t("endUserPartners.info_banner_title", "Trung tâm hỗ trợ và đối tác của BKS Business")}
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {t("endUserPartners.info_banner_sub", "Đăng ký và chuyển đến thông qua BKS Business, bạn chắc chắn sẽ nhận được điểm thưởng tương đương 3% tiền thuê nhà.")}
                    </p>
                  </div>
                  <Button className="rounded-full bg-sky-500 hover:bg-sky-600 px-8 h-14 font-black shadow-lg shadow-sky-200">
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
                      { id: 1, title: `Tìm kiếm căn hộ cho thuê theo tuần và theo tháng tại ${provinceName} bằng cách xem danh sách đẹp mắt...` },
                      { id: 2, title: `Thu hẹp phạm vi tìm kiếm của bạn và tìm kiếm căn hộ cho thuê theo tuần và theo tháng tại ${provinceName} trực tiếp trên bản đồ của chúng tôi.` },
                      { id: 3, title: `Tìm kiếm căn hộ cho thuê theo tuần và theo tháng tại ${provinceName} theo tuyến tàu và danh sách...` }
                    ].map((item) => (
                      <div key={item.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:border-sky-200 transition-colors">
                        <button 
                          onClick={() => toggleAccordion(item.id)}
                          className={`w-full px-6 py-5 flex items-center justify-between text-left transition-all ${openAccordion === item.id ? 'bg-sky-50 text-sky-700' : 'bg-white hover:bg-slate-50'}`}
                        >
                          <span className="font-bold text-sm md:text-base pr-4">{item.title}</span>
                          {openAccordion === item.id ? <ChevronDown className="h-5 w-5 shrink-0" /> : <ChevronRight className="h-5 w-5 shrink-0 text-slate-300" />}
                        </button>
                        {openAccordion === item.id && (
                          <div className="px-8 py-6 bg-white border-t border-sky-100 text-slate-600 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300 font-medium">
                            {t("endUserPartners.accordion_content", "Chúng tôi cung cấp giải pháp lọc thông tin chi tiết giúp bạn nhanh chóng tìm được các đối tác đáp ứng đúng nhu cầu lưu trú của mình. Hãy lựa chọn phương thức tìm kiếm phù hợp nhất ở trên.")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5. Features Section (3 columns) */}
                <section className="space-y-12">
                  <h2 className="text-2xl font-black text-slate-900 text-center">
                    {t("endUserPartners.features_title", "Đặc điểm của các căn hộ cho thuê hàng tháng")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                      { 
                        icon: <ShieldCheck className="h-8 w-8 text-sky-500" />, 
                        title: "Không cần đặt hàng trước hay tiền giữ chỗ!",
                        desc: "Khác với việc thuê nhà truyền thống bình thường, căn hộ cho thuê ngắn hạn không yêu cầu phí môi giới, tiền lót tay trước hay các chi phí chuyển đến đắt đỏ."
                      },
                      { 
                        icon: <Building2 className="h-8 w-8 text-sky-500" />, 
                        title: "Đồ đạc và thiết hỗ trợ đầy đủ đã được lắp đặt sẵn.",
                        desc: "Các phòng đều được trang bị đầy đủ nội thất (giường, tủ lạnh, tivi, máy giặt,...) giúp bạn có thể chuyển vào ở ngay chỉ với các đồ dùng cá nhân tối thiểu."
                      },
                      { 
                        icon: <CreditCard className="h-8 w-8 text-sky-500" />, 
                        title: "Tiền thuê nhà có thể được thanh toán linh hoạt!",
                        desc: "Tiền thuê căn hộ ngắn hạn có thể thanh toán theo từng giai đoạn hoặc thông qua thẻ tín dụng giúp công ty quản lý tài chính dễ dàng."
                      }
                    ].map((feature, idx) => (
                      <div key={idx} className="space-y-6 text-center group">
                        <div className="mx-auto h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center group-hover:bg-sky-50 group-hover:text-white transition-all duration-300 shadow-sm">
                          {feature.icon}
                        </div>
                        <div className="space-y-3">
                          <h4 className="font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">{feature.title}</h4>
                          <p className="text-slate-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 6. CTA Section with Background Image */}
                <section className="relative rounded-[40px] overflow-hidden bg-slate-900 text-white shadow-2xl">
                  <div className="absolute inset-0">
                    <img 
                      src="https://images.unsplash.com/photo-1497366750644-64e526279f53?q=80&w=2071&auto=format&fit=crop" 
                      alt="CTA Background" 
                      className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-900/40" />
                  </div>
                  
                  <div className="relative px-8 py-16 md:px-16 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sky-300 text-xs font-black uppercase tracking-widest border border-white/5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                        </span>
                        Bạn cần hỗ trợ?
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black leading-tight">
                        Chỉ cần cho chúng tôi biết các điều kiện mong muốn của bạn để nhận báo giá chi tiết và kiểm tra chỗ trống.
                      </h2>
                      <p className="text-slate-300 text-lg md:text-xl font-medium">
                        Chúng tôi sẽ giúp bạn tìm kiếm các phương án tốt nhất từ danh sách hơn 3.000 phòng trên toàn quốc.
                      </p>
                    </div>
                    <div className="shrink-0 space-y-4">
                      <Button className="rounded-full bg-white text-slate-900 hover:bg-sky-50 px-10 h-16 font-black text-lg shadow-xl flex items-center gap-2 group">
                        {t("common.contact_us", "Liên hệ hỗ trợ ngay")}
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </Button>
                      <p className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest">{t("common.response_time", "Phản hồi trong 24h")}</p>
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
