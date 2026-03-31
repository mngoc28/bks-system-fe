import { useDeleteNewsMutation, useNewsQuery } from "@/hooks/useNewsQuery";
import { DeleteNewsDialog, NewsHeader, NewsSearchSection } from "./components";
import { DEFAULT_PAGE, DEFAULT_PAGINATION, DEFAULT_TOTAL, ROUTERS } from "@/constant";
import NewsTable from "./components/NewsTable";
import { useTranslation } from "react-i18next";
import EmptyPage from "@/components/EmptyPage";
// import { useNavigate } from "react-router";
import { useState } from "react";
import { News, NewsFilters } from "@/dataHelper/news.dataHelper";
import Pagination from "@/components/Pagination";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useNavigate } from "react-router";

const NewsManager: React.FC = () => {
  const { t } = useTranslation();
  // navigate 
  const navigate = useNavigate();

  //search params
  const [searchParams, setSearchParams] = useState<NewsFilters>({
    page: DEFAULT_PAGE,
    per_page: DEFAULT_PAGINATION,
    sort_field: "",
    sort_direction: undefined,
    title: "",
    content: "",
  });

  const { data: news, isLoading: isLoadingNews, isError: errorNews } = useNewsQuery(searchParams);
  // delete news
  const deleteNewsMutation = useDeleteNewsMutation();

  // delete news dialog
  const [deleteTarget, setDeleteTarget] = useState<News | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ask delete news
  const askDeleteNews = (id: number) => {
    const target = news?.data?.data?.find((x: News) => x.id === id) || null;
    setDeleteTarget(target);
    setDeleteOpen(true);
  };

  // confirm delete news
  const confirmDeleteNews = async () => {
    if (!deleteTarget) return;
    try {
      await deleteNewsMutation.mutateAsync(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
      toastSuccess(t("news.delete_news_dialog.confirm_delete_success"));
    } catch (error) {
      toastError(t("news.delete_news_dialog.confirm_delete_error"));
    }
  };

  // toggle sort
  const toggleSort = (key: string) => {
    setSearchParams((prev) => {
      if (prev.sort_field === key) {
        return { ...prev, sort_direction: prev.sort_direction === "asc" ? "desc" : "asc" };
      }
      return { ...prev, sort_field: key, sort_direction: "asc" };
    });
  };

  // search open
  const [searchOpen, setSearchOpen] = useState(false);
  const handleOpenSearch = () => {
    setSearchParams((prev) => ({ ...prev, page: DEFAULT_PAGE, per_page: DEFAULT_PAGINATION, sort_field: "", sort_direction: undefined, title: "", content: "", status: undefined, published_at_start: "", published_at_end: "" }));
    setSearchOpen(true);
  };
  const handleCloseSearch = () => {
    setSearchOpen(false);
  };

  // show detail news
  const showDetailNews = (id: number) => {
    navigate(`${ROUTERS.NEWS_DETAIL}/${id}`)
  }

  // show edit news
  const showEditNews = (id: number) => {
    navigate(`${ROUTERS.NEWS_EDIT}/${id}`)
  }

  // show create news
  const showCreateNews = () => {
    navigate(ROUTERS.NEWS_ADD)
  }

  // pagination
  const totalItems = news?.data?.total ?? DEFAULT_TOTAL;
  const totalPages = news?.data?.last_page ?? DEFAULT_PAGE;
  const page = news?.data?.current_page ?? DEFAULT_PAGE;
  const perPage = news?.data?.per_page ?? DEFAULT_PAGINATION;

  return (
    <div className="flex w-full flex-col gap-6 p-[12px_24px]">
      <NewsHeader onCreateNews={showCreateNews} onOpenFilter={handleOpenSearch} />
      <DeleteNewsDialog
        news={deleteTarget}
        isOpen={deleteOpen}
        isLoading={deleteNewsMutation.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDeleteNews}
      />
      <NewsSearchSection
        open={searchOpen}
        filters={searchParams}
        setFilters={setSearchParams}
        onReset={() => setSearchParams({ ...searchParams, page: DEFAULT_PAGE, per_page: DEFAULT_PAGINATION, sort_field: "", sort_direction: undefined, title: "", content: "", status: undefined, published_at_start: "", published_at_end: "" })}
        onClose={handleCloseSearch}
      />
      {
        isLoadingNews ? (
          <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t("common.loading")}</div>
        ) : errorNews ? (
          <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t("common.error")}</div>
        ) :
          totalItems === 0 ? (
            <EmptyPage />
          ) : (
            <>
              <NewsTable
                news={news?.data}
                onDelete={askDeleteNews}
                onEdit={(id: number) => showEditNews(id)}
                onView={(id: number) => showDetailNews(id)}
                onSort={toggleSort}
                sortField={searchParams.sort_field}
                sortDirection={searchParams.sort_direction}
              />
              {totalItems > 0 && (
                <div className="p-4">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={(page) => setSearchParams((prev) => ({ ...prev, page }))}
                    perPage={perPage}
                    onPerPageChange={(perPage) => setSearchParams((prev) => ({ ...prev, per_page: perPage }))}
                    totalItems={totalItems}
                  />
                </div>
              )}
            </>
          )
      }
    </div>
  );
};

export default NewsManager;