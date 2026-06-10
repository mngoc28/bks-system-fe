import { useTranslation } from "react-i18next";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { Dialog, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import HeroSearchForm from "./HeroSearchForm";
import type { useHeroSearch } from "../hooks/useHeroSearch";

type HeroSearchState = ReturnType<typeof useHeroSearch>;

function isNestedOverlayTarget(target: HTMLElement): boolean {
  return Boolean(
    target.closest("[data-radix-popper-content-wrapper]") ||
      target.closest("[data-radix-popover-content]") ||
      target.closest('[role="dialog"]') ||
      target.closest('[role="listbox"]'),
  );
}

interface MobileSearchSheetProps {
  search: HeroSearchState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileSearchSheet = ({ search, open, onOpenChange }: MobileSearchSheetProps) => {
  const { t } = useTranslation();

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className="relative z-10 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary via-sky-600 to-sky-700 px-8 py-4 text-base font-semibold text-white shadow-md shadow-black/25 transition-all duration-300 active:scale-95 md:hidden"
      >
        <Search className="size-5" />
        {t("public.home.search.mobileCta", "Tìm phòng ngay")}
      </button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogPrimitive.Overlay
            className={cn(
              "fixed inset-0 z-[100] bg-black/50",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            )}
          />
          <DialogPrimitive.Content
            className={cn(
              "fixed inset-0 z-[101] flex flex-col bg-white outline-none",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
              "duration-200",
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => {
              const target = e.target as HTMLElement;
              if (isNestedOverlayTarget(target)) {
                e.preventDefault();
              }
            }}
            onInteractOutside={(e) => {
              const target = e.target as HTMLElement;
              if (isNestedOverlayTarget(target)) {
                e.preventDefault();
              }
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-6">
              <DialogTitle className="text-lg font-bold text-slate-900">
                {t("public.home.search.sheetTitle", "Tìm chỗ ở")}
              </DialogTitle>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="inline-flex size-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                aria-label={t("common.close", "Đóng")}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              <HeroSearchForm
                search={search}
                variant="sheet"
                className="!grid border-slate-200 bg-white shadow-sm"
              />
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </>
  );
};

export default MobileSearchSheet;
