import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableSelectProps } from "@/components/type";

// SearchableSelect component
export default function SearchableSelect({
  value,
  onValueChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  className,
  disabled = false,
  loading = false,
  icon,
  showSearch = true,
  triggerClassName,
  contentClassName,
}: SearchableSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected option
  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  // Filter options
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;

    const searchLower = search.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(searchLower) ||
        option.value.toString().toLowerCase().includes(searchLower) ||
        option.name_en?.toLowerCase().includes(searchLower)
    );
  }, [search, options]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when open
  useEffect(() => {
    if (open && searchInputRef.current && showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open, showSearch]);

  const isDark = triggerClassName?.includes("text-white");

  return (
    <div ref={containerRef} className={cn("relative w-full", open && "z-[500]")}>
      <div className="absolute -inset-x-3 -inset-y-2 -z-10" />
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
        }}
        className={cn(
          "flex min-h-12 w-full items-center justify-between gap-2",
          "rounded-md border px-3 py-2 text-sm",
          "shadow-sm ring-offset-white focus:outline-none ",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-colors",
          isDark
            ? "bg-white/[0.02] border-white/5 text-white hover:bg-white/[0.08]"
            : "bg-white border-slate-300 text-gray-900 hover:bg-gray-50 hover:border-blue-400",
          triggerClassName,
          className
        )}
        disabled={disabled}
      >
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          {icon && <span className={cn(isDark ? "text-slate-500" : "text-gray-400")}>{icon}</span>}
          <span className={cn(
            "flex-1 truncate text-left text-[14px]",
            selectedOption
              ? "font-medium text-inherit"
              : isDark ? "font-normal text-slate-500" : "font-normal text-gray-500"
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 flex-shrink-0 opacity-50 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </Button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-xl border p-0 shadow-lg",
            "animate-in fade-in-0 zoom-in-95 backdrop-blur-md",
            isDark
              ? "bg-[#0f172a] border-slate-800 text-white shadow-2xl"
              : "bg-white border-gray-200 text-gray-900 shadow-lg",
            contentClassName
          )}
          style={{
            width: containerRef.current?.offsetWidth || "100%",
            zIndex: 999,
          }}
        >
          {showSearch && (
            <div className={cn("border-b p-3", isDark ? "border-slate-800 bg-slate-900/40 rounded-t-xl" : "border-gray-100 bg-gray-50/20")}>
              <div className="relative">
                <Search className={cn("absolute left-3 top-1/2 size-4 -translate-y-1/2", isDark ? "text-slate-500" : "text-gray-400")} />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "h-10 px-9 text-sm rounded-lg border transition-all",
                    isDark
                      ? "bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500/50"
                      : "bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-blue-400"
                  )}
                  onClick={(e) => e.stopPropagation()}
                />
                {search && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearch("");
                    }}
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                      isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          <style>{`
            .custom-select-scrollbar::-webkit-scrollbar {
              width: 5px;
            }
            .custom-select-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-select-scrollbar::-webkit-scrollbar-thumb {
              background: ${isDark ? '#334155' : '#cbd5e1'};
              border-radius: 9999px;
            }
            .custom-select-scrollbar::-webkit-scrollbar-thumb:hover {
              background: ${isDark ? '#475569' : '#94a3b8'};
            }
          `}</style>

          <div className="max-h-64 overflow-y-auto py-1 custom-select-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-blue-500" />
                <span className={cn("ml-2 text-sm", isDark ? "text-slate-400" : "text-gray-500")}>{t("common.loading")}</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className={cn("py-6 text-center text-sm", isDark ? "text-slate-500" : "text-gray-500")}>
                {emptyMessage}
              </div>
            ) : (
              <div className="space-y-0.5 p-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextValue = value === option.value ? "" : option.value;
                      onValueChange(nextValue);
                      setOpen(false);
                      setSearch("");
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={cn(
                      "flex w-full items-center rounded-md px-3 py-2.5 text-sm text-left",
                      "transition-colors cursor-pointer active:scale-[0.98] focus:outline-none",
                      isDark
                        ? cn(
                            "text-slate-300 hover:bg-slate-800/80 hover:text-white focus:bg-slate-800/80",
                            value === option.value && "bg-blue-600/20 text-blue-400 font-bold"
                          )
                        : cn(
                            "text-slate-700 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50",
                            value === option.value && "bg-blue-50 text-blue-700 font-medium"
                          )
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-3 h-4 w-4 flex-shrink-0",
                        value === option.value
                          ? cn("opacity-100", isDark ? "text-blue-400" : "text-blue-600")
                          : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{option.label}</span>
                    {option.code && (
                      <span className={cn(
                        "ml-2 rounded px-1.5 py-0.5 text-xs",
                        isDark ? "bg-slate-800 text-slate-400" : "bg-gray-100 text-gray-500"
                      )}>
                        {option.code}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
