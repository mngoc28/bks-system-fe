import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ROUTERS } from "@/constant";
import { CreateQuestionForm } from "./components";
import { useCreateChatbotMutation } from "@/hooks/useChatbotQuery";
import { CreateQuestionFormValues } from "@/dataHelper/chatbot.dataHelper";

/**
 * Question Create Page
 * Provides an interface for managers to define new chatbot questions and their corresponding automated answers.
 */
const QuestionCreatePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync, isPending } = useCreateChatbotMutation();

  const handleSubmit = async (values: CreateQuestionFormValues) => {
    try {
      const response = await mutateAsync(values);
      const newId = response?.data?.id;

      if (newId) {
        navigate(`${ROUTERS.QUESTION_DETAIL.replace(":id", String(newId))}${location.search}`);
        return;
      }

      navigate(`${ROUTERS.QUESTION_MANAGEMENT}${location.search}`);
    } catch (error) {
      // Mutation hook already surfaces the toast; swallow the error to avoid crashing the page
      console.error("Failed to create chatbot question", error);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="w-fit gap-2" aria-label={t("questions.create.back")}>
            <ArrowLeft className="size-4" />
            {t("questions.create.back")}
          </Button>
          <span className="text-lg font-semibold text-slate-800">{t("questions.create.page_title")}</span>
        </div>
      </div>

      <CreateQuestionForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
};

export default QuestionCreatePage;
