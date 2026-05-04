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

  return (
    <div ref={containerRef} className="relative z-[500] w-full">
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
          "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm",
          "shadow-sm ring-offset-white focus:outline-none ",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:border-blue-400 hover:bg-gray-50 transition-colors",
          "text-gray-900",
          triggerClassName,
          className
        )}
        disabled={disabled}
      >
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          {icon && <span className="text-gray-400">{icon}</span>}
          <span className={`flex-1 truncate text-left ${selectedOption ? "text-[14px] font-medium text-black" : "text-[14px] font-normal text-gray-500"}`}>
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
            "absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white p-0 shadow-lg",
            "animate-in fade-in-0 zoom-in-95",
            contentClassName
          )}
          style={{
            width: containerRef.current?.offsetWidth || "100%",
            zIndex: 999,
          }}
        >
          {showSearch && (
            <div className="border-b p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 px-9"
                  onClick={(e) => e.stopPropagation()}
                />
                {search && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearch("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="max-h-64 overflow-y-auto py-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-blue-500" />
                <span className="ml-2 text-sm text-gray-500">{t("common.loading")}</span>
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">
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
                      "hover:bg-blue-50 hover:text-blue-700",
                      "transition-colors cursor-pointer active:scale-[0.98]",
                      "focus:outline-none focus:bg-blue-50",
                      value === option.value && "bg-blue-50 text-blue-700 font-medium"
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-3 h-4 w-4 flex-shrink-0",
                        value === option.value
                          ? "opacity-100 text-blue-600"
                          : "opacity-0"
                      )}
                    />
                    <span className="flex-1">{option.label}</span>
                    {option.code && (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
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
