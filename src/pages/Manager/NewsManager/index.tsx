import { useDeleteNewsMutation, useNewsQuery } from "@/hooks/useNewsQuery";
import { DeleteNewsDialog, NewsHeader, NewsSearchSection, NewsCard } from "./components";
import { DEFAULT_PAGE, DEFAULT_CARD_LIMIT, DEFAULT_TOTAL, ROUTERS } from "@/constant";
import { useTranslation } from "react-i18next";
import EmptyPage from "@/components/EmptyPage";
import { useState } from "react";
import { News, NewsFilters } from "@/dataHelper/news.dataHelper";
import Pagination from "@/components/Pagination";
import { toastError, toastSuccess } from "@/components/ui/toast";
import { useNavigate } from "react-router";
import { Spinner } from "@/components/ui/spinner";

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

  const { data: news, isLoading: isLoadingNews, isError: errorNews } = useNewsQuery(searchParams);
  const deleteNewsMutation = useDeleteNewsMutation();

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
    } catch (error) {
      toastError(t("news.delete_news_dialog.confirm_delete_error"));
    }
  };

  const [searchOpen, setSearchOpen] = useState(false);
  const handleOpenSearch = () => {
    setSearchParams((prev) => ({ ...prev, page: DEFAULT_PAGE, per_page: DEFAULT_CARD_LIMIT, sort_field: "", sort_direction: undefined, title: "", content: "", status: undefined, published_at_start: "", published_at_end: "" }));
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
        onReset={() => setSearchParams({ ...searchParams, page: DEFAULT_PAGE, per_page: DEFAULT_CARD_LIMIT, sort_field: "", sort_direction: undefined, title: "", content: "", status: undefined, published_at_start: "", published_at_end: "" })}
        onClose={handleCloseSearch}
      />
      {
        isLoadingNews ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-100 bg-white/50">
            <Spinner size="lg" showText text={t("common.loading_data")} />
          </div>
        ) : errorNews ? (
          <div className="rounded-lg border bg-white p-6 text-sm text-slate-500">{t("common.error")}</div>
        ) :
          totalItems === 0 ? (
            <EmptyPage />
          ) : (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-4">
                {news?.data?.data?.map((item: News) => (
                  <NewsCard
                    key={item.id}
                    news={item}
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
            </div>
          )
      }
    </div>
  );
};

export default NewsManager;