import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Filter, GitBranch, Plus } from "lucide-react";
import { QuestionDeleteDialog, QuestionSearchSection, QuestionTable } from "./components";
import { useQuestionFilters } from "./hooks/useQuestionFilters";
import { useChatbotsQuery, useDeleteChatbotMutation } from "@/hooks/useChatbotQuery";
import { ChatbotRecord, toChatbotListPayload } from "@/dataHelper/chatbot.dataHelper";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTERS } from "@/constant";

const QuestionManagerPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if there are active filter parameters in the URL
  const hasActiveFilterParams = useMemo(() => {
    if (!location.search) return false;
    const params = new URLSearchParams(location.search);
    const ignoredKeys = new Set(["page", "per_page", "sort_by", "direction"]);
    for (const [key, value] of params.entries()) {
      if (ignoredKeys.has(key)) continue;
      if (typeof value === "string" && value.trim().length > 0) {
        return true;
      }
    }
    return false;
  }, [location.search]);

  const [openFilters, setOpenFilters] = useState(hasActiveFilterParams);
  const [autoOpenByParams, setAutoOpenByParams] = useState(true);
  const { filters, searchValue, setTitle, toggleSort, setPage, setPerPage, reset } = useQuestionFilters();

  const currentQueryString = useMemo(() => location.search, [location.search]);

  useEffect(() => {
    if (autoOpenByParams && hasActiveFilterParams) {
      setOpenFilters(true);
    }
  }, [autoOpenByParams, hasActiveFilterParams]);

  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      setAutoOpenByParams(true);
    }
  }, [location.pathname]);

  // Function to get navigation state with current query string
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
    if (filters.page > 1 && rows.length === 0) {
      setPage(filters.page - 1);
    }
  }, [filters.page, isFetching, isLoading, rows.length, setPage]);

  // Handler to view question detail
  const handleViewDetail = (id: number) => {
    navigate(ROUTERS.QUESTION_DETAIL.replace(":id", String(id)), getNavigationState());
  };

  // Handler to open delete confirmation dialog
  const handleAskDelete = (id: number) => {
    const target = rows.find((item) => item.id === id) ?? null;
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  // Confirm deletion handler
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
    <div className="flex w-full flex-col gap-6 px-4 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold text-slate-800">{t("questions.title")}</h1>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-nowrap">
          <Button variant="default" size="sm" className="flex w-full items-center gap-2 px-4 py-2 sm:w-auto" onClick={() => navigate(ROUTERS.QUESTION_CREATE, getNavigationState())}>
            <Plus className="size-4" />
            {t("questions.add")}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex w-full items-center justify-between gap-2 px-4 py-2 sm:w-auto"
            onClick={() => navigate(ROUTERS.QUESTION_FLOW, getNavigationState())}
          >
            <span>{t("questions.flow.open_button")}</span>
            <GitBranch className="size-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex w-full items-center gap-2 px-4 py-2 sm:w-auto"
            onClick={() => {
              setAutoOpenByParams(false);
              setOpenFilters((prev) => !prev);
            }}
          >
            <Filter className="size-4" />
            {t("common.filter")}
          </Button>
        </div>
      </div>

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

      <QuestionTable
        rows={rows}
        filters={filters}
        onToggleSort={toggleSort}
        page={filters.page}
        perPage={perPage}
        totalItems={totalItems}
        isLoading={isLoading}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onView={handleViewDetail}
        onEdit={(id) => {
          navigate(ROUTERS.QUESTION_UPDATE.replace(":id", String(id)), getNavigationState());
        }}
        onDelete={handleAskDelete}
      />

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
