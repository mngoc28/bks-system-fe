import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { getLanguageStorage } from "@/store/useLanguage";
import enTranslation from "../locales/en.json";
import jaTranslation from "../locales/ja.json";
import viTranslation from "../locales/vi.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      vi: {
        translation: viTranslation,
      },
      ja: {
        translation: jaTranslation,
      },
    },
    lng: getLanguageStorage(),
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false,
    },
    ns: ["translation"],
    defaultNS: "translation",
  });

export default i18n;
