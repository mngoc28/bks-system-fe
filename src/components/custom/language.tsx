import * as React from "react";
import { cn } from "@/lib/utils";
import useLanguage from "@/store/useLanguage";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@radix-ui/react-select";
import { SelectValue } from "../ui/select";

const LanguageOptions: string[] = ["vi", "en"];

const Language = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    const { lang, setLanguage } = useLanguage();
    const { i18n } = useTranslation();
    const { t } = useTranslation();
    const handleLanguageChange = (language: string) => {
      setLanguage(language);
      i18n.changeLanguage(language);
    };

    return (
      <div
        className={cn(
          `flex h-9 w-fit bg-transparent text-base transition-colors
          file:bg-transparent file:text-sm file:font-medium file:text-foreground
          placeholder:text-muted-foreground
          focus-visible:outline focus-visible:ring-1 focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`,
          className
        )}
        ref={ref}
        {...props}
      >
        <Select
          value={lang}
          onValueChange={(value) => handleLanguageChange(value)}
        >
          <div className="flex w-fit items-center justify-center">
            <SelectTrigger className="mb-0 flex h-auto w-full flex-row items-center justify-center">
              <SelectValue>
                <div className="flex flex-row items-center justify-center px-2">
                  <img
                    src={`/app/images/front/flag-${lang}.svg`}
                    alt={lang}
                    className="w-[2em] shadow-md lg:w-[3em]"
                  />
                  <span className="ms-2 hidden text-nowrap font-bold lg:inline">
                    {t(`lang-${lang}`)}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="relative top-[var(--header-height)] h-fit w-max border">
              <SelectGroup className="w-full bg-white pb-2">
                {LanguageOptions.map((lang) => (
                  <SelectItem
                    value={lang}
                    key={lang}
                    className="font-shingo w-full cursor-pointer text-center hover:bg-dark-300"
                  >
                    <div className="mt-2 flex w-full flex-row items-center px-2 py-1">
                      <img
                        src={`/app/images/front/flag-${lang}.svg`}
                        alt={lang}
                        className="w-[2.5em] shadow-md"
                        onClick={() => handleLanguageChange(lang)}
                      />
                      <span className="ms-2 hidden text-nowrap lg:inline">
                        {t(`lang-${lang}`)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </div>
        </Select>
      </div>
    );
  }
);
Language.displayName = "Language";

export { Language };
