import { useDeleteNewsMutation, useNewsQuery } from "@/hooks/useNewsQuery";
import { DeleteNewsDialog, NewsHeader, NewsSearchSection, NewsCard, NewsTable } from "./components";
import { DEFAULT_PAGE, DEFAULT_CARD_LIMIT, DEFAULT_TOTAL, ROUTERS, SEARCH_DEBOUNCE_DELAY_MS } from "@/constant";
import { useTranslation } from "react-i18next";
import EmptyPage from "@/components/EmptyPage";
import { useEffect, useState } from "react";
import { News, NewsFilters } from "@/dataHelper/news.dataHelper";
import Pagination from "@/components/Pagination";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useNavigate } from "react-router";
import AdminListLoading from "@/components/admin/AdminListLoading";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { ViewMode } from "@/components/LayoutToggle";

/**
 * News Management Page
 * Orchestrates the display, search, and deletion of news articles in a paginated grid.
 */
const NewsManager: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState<NewsFilters>({
    page: DEFAULT_PAGE,
    per_page: DEFAULT_CARD_LIMIT,
    sort_field: "",
    sort_direction: undefined,
    title: "",
    content: "",
  });
  const [filters, setFilters] = useState<NewsFilters>({
    page: DEFAULT_PAGE,
    per_page: DEFAULT_CARD_LIMIT,
    sort_field: "",
    sort_direction: undefined,
    title: "",
    content: "",
  });

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const savedMode = localStorage.getItem("newsManager_viewMode");
    return (savedMode as ViewMode) || "table"; // Default to table
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("newsManager_viewMode", mode);
  };

  const { data: news, isLoading: isLoadingNews, isError: errorNews } = useNewsQuery(searchParams);
  const deleteNewsMutation = useDeleteNewsMutation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => ({
        ...filters,
        page: DEFAULT_PAGE,
        per_page: prev.per_page,
        sort_field: prev.sort_field,
        sort_direction: prev.sort_direction,
      }));
    }, SEARCH_DEBOUNCE_DELAY_MS);

    return () => clearTimeout(timer);
  }, [filters]);

  const [deleteTarget, setDeleteTarget] = useState<News | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const askDeleteNews = (id: number) => {
    const target = news?.data?.data?.find((x: News) => x.id === id) || null;
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  const confirmDeleteNews = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNewsMutation.mutateAsync(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
      toastSuccess(t("news.delete_news_dialog.confirm_delete_success"));
    } catch {
      toastError(t("news.delete_news_dialog.confirm_delete_error"));
    }
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const handleOpenSearch = () => {
    setFilters((prev) => ({ ...prev, page: DEFAULT_PAGE, per_page: DEFAULT_CARD_LIMIT, sort_field: "", sort_direction: undefined, title: "", content: "", status: undefined, published_at_start: "", published_at_end: "", user_name: "" }));
    setSearchParams((prev) => ({ ...prev, page: DEFAULT_PAGE, per_page: DEFAULT_CARD_LIMIT, sort_field: "", sort_direction: undefined, title: "", content: "", status: undefined, published_at_start: "", published_at_end: "", user_name: "" }));
    setSearchOpen(true);
  };
  const handleCloseSearch = () => {
    setSearchOpen(false);
  };

  const showDetailNews = (id: number) => {
    navigate(`${ROUTERS.NEWS_DETAIL}/${id}`)
  }

  const showEditNews = (id: number) => {
    navigate(`${ROUTERS.NEWS_EDIT}/${id}`)
  }

  const showCreateNews = () => {
    navigate(ROUTERS.NEWS_ADD)
  }

  const totalItems = news?.data?.total ?? DEFAULT_TOTAL;
  const totalPages = news?.data?.last_page ?? DEFAULT_PAGE;
  const page = news?.data?.current_page ?? DEFAULT_PAGE;
  const perPage = news?.data?.per_page ?? DEFAULT_CARD_LIMIT;

  return (
    <AdminPageShell>
      <NewsHeader 
        onCreateNews={showCreateNews} 
        onOpenFilter={handleOpenSearch} 
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      <DeleteNewsDialog
        news={deleteTarget}
        isOpen={deleteOpen}
        isLoading={deleteNewsMutation.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDeleteNews}
      />
      <NewsSearchSection
        open={searchOpen}
        filters={filters}
        setFilters={setFilters}
        onReset={() => setFilters({ ...filters, page: DEFAULT_PAGE, per_page: DEFAULT_CARD_LIMIT, sort_field: "", sort_direction: undefined, title: "", content: "", status: undefined, published_at_start: "", published_at_end: "", user_name: "" })}
        onClose={handleCloseSearch}
      />
      {
        isLoadingNews ? (
          <AdminListLoading mode={viewMode} />
        ) : errorNews ? (
          <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t("common.error")}</div>
        ) :
          totalItems === 0 ? (
            <EmptyPage />
          ) : (
            <div className="flex flex-col gap-5">
              {viewMode === "grid" ? (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {news?.data?.data?.map((item: News) => (
                      <NewsCard
                        key={item.id}
                        news={item}
                        highlightTerms={{
                          title: searchParams.title || "",
                          user_name: searchParams.user_name || "",
                        }}
                        onView={showDetailNews}
                        onEdit={showEditNews}
                        onDelete={askDeleteNews}
                      />
                    ))}
                  </div>
                  {totalItems > 0 && (
                    <div className="p-4">
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={(page) => setSearchParams((prev) => ({ ...prev, page }))}
                        perPage={perPage}
                        onPerPageChange={(perPage) => setSearchParams((prev) => ({ ...prev, per_page: perPage }))}
                        totalItems={totalItems}
                        perPageOptions={[12, 24, 48]}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <NewsTable
                        news={news?.data}
                        onView={showDetailNews}
                        onEdit={showEditNews}
                        onDelete={askDeleteNews}
                        onSort={(key: string) => {
                          setSearchParams(prev => ({
                                ...prev,
                                sort_field: key,
                                sort_direction: prev.sort_field === key && prev.sort_direction === 'asc' ? 'desc' : 'asc'
                            }))
                          setFilters(prev => ({
                            ...prev,
                            sort_field: key,
                            sort_direction: prev.sort_field === key && prev.sort_direction === 'asc' ? 'desc' : 'asc'
                          }))
                        }}
                        sortField={searchParams.sort_field}
                        sortDirection={searchParams.sort_direction}
                        highlightTerms={{
                          title: searchParams.title || "",
                          user_name: searchParams.user_name || "",
                        }}
                    />
                    {totalItems > 0 && (
                        <div className="border-t border-slate-100 p-4">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={(page) => setSearchParams((prev) => ({ ...prev, page }))}
                                perPage={perPage}
                                onPerPageChange={(perPage) => setSearchParams((prev) => ({ ...prev, per_page: perPage }))}
                                totalItems={totalItems}
                                perPageOptions={[12, 24, 48]}
                            />
                        </div>
                    )}
                </div>
              )}
            </div>
          )
      }
    </AdminPageShell>
  );
};

export default NewsManager;