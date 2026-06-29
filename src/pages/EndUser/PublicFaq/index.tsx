import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  ShieldCheck,
  Phone,
  Mail,
  MessageCircle,
  Key,
  Wifi,
  CreditCard,
  Star,
  MapPin,
  CalendarX,
  Clock,
  BadgeCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { toastSuccess } from "@/components/ui/toast";
import { PublicFooter, PublicHeader } from "@/components/layout/Public";

type FaqCategoryKey = "all" | "booking" | "payment" | "cancellation" | "account" | "inRoom";

const CATEGORY_KEYS: FaqCategoryKey[] = ["all", "booking", "payment", "cancellation", "account", "inRoom"];

const LEGACY_CATEGORY_MAP: Record<string, FaqCategoryKey> = {
  "Tất cả": "all",
  "Đặt phòng": "booking",
  "Thanh toán": "payment",
  "Hủy phòng": "cancellation",
  "Tài khoản & Bảo mật": "account",
  "Dịch vụ tại phòng": "inRoom",
};

const FAQ_META: { id: string; categoryKey: Exclude<FaqCategoryKey, "all">; Icon: LucideIcon }[] = [
  { id: "faq-booking-1", categoryKey: "booking", Icon: BadgeCheck },
  { id: "faq-booking-2", categoryKey: "booking", Icon: Star },
  { id: "faq-booking-3", categoryKey: "booking", Icon: Clock },
  { id: "faq-cancel-1", categoryKey: "cancellation", Icon: CalendarX },
  { id: "faq-cancel-2", categoryKey: "cancellation", Icon: CreditCard },
  { id: "faq-payment-1", categoryKey: "payment", Icon: CreditCard },
  { id: "faq-payment-2", categoryKey: "payment", Icon: Zap },
  { id: "faq-account-1", categoryKey: "account", Icon: Key },
  { id: "faq-account-2", categoryKey: "account", Icon: ShieldCheck },
  { id: "faq-service-1", categoryKey: "inRoom", Icon: Wifi },
  { id: "faq-service-2", categoryKey: "inRoom", Icon: MapPin },
];

const resolveCategoryFromParam = (param: string | null): FaqCategoryKey => {
  if (!param) {
    return "all";
  }

  if (CATEGORY_KEYS.includes(param as FaqCategoryKey)) {
    return param as FaqCategoryKey;
  }

  return LEGACY_CATEGORY_MAP[param] ?? "all";
};

const PublicFaq = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FaqCategoryKey>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    setActiveCategory(resolveCategoryFromParam(categoryParam));
  }, [searchParams]);

  const faqs = useMemo(
    () =>
      FAQ_META.map(({ id, categoryKey, Icon }) => ({
        id,
        categoryKey,
        question: t(`public.faq.items.${id}.question`),
        answer: t(`public.faq.items.${id}.answer`),
        icon: <Icon className="size-4 text-indigo-500" />,
      })),
    [t],
  );

  const filtered = faqs.filter((faq) => {
    const matchSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = activeCategory === "all" || faq.categoryKey === activeCategory;
    return matchSearch && matchCategory;
  });

  const openChatbot = () => {
    window.dispatchEvent(new CustomEvent("open-public-chatbot"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <PublicHeader />
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.35),transparent)]" />
        <div className="relative mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-300 backdrop-blur-sm">
            <HelpCircle className="size-3.5" />
            {t("public.faq.hero.badge")}
          </div>
          <h1 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
            {t("public.faq.hero.title")}
          </h1>
          <p className="mb-8 text-base text-indigo-200/80">
            {t("public.faq.hero.subtitle")}
          </p>

          <div className="relative mx-auto max-w-xl">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("public.faq.hero.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-13 w-full rounded-2xl border border-white/10 bg-white/10 py-3.5 pl-11 pr-5 text-sm text-white placeholder-white/40 backdrop-blur-md transition-all focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORY_KEYS.map((categoryKey) => (
            <button
              key={categoryKey}
              type="button"
              onClick={() => setActiveCategory(categoryKey)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                activeCategory === categoryKey
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "border border-slate-100 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {t(`public.faq.categories.${categoryKey}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {filtered.length > 0 ? (
              <div className="space-y-3">
                {filtered.map((faq) => (
                  <div
                    key={faq.id}
                    className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                      className={`flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-colors ${
                        openId === faq.id ? "bg-indigo-50/60" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                          {faq.icon}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{faq.question}</span>
                      </div>
                      {openId === faq.id ? (
                        <ChevronDown className="size-4 shrink-0 text-indigo-500" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-slate-300" />
                      )}
                    </button>
                    {openId === faq.id && (
                      <div className="border-t border-indigo-100/60 bg-indigo-50/30 px-6 pb-5 pt-4 text-sm leading-relaxed text-slate-500 duration-200 animate-in fade-in slide-in-from-top-2">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
                <HelpCircle className="mb-3 size-10 text-slate-200" />
                <p className="font-semibold text-slate-400">{t("public.faq.hero.noResults")}</p>
                <p className="mt-1 text-sm text-slate-400">{t("public.faq.hero.noResultsHint")}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col items-center gap-4 rounded-[28px] bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white sm:flex-row">
              <div className="rounded-2xl bg-white/10 p-3">
                <MessageCircle className="size-8" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-black">{t("public.faq.hero.chatCtaTitle")}</p>
                <p className="text-sm text-indigo-200">{t("public.faq.hero.chatCtaSubtitle")}</p>
              </div>
              <Button
                onClick={openChatbot}
                className="shrink-0 rounded-xl bg-white px-6 font-bold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 active:scale-95"
              >
                {t("public.faq.hero.chatCtaButton")}
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="px-1 text-lg font-black text-slate-900">{t("public.faq.contact.title")}</h3>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("0333494850");
                toastSuccess(t("public.faq.contact.hotlineCopied"));
              }}
              className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:border-rose-200 hover:shadow-md"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition-colors group-hover:bg-rose-100">
                <Phone className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t("public.faq.contact.hotlineLabel")}
                </p>
                <p className="text-lg font-black text-slate-900">{t("public.faq.contact.hotlineNumber")}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText("stay@bks.vn");
                toastSuccess(t("public.faq.contact.emailCopied"));
              }}
              className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-sm transition-all hover:border-sky-200 hover:shadow-md"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-100">
                <Mail className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {t("public.faq.contact.emailLabel")}
                </p>
                <p className="text-lg font-black text-slate-900">{t("public.faq.contact.emailValue")}</p>
              </div>
            </button>

            <div className="rounded-2xl bg-slate-900 p-5 text-white">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-bold">
                <ShieldCheck className="size-4 text-indigo-400" />
                {t("public.faq.contact.commitmentTitle")}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-xs text-slate-400">
                  <Clock className="mt-0.5 size-3.5 shrink-0 text-indigo-400" />
                  {t("public.faq.contact.commitmentSupport")}
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-400">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-indigo-400" />
                  {t("public.faq.contact.commitmentOffices")}
                </li>
                <li className="flex items-start gap-2.5 text-xs text-slate-400">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-indigo-400" />
                  {t("public.faq.contact.commitmentSecurity")}
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                {t("public.faq.contact.partnerPrompt")}
              </p>
              <Link
                to="/become-a-partner"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
              >
                {t("public.faq.contact.partnerLink")}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <PublicFooter />
    </div>
  );
};

export default PublicFaq;
