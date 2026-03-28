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

const LanguageOptions: string[] = ["en", "jp", "vi"];

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
          <div className="w-fit flex items-center justify-center">
            <SelectTrigger className="w-full h-auto flex flex-row items-center justify-center mb-0">
              <SelectValue>
                <div className="flex flex-row items-center justify-center px-2">
                  <img
                    src={`/app/images/front/flag-${lang}.svg`}
                    alt={lang}
                    className="w-[2em] lg:w-[3em] shadow-md"
                  />
                  <span className="ms-2 text-nowrap font-bold hidden lg:inline">
                    {t(`lang-${lang}`)}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border w-max h-fit relative top-[var(--header-height)]">
              <SelectGroup className="w-full bg-white pb-2">
                {LanguageOptions.map((lang) => (
                  <SelectItem
                    value={lang}
                    key={lang}
                    className="cursor-pointer w-full text-center font-shingo hover:bg-dark-300"
                  >
                    <div className="flex flex-row w-full items-center py-1 px-2 mt-2">
                      <img
                        src={`/app/images/front/flag-${lang}.svg`}
                        alt={lang}
                        className="w-[2.5em] shadow-md"
                        onClick={() => handleLanguageChange(lang)}
                      />
                      <span className="ms-2 text-nowrap hidden lg:inline">
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
