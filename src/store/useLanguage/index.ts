import Cookies from "js-cookie";
import { create } from "zustand";

const COOKIE_KEY = "horizon-study-lang";
const FALLBACK_LANGUAGE = "vi";
const SUPPORTED_LANGUAGES = ["vi", "en"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const normalizeLanguage = (rawLanguage?: string | null): SupportedLanguage => {
  if (!rawLanguage) {
    return FALLBACK_LANGUAGE;
  }

  const mapped = rawLanguage.toLowerCase();
  return (SUPPORTED_LANGUAGES as ReadonlyArray<string>).includes(mapped) ? (mapped as SupportedLanguage) : FALLBACK_LANGUAGE;
};

// Helper function to get language from cookies
export const getLanguageStorage = () => {
  const stored = Cookies.get(COOKIE_KEY);
  const normalized = normalizeLanguage(stored);

  if (stored !== normalized) {
    Cookies.set(COOKIE_KEY, normalized, { expires: 7 });
  }

  return normalized;
};

// Helper function to set language in cookies
const setLanguageStorage = (lang: string) => {
  const normalized = normalizeLanguage(lang);
  Cookies.set(COOKIE_KEY, normalized, { expires: 7 });
};

export type RootState = {
  lang: SupportedLanguage;
};

// Define actions for the store
type Actions = {
  setLanguage: (lang: string) => void;
  unSetLanguage: () => void;
};

// Create the Zustand store
const useLanguage = create<RootState & Actions>((set) => ({
  lang: getLanguageStorage(),
  setLanguage: (lang) => {
    const normalized = normalizeLanguage(lang);
    set(() => ({ lang: normalized }));
    setLanguageStorage(normalized);
  },
  unSetLanguage: () => {
    set(() => ({ lang: FALLBACK_LANGUAGE }));
    setLanguageStorage(FALLBACK_LANGUAGE);
  },
}));

export default useLanguage;
