import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Filter, GitBranch, Plus } from "lucide-react";
import { QuestionDeleteDialog, QuestionSearchSection, QuestionCard } from "./components";
import { useQuestionFilters } from "./hooks/useQuestionFilters";
import { useChatbotsQuery, useDeleteChatbotMutation } from "@/hooks/useChatbotQuery";
import { ChatbotRecord, toChatbotListPayload } from "@/dataHelper/chatbot.dataHelper";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTERS } from "@/constant";
import Pagination from "@/components/Pagination";
import EmptyPage from "@/components/EmptyPage";
import { Spinner } from "@/components/ui/spinner";
import PageBar from "@/components/PageBar";

/**
 * Question Manager Page
 * Manages the collection of chatbot questions, providing search, filtering, and access to visual flow management.
 */
const QuestionManagerPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const hasActiveFilterParams = useMemo(() => {
    if (!location.search) return false;
    const params = new URLSearchParams(location.search);
    const ignoredKeys = new Set(["page", "per_page", "sort_by", "direction"]);
    for (const [key, value] of params.entries()) {
      if (ignoredKeys.has(key)) continue;
      if (typeof value === "string" && value.trim().length > 0) return true;
    }
    return false;
  }, [location.search]);

  const [openFilters, setOpenFilters] = useState(hasActiveFilterParams);
  const [autoOpenByParams, setAutoOpenByParams] = useState(true);
  const { filters, searchValue, setTitle, setPage, setPerPage, reset } = useQuestionFilters();

  const currentQueryString = useMemo(() => location.search, [location.search]);

  useEffect(() => {
    if (autoOpenByParams && hasActiveFilterParams) setOpenFilters(true);
  }, [autoOpenByParams, hasActiveFilterParams]);

  const previousPathRef = useRef(location.pathname);
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      setAutoOpenByParams(true);
    }
  }, [location.pathname]);

  const getNavigationState = useCallback(() => {
    if (!currentQueryString) return undefined;
    return { state: { fromSearch: currentQueryString } } as const;
  }, [currentQueryString]);

  const payload = toChatbotListPayload(filters);
  const { data, isLoading, isFetching } = useChatbotsQuery(payload);
  const deleteMutation = useDeleteChatbotMutation();
  const [deleteTarget, setDeleteTarget] = useState<ChatbotRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const paginator = data?.data;
  const rows = paginator?.data ?? [];
  const totalItems = paginator?.total ?? 0;
  const perPage = filters.per_page;

  useEffect(() => {
    if (isLoading || isFetching) return;
    if (filters.page > 1 && rows.length === 0) setPage(filters.page - 1);
  }, [filters.page, isFetching, isLoading, rows.length, setPage]);

  const handleViewDetail = (id: number) => {
    navigate(ROUTERS.QUESTION_DETAIL.replace(":id", String(id)), getNavigationState());
  };

  const handleAskDelete = (id: number) => {
    setDeleteTarget(rows.find((item) => item.id === id) ?? null);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } finally {
      setDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 p-[24px_32px]">
      <PageBar
        subtitle={t("questions.subtitle") || "Quản lý luồng câu hỏi và kịch bản chatbot tự động."}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
              onClick={() => {
                setAutoOpenByParams(false);
                setOpenFilters((prev) => !prev);
              }}
            >
              <Filter className="size-4" />
              {t("common.filter")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-200 bg-white font-semibold text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
              onClick={() => navigate(ROUTERS.QUESTION_FLOW, getNavigationState())}
            >
              <GitBranch className="size-4" />
              {t("questions.flow.open_button")}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-2 bg-indigo-600 font-semibold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-200"
              onClick={() => navigate(ROUTERS.QUESTION_CREATE, getNavigationState())}
            >
              <Plus className="size-4" />
              {t("questions.add")}
            </Button>
          </div>
        }
      />

      <QuestionSearchSection
        open={openFilters}
        filters={filters}
        searchValue={searchValue}
        onTitleChange={setTitle}
        onReset={reset}
        onClose={() => {
          setAutoOpenByParams(false);
          setOpenFilters(false);
        }}
        isLoading={isFetching}
      />

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
          <Spinner size="lg" showText text={t("common.loading_data")} />
        </div>
      ) : totalItems === 0 ? (
        <EmptyPage />
      ) : (
        <div className="flex flex-col gap-8">
           <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
              {rows.map((row) => (
                <QuestionCard
                  key={row.id}
                  question={row}
                  onView={handleViewDetail}
                  onEdit={(id) => navigate(ROUTERS.QUESTION_UPDATE.replace(":id", String(id)), getNavigationState())}
                  onDelete={handleAskDelete}
                />
              ))}
           </div>
           {totalItems > 0 && (
             <div className="p-4">
               <Pagination
                 currentPage={filters.page}
                 totalPages={Math.max(1, Math.ceil(totalItems / perPage))}
                 onPageChange={setPage}
                 perPage={perPage}
                 onPerPageChange={setPerPage}
                 totalItems={totalItems}
                 perPageOptions={[12, 24, 48]}
               />
             </div>
           )}
        </div>
      )}

      <QuestionDeleteDialog
        isOpen={deleteOpen}
        onClose={() => {
          if (deleteMutation.isPending) return;
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        target={deleteTarget}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default QuestionManagerPage;
