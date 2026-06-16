import { useState } from "react";
import { Phone, Mail, MessageCircle, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ContactCardProps } from "../type";

/* ─── Zalo logomark (no background rect — styled via container) ── */
const ZaloMark = () => (
  <span className="relative flex size-4 shrink-0 items-center justify-center">
    <MessageCircle className="size-4" />
    <span
      className="absolute font-black tracking-tighter leading-none select-none text-current"
      style={{ fontSize: "7px", transform: "translateY(-0.5px)" }}
    >
      za
    </span>
  </span>
);

/* ─── Messenger logomark (no background rect) ─────────────────── */
const MessengerMark = () => (
  <span className="relative flex size-4 shrink-0 items-center justify-center">
    <MessageCircle className="size-4" />
    <svg
      viewBox="0 0 24 24"
      className="absolute size-2.5"
      fill="currentColor"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  </span>
);

/* ─── Copy-to-clipboard pill ──────────────────────────────────── */
function CopyableCard({
  icon,
  label,
  value,
  iconClass,
  bgClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClass: string;
  bgClass: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group inline-flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left shadow-sm ring-1 ring-slate-100 transition hover:ring-primary/40 hover:shadow-md"
    >
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${bgClass} ${iconClass}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
      <span className="ml-auto shrink-0 text-slate-300 transition group-hover:text-slate-500">
        {copied ? (
          <Check className="size-3.5 text-emerald-500" />
        ) : (
          <Copy className="size-3.5" />
        )}
      </span>
    </button>
  );
}

/* ─── External link pill (Zalo / Messenger) ──────────────────── */
function LinkCard({
  icon,
  label,
  value,
  href,
  iconClass,
  bgClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100 transition hover:ring-primary/40 hover:shadow-md"
    >
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${bgClass} ${iconClass}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </a>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
const ContactCard = ({
  className,
  eyebrow,
  title,
  description,
  hotlineLabel,
  hotline,
  emailLabel,
  email,
  ctaLabel,
}: ContactCardProps) => {
  const { t } = useTranslation();

  const eyebrowText   = eyebrow      ?? t("public.contactCard.eyebrow");
  const titleText     = title        ?? t("public.contactCard.title");
  const descText      = description  ?? t("public.contactCard.description");
  const hotlineLbl    = hotlineLabel ?? t("public.contactCard.hotlineLabel");
  const hotlineVal    = hotline      ?? t("public.contactCard.hotlineValue");
  const emailLbl      = emailLabel   ?? t("public.contactCard.emailLabel");
  const emailVal      = email        ?? t("public.contactCard.emailValue");
  const ctaText       = ctaLabel     ?? t("public.contactCard.cta");
  const zaloLbl       = t("public.contactCard.zaloLabel");
  const zaloVal       = t("public.contactCard.zaloValue");
  const fbLbl         = t("public.contactCard.facebookLabel");

  return (
    <section id="contact" className={className}>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-6 shadow-sm sm:p-8 md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

          {/* ── Left: copy + info ── */}
          <div className="max-w-2xl space-y-5">
            {/* Eyebrow */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-sky-500" />
              </span>
              {eyebrowText}
            </span>

            <h2 className="text-[1.75rem] font-bold leading-tight text-slate-900 md:text-[2.1rem]">
              {titleText}
            </h2>
            <p className="text-sm leading-6 text-slate-600 md:text-base">{descText}</p>

            {/* ── 2×2 channel grid ── */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {/* Hotline — copy */}
              <CopyableCard
                icon={<Phone className="size-4" />}
                label={hotlineLbl}
                value={hotlineVal}
                iconClass="text-primary"
                bgClass="bg-primary/10"
              />

              {/* Email — copy */}
              <CopyableCard
                icon={<Mail className="size-4" />}
                label={emailLbl}
                value={emailVal}
                iconClass="text-violet-500"
                bgClass="bg-violet-50"
              />

              {/* Zalo — external link */}
              <LinkCard
                icon={<ZaloMark />}
                label={zaloLbl}
                value={zaloVal}
                href={`https://zalo.me/${zaloVal.replace(/\s/g, "")}`}
                iconClass="text-blue-600"
                bgClass="bg-blue-50"
              />

              {/* Messenger — external link */}
              <LinkCard
                icon={<MessengerMark />}
                label={fbLbl}
                value="BKSStay"
                href="https://m.me/BKSStay"
                iconClass="text-blue-600"
                bgClass="bg-blue-50"
              />
            </div>
          </div>

          {/* ── Right: CTA ── */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-public-chatbot"))}
            className="group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-primary via-sky-600 to-sky-700 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-sky-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <MessageCircle className="size-4" />
            {ctaText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ContactCard;
