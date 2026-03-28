import { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ROUTERS } from "@/constant";
import { useChatbotDetailQuery, useUpdateChatbotMutation } from "@/hooks/useChatbotQuery";
import type { CreateQuestionFormValues } from "@/dataHelper/chatbot.dataHelper";
import { CreateQuestionForm } from "@/pages/QuestionCreate/components";

const QuestionUpdatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const fromSearch = (location.state as { fromSearch?: string } | undefined)?.fromSearch ?? "";
  const params = useParams();
  const id = Number(params.id);

  const { data, isError } = useChatbotDetailQuery(Number.isNaN(id) ? undefined : id);
  const mutation = useUpdateChatbotMutation();
  const defaultValues = useMemo<CreateQuestionFormValues | undefined>(() => {
    if (!data?.data) return undefined;

    return {
      content: data.data.content,
      type: (data.data.type ?? 0) as 0 | 1,
      is_start_node: (data.data.is_start_node ?? 0) as 0 | 1,
      answers: Array.isArray(data.data.answers)
        ? data.data.answers.map((answer) => ({
            id: answer.id,
            content: answer.content,
            next_question_id: answer.next_question_id,
            _action: "update" as const,
          }))
        : [],
    };
  }, [data]);

  // Submit handler
  const handleSubmit = useCallback(
    async (values: CreateQuestionFormValues) => {
      if (Number.isNaN(id)) return;

      try {
        await mutation.mutateAsync({ id, payload: values });
        navigate(ROUTERS.QUESTION_DETAIL.replace(":id", String(id)), fromSearch ? { state: { fromSearch } } : undefined);
      } catch (error) {
        console.error("Failed to update chatbot question", error);
      }
    },
    [id, mutation, navigate],
  );

  // Back handler
  const handleBack = () => {
    if (fromSearch) {
      navigate(`${ROUTERS.QUESTION_MANAGEMENT}${fromSearch}`);
      return;
    }
    navigate(-1);
  };

  const isSubmitting = mutation.isPending;
  const submitLabel = t("questions.update.submit");
  const showForm = Boolean(defaultValues) && !isError;

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack} className="w-fit gap-2" aria-label={t("questions.update.back")}>
            <ArrowLeft className="size-4" />
            {t("questions.update.back")}
          </Button>
          <span className="text-lg font-semibold text-slate-800">{t("questions.update.page_title")}</span>
        </div>
      </div>

      {showForm && (
        <CreateQuestionForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          showResetButton={false}
          currentQuestionId={id}
          key={id}
        />
      )}
    </div>
  );
};

export default QuestionUpdatePage;
