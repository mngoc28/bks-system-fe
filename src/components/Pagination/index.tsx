import { useTranslation } from "react-i18next";
import { PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, Pagination as UIPagination } from "../ui/pagination";

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
}

const Pagination = ({ currentPage, totalPages, onPageChange, perPage, onPerPageChange, totalItems, maxVisiblePages = 5, perPageOptions = [5, 10, 20, 50], resultsText }: PaginationProps) => {
  const { t } = useTranslation();

  const handlePageClick = (e: React.MouseEvent, page: number) => {
    e.preventDefault();
    onPageChange(page);
  };

  const handlePerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPerPageChange?.(Number(e.target.value));
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
    <div className="grid w-full grid-cols-1 items-center gap-4 md:grid-cols-3">
      {/* Empty space on the left to balance the grid and keep pagination centered */}
      <div className="hidden md:block" />

      {/* Centered Pagination Buttons */}
      <div className="flex justify-center">
        <UIPagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className="size-8 min-w-8 rounded bg-slate-100 p-0"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  if (currentPage > 1) onPageChange(currentPage - 1);
                }}
              />
            </PaginationItem>

            {getVisiblePages(currentPage, totalPages, maxVisiblePages).map((page, idx) => {
              if (page === "start-ellipsis" || page === "end-ellipsis") {
                return (
                  <PaginationItem key={page + idx}>
                    <PaginationEllipsis className="text-slate-500 opacity-70" />
                  </PaginationItem>
                );
              }
              const pageNumber = page as number;
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    className={`size-8 min-w-8 rounded ${pageNumber === currentPage ? "bg-slate-100 font-bold" : "p-0 text-slate-500 opacity-70"}`}
                    isActive={pageNumber === currentPage}
                    onClick={(e: React.MouseEvent) => handlePageClick(e, pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                className="size-8 min-w-8 rounded bg-slate-100 p-0"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onPageChange(currentPage + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </UIPagination>
      </div>

      {/* Right-aligned Results and Per Page selection */}
      <div className="flex justify-center md:justify-end">
        {onPerPageChange && perPage && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded bg-slate-100 px-3 py-1.5">
              <select className="bg-transparent text-sm text-slate-700 outline-none" value={perPage} onChange={handlePerPageChange} aria-label={t("pagination.items_per_page")}>
                {perPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {totalItems !== undefined && (
              <span className="whitespace-nowrap text-sm text-slate-700">
                {totalItems} {resultsText || t("pagination.results")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
