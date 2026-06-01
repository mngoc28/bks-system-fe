import { 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  Pagination as UIPagination 
} from "../ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
  totalItems?: number;
  maxVisiblePages?: number;
  perPageOptions?: number[];
  resultsText?: string;
  hideTotalItems?: boolean;
}

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  perPage, 
  onPerPageChange, 
  totalItems, 
  maxVisiblePages = 5, 
  perPageOptions = [10, 20, 50, 100], 
  resultsText,
  hideTotalItems = false
}: PaginationProps) => {

  const handlePageClick = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    onPageChange(page);
  };

  const getVisiblePages = (currentPage: number, totalPages: number, maxVisiblePages: number): (number | string)[] => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(2, currentPage - half);
    let end = Math.min(totalPages - 1, currentPage + half);

    if (currentPage <= half + 1) {
      start = 2;
      end = maxVisiblePages - 1;
    } else if (currentPage + half >= totalPages) {
      start = totalPages - maxVisiblePages + 2;
      end = totalPages - 1;
    }

    pages.push(1);
    if (start > 2) pages.push("start-ellipsis");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push("end-ellipsis");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
      {/* Left: Per Page selection */}
      <div className="flex items-center gap-3">
        {onPerPageChange && perPage && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Xem</span>
              <Select 
                value={String(perPage)} 
                onValueChange={(val) => onPerPageChange?.(Number(val))}
              >
                <SelectTrigger className="h-9 min-h-0 w-[120px] border-slate-200 bg-white px-2.5 font-bold text-slate-700 shadow-sm transition-all hover:border-primary/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {perPageOptions.map((option) => (
                    <SelectItem key={option} value={String(option)} className="font-bold">
                      {option} bản ghi
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {!hideTotalItems && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/10 bg-primary/5 px-3 py-1.5 shadow-sm">
                <Layers size={14} className="text-primary" />
                <span className="whitespace-nowrap text-xs font-bold text-primary">
                  {(totalItems ?? 0).toLocaleString('vi-VN')} {resultsText || "kết quả"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Pagination Buttons */}
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 sm:flex">
          <span className="text-slate-600">Trang {currentPage}</span>
          <span className="opacity-50">/</span>
          <span>{totalPages}</span>
        </div>

        <UIPagination className="mx-0 w-auto">
          <PaginationContent className="gap-1.5">
            <PaginationItem>
              <button
                disabled={currentPage === 1}
                className={`flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-primary/20 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-40`}
                onClick={() => onPageChange(currentPage - 1)}
                title="Trang trước"
              >
                <ChevronLeft size={18} />
              </button>
            </PaginationItem>

            {getVisiblePages(currentPage, totalPages, maxVisiblePages).map((page, idx) => {
              if (page === "start-ellipsis" || page === "end-ellipsis") {
                return (
                  <PaginationItem key={page + idx}>
                    <PaginationEllipsis className="size-9 text-slate-400" />
                  </PaginationItem>
                );
              }
              const pageNumber = page as number;
              const isActive = pageNumber === currentPage;
              
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    className={`size-9 rounded-lg border text-sm font-bold shadow-sm transition-all duration-200 active:scale-95 ${
                      isActive 
                        ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary-hover hover:text-primary-foreground" 
                        : "border-slate-200 bg-white text-slate-600 hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                    }`}
                    isActive={isActive}
                    onClick={(e: React.MouseEvent) => handlePageClick(e, pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <button
                disabled={currentPage === totalPages}
                className={`flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:border-primary/20 hover:bg-primary/5 hover:text-primary disabled:pointer-events-none disabled:opacity-40`}
                onClick={() => onPageChange(currentPage + 1)}
                title="Trang tiếp"
              >
                <ChevronRight size={18} />
              </button>
            </PaginationItem>
          </PaginationContent>
        </UIPagination>
      </div>
    </div>
  );
};

export default Pagination;
