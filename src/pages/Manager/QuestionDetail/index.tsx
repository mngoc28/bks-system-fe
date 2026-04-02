import { useParams, useNavigate, useLocation } from "react-router-dom";
import { QuestionDetailSection } from "./components";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SquarePen } from "lucide-react";
import { useChatbotDetailQuery } from "@/hooks/useChatbotQuery";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTERS } from "@/constant";
import { Spinner } from "@/components/ui/spinner";

const QuestionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const location = useLocation();
  const fromSearch = (location.state as { fromSearch?: string } | undefined)?.fromSearch ?? "";
  const { t } = useTranslation();

  const { data, isLoading, isError } = useChatbotDetailQuery(numericId);

  const detail = data?.data;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-3 sm:p-6">
        <Spinner size="lg" showText text={t("common.loading_data")} />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="max-w-md border-amber-200">
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-sm text-slate-600">{t("questions.detail.error")}</p>
            <Button onClick={() => navigate(`${ROUTERS.QUESTION_MANAGEMENT}${fromSearch}`)}>{t("questions.detail.back")}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`${ROUTERS.QUESTION_MANAGEMENT}${fromSearch}`)}
            className="w-fit gap-2"
            aria-label={t("questions.detail.back")}
          >
            <ArrowLeft className="size-4" />
            {t("questions.detail.back")}
          </Button>
          <span className="text-lg font-semibold text-slate-800">{t("questions.detail.page_title")}</span>
        </div>
        <Button
          variant="default"
          size="sm"
          className="flex w-full items-center justify-center gap-2 px-4 py-2 sm:w-auto"
          onClick={() =>
            navigate(
              ROUTERS.QUESTION_UPDATE.replace(":id", String(detail.id)),
              fromSearch ? { state: { fromSearch } } : undefined,
            )
          }
        >
          <SquarePen className="size-4" />
          {t("questions.detail.edit")}
        </Button>
      </div>

      <QuestionDetailSection
        detail={detail}
        onNavigateNext={(nextId) =>
          navigate(ROUTERS.QUESTION_DETAIL.replace(":id", String(nextId)), fromSearch ? { state: { fromSearch } } : undefined)
        }
      />
    </div>
  );
};

export default QuestionDetailPage;
