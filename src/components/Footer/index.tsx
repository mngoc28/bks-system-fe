import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const companyName = t("footer.company_name");
  const companyDescription = t("footer.company_description");
  const contactAddress = t("footer.contact_address");
  return (
    <footer className="flex w-full flex-row gap-6 bg-sky-900 px-[120px] py-6">
      {/* Left: Logo and company information */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Logo */}
        <div className="flex items-center">
          <img src="/assets/footer_logo.svg" alt="BKS Logo" className="h-10 w-10" aria-label="BKS Logo" tabIndex={0} />
        </div>

        {/* Company information */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-lg font-bold text-white">{companyName}</h3>
          <p className="text-justify text-base text-white">{companyDescription}</p>

          <h4 className="mt-1 text-base text-white">{t("footer.contact_address_label")}</h4>
          <p className="text-base text-white">{contactAddress}</p>

          <Link to="/terms" className="mt-1 text-base text-white hover:underline" tabIndex={0}>
            {t("footer.terms_of_service")}
          </Link>

          <Link to="/privacy" className="text-base text-white hover:underline" tabIndex={0}>
            {t("footer.privacy_policy")}
          </Link>
        </div>
      </div>

      {/* Right: Links */}
      <div className="flex flex-1 flex-row gap-6">
        <div className="flex flex-1 flex-col gap-1.5 pt-[72px]">
          <h3 className="text-lg font-bold text-white">{t("footer.support_learning")}</h3>

          <Link to="/forum" className="text-base text-white hover:underline" tabIndex={0}>
            {t("footer.forum")}
          </Link>

          <Link to="/library" className="text-base text-white hover:underline" tabIndex={0}>
            {t("footer.library")}
          </Link>

          <Link to="/tests" className="text-base text-white hover:underline" tabIndex={0}>
            {t("footer.tests")}
          </Link>
        </div>

        {/* Support */}
        <div className="flex flex-1 flex-col gap-1.5 pt-[72px]">
          <h3 className="text-lg font-bold text-white">{t("footer.help")}</h3>

          <Link to="/contact" className="text-base text-white hover:underline" tabIndex={0}>
            {t("footer.contact")}
          </Link>

          <Link to="/faq" className="text-base text-white hover:underline" tabIndex={0}>
            {t("footer.faq")}
          </Link>

          <Link to="/cookies" className="text-base text-white hover:underline" tabIndex={0}>
            {t("footer.cookies")}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
