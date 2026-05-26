import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useLanguage from "@/store/useLanguage";
import { cn } from "@/lib/utils";
import { LANGUAGE_OPTIONS } from "@/constant";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { lang, setLanguage } = useLanguage();
  const { t, i18n } = useTranslation();

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

  return (
    <div className={cn("inline-flex shrink-0 flex-col text-sm text-slate-600", className)}>
      <span className="sr-only">{t("language.label", "Language")}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-36 items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <img
                src={`/app/images/front/flag-${activeLanguage.flag}.svg`}
                alt={renderLabel(activeLanguage.value)}
                className="h-4 w-6 rounded-sm object-cover"
              />
              <span className="truncate text-[11px] tracking-wide">{renderLabel(activeLanguage.value)}</span>
            </span>
            <ChevronDown className="size-3.5 shrink-0 text-slate-500" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} className="w-44 rounded-2xl border-slate-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm">
          {LANGUAGE_OPTIONS.map(({ value, flag }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => handleSelectChange(value)}
              className={cn(
                "mb-1 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-sky-50 focus:bg-sky-50 last:mb-0",
                value === lang && "bg-sky-50 text-sky-700",
              )}
            >
              <img
                src={`/app/images/front/flag-${flag}.svg`}
                alt={renderLabel(value)}
                className="h-4 w-6 shrink-0 rounded-sm object-cover"
              />
              <span className="flex-1">{renderLabel(value)}</span>
              {value === lang ? (
                <Check className="size-4 shrink-0 text-sky-600" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default LanguageSwitcher;
