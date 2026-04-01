import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import { ContactCardProps } from "../type";

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
  ctaHref = ROUTERS.CONTACT,
}: ContactCardProps) => {
  const { t } = useTranslation();

  const eyebrowText = eyebrow ?? t("public.contactCard.eyebrow");
  const titleText = title ?? t("public.contactCard.title");
  const descriptionText = description ?? t("public.contactCard.description");
  const hotlineLabelText = hotlineLabel ?? t("public.contactCard.hotlineLabel");
  const hotlineValue = hotline ?? t("public.contactCard.hotlineValue");
  const emailLabelText = emailLabel ?? t("public.contactCard.emailLabel");
  const emailValue = email ?? t("public.contactCard.emailValue");
  const ctaText = ctaLabel ?? t("public.contactCard.cta");

  return (
    <section className={className}>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-slate-100 p-8 shadow-sm md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              {eyebrowText}
            </span>
            <h2 className="text-[1.9rem] font-semibold text-slate-900 md:text-[2.25rem]">{titleText}</h2>
            <p className="text-sm leading-6 text-slate-600 md:text-base">{descriptionText}</p>
            <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-semibold text-slate-900">{hotlineLabelText}:</span>
                <span>{hotlineValue}</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-semibold text-slate-900">{emailLabelText}:</span>
                <span>{emailValue}</span>
              </div>
            </div>
          </div>

          <Link
            to={ctaHref}
            className="group inline-flex flex-shrink-0 items-center justify-center rounded-2xl bg-primary px-7 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 hover:translate-y-[-2px] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactCard;
