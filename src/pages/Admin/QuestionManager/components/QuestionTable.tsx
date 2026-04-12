import Pagination from "@/components/Pagination";
import RowActions from "@/components/RowActions/RowActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { QuestionSortKey, QuestionsProps } from "@/dataHelper/chatbot.dataHelper";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { highlightText } from "@/utils/utils";

/**
 * Question Table
 * A tabular display of chatbot questions, supporting sorting, pagination, and row-level management actions.
 */
const QuestionTable = ({ rows, filters, onToggleSort, page, perPage, totalItems, isLoading, onPageChange, onPerPageChange, onView, onEdit, onDelete }: QuestionsProps) => {
  const { t } = useTranslation();

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  const renderSortIcon = (key: QuestionSortKey) => {
    if (filters.sort_by !== key) return <ChevronsUpDown className="size-4" />;
    return filters.direction === "asc" ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />;
  };

  const sortableHead = (key: QuestionSortKey, label: string, className?: string) => (
    <TableHead
      className={cn("cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700", className ?? "text-center")}
      onClick={() => onToggleSort(key)}
      aria-sort={filters.sort_by === key ? (filters.direction === "asc" ? "ascending" : "descending") : "none"}
    >
      <span className="inline-flex items-center justify-center gap-1">
        {label}
        {renderSortIcon(key)}
      </span>
    </TableHead>
  );

  const showEmptyState = rows.length === 0 && !isLoading;
  const showInitialLoading = rows.length === 0 && isLoading;
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative w-full overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-max text-sm text-slate-700">
            <TableHeader className="sticky top-0 z-10 bg-slate-100">
              <tr className="border-b border-gray-300">
                {sortableHead("id", t("questions.table.id"), "w-[72px] text-center")}
                {sortableHead("content", t("questions.table.content"), "text-left")}
                {sortableHead("total_answers", t("questions.table.total_answer"), "text-center")}
                <TableHead className="w-[140px] px-4 py-3 text-center text-slate-700">{t("questions.table.type")}</TableHead>
                <TableHead className="w-1/6 px-4 py-3 text-center text-slate-700">{t("common.actions")}</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {rows.map((row) => {
                const isAnswer = Number(row.type) === 1;
                let badgeLabel: string;
                let badgeClass: string;

                if (row.is_start_node === 1) {
                  badgeLabel = t("questions.table.start");
                  badgeClass = "bg-slate-900/50 text-white";
                } else if (isAnswer) {
                  badgeLabel = t("questions.table.type_answer");
                  badgeClass = "bg-sky-100 text-sky-700";
                } else {
                  badgeLabel = t("questions.table.type_question");
                  badgeClass = "bg-emerald-100 text-emerald-700";
                }

                return (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    <TableCell className="w-[72px] px-4 py-3 text-center align-middle">{row.id}</TableCell>
                    <TableCell className="max-w-[420px] px-4 py-3 text-left align-middle">
                      <p className="line-clamp-2 whitespace-pre-wrap break-words text-slate-700">{highlightText(row.content, filters.content || "")}</p>
                    </TableCell>
                    <TableCell className="w-1/6 px-4 py-3 text-center align-middle font-medium text-slate-700">{row.total_answers}</TableCell>
                    <TableCell className="w-[140px] px-4 py-3 text-center align-middle">
                      <span className={cn("inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold", badgeClass)}>
                        {badgeLabel}
                      </span>
                    </TableCell>
                    <TableCell className="w-1/6 px-4 py-3 text-center align-middle">
                      <RowActions
                        id={String(row.id)}
                        onView={onView ? (id) => onView(Number(id)) : undefined}
                        onEdit={onEdit ? (id) => onEdit(Number(id)) : undefined}
                        onDelete={onDelete ? (id) => onDelete(Number(id)) : undefined}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {showEmptyState && (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                    {t("questions.empty")}
                  </TableCell>
                </TableRow>
              )}
              {showInitialLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="px-4 py-12 text-center">
                    <Spinner size="lg" showText text={t("common.loading_data")} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalItems > 0 && !isLoading && (
          <div className="border-t border-slate-100 bg-white p-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              perPage={perPage}
              onPerPageChange={onPerPageChange}
              totalItems={totalItems}
              resultsText={t("pagination.results")}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionTable;
