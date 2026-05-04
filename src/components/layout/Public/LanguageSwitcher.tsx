import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useLanguage from "@/store/useLanguage";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { LANGUAGE_OPTIONS } from "@/constant";

export interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { lang, setLanguage } = useLanguage();
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Handle language selection
  const handleSelectChange = (nextLanguage: string) => {
    setLanguage(nextLanguage);
  };

  useEffect(() => {
    if (lang && lang !== i18n.language) {
      void i18n.changeLanguage(lang);
    }
  }, [i18n, lang]);

  // Get the currently active language option
  const activeLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((option) => option.value === lang) ?? LANGUAGE_OPTIONS[0],
    [lang],
  );
  const renderLabel = (value: string) => t(`language.options.${value}`, value.toUpperCase());

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickAway = (event: MouseEvent) => {
      if (
        open &&
        event.target instanceof Node &&
        !triggerRef.current?.contains(event.target) &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [open]);

  // Toggle dropdown open state
  const toggleOpen = () => setOpen((prev) => !prev);

  // Handle language selection
  const selectLanguage = (value: string) => {
    handleSelectChange(value);
    setOpen(false);
  };

  return (
    <div className={cn("relative inline-flex shrink-0 flex-col text-sm text-slate-600", className)}>
      <span className="sr-only">{t("language.label", "Language")}</span>
      <button
        type="button"
        ref={triggerRef}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex h-9 w-36 items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-3 text-[11px] font-semibold uppercase text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
      >
        <span className="flex items-center gap-1.5">
          <img
            src={`/app/images/front/flag-${activeLanguage.flag}.svg`}
            alt={renderLabel(activeLanguage.value)}
            className="h-4 w-6 rounded-sm object-cover"
          />
          <span className="text-[11px] tracking-wide">{renderLabel(activeLanguage.value)}</span>
        </span>
        <ChevronDown className="size-3.5 text-slate-500" strokeWidth={2} />
      </button>
      {open ? (
        <div
          ref={dropdownRef}
          role="listbox"
          aria-activedescendant={`language-${activeLanguage.value}`}
          className="absolute right-0 top-[110%] z-[140] w-36 overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm"
        >
          <ul className="flex flex-col py-1 text-[0.7rem] font-semibold text-slate-700">
            {LANGUAGE_OPTIONS.map(({ value, flag }) => (
              <li key={value}>
                <button
                  type="button"
                  id={`language-${value}`}
                  onClick={() => selectLanguage(value)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-sky-50",
                    value === lang && "bg-sky-100 text-sky-700",
                  )}
                  role="option"
                  aria-selected={value === lang}
                >
                  <img
                    src={`/app/images/front/flag-${flag}.svg`}
                    alt={renderLabel(value)}
                    className="h-4 w-6 rounded-sm object-cover"
                  />
                  <span className="flex-1 text-[0.7rem] font-semibold leading-4 text-slate-700">
                    {renderLabel(value)}
                  </span>
                  {value === lang ? (
                    <span className="text-[0.65rem] font-bold text-sky-600">✓</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default LanguageSwitcher;
