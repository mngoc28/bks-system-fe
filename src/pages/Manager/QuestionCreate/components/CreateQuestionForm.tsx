import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { CreateQuestionFormValues, CreateQuestionProps, QuestionRecord, ChatbotAnswerForm } from "@/dataHelper/chatbot.dataHelper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { chatbotQuestionCreateSchema } from "@/shared/shema";
import { useChatbotAllQuery } from "@/hooks/useChatbotQuery";
import { PlainTextarea } from "@/components/ui/textarea";

const defaultAnswer: ChatbotAnswerForm = { content: "", next_question_id: null, _action: "create" };

const QuestionTypeOptions = [
  { label: "questions.create.type_question", value: 0 },
  { label: "questions.create.type_answer", value: 1 },
];

const CreateQuestionForm = ({ defaultValues, onSubmit, isSubmitting, submitLabel, showResetButton = true, currentQuestionId }: CreateQuestionProps) => {
  const { t } = useTranslation();
  const schema = chatbotQuestionCreateSchema(t);

  const fallbackValues = useMemo<CreateQuestionFormValues>(
    () => ({
      content: "",
      type: 0,
      is_start_node: 0,
      answers: [defaultAnswer],
    }),
    [],
  );

  // Initialize the form
  const form = useForm<CreateQuestionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues ?? fallbackValues,
    values: defaultValues,
  });

  const { control, handleSubmit, formState, setValue, getValues, watch, register, clearErrors } = form;
  const { errors } = formState;
  const { fields: answerFields, append, remove, replace } = useFieldArray({ control, name: "answers" });

  const typeOptions = useMemo(() => QuestionTypeOptions, []);
  const answers = watch("answers");
  const typeValue = watch("type");
  const { data: questionListData, isLoading: isQuestionsLoading } = useChatbotAllQuery();
  const questionOptions = useMemo<QuestionRecord[]>(() => questionListData?.data ?? [], [questionListData]);
  const selectableQuestionOptions = useMemo(
    () => questionOptions.filter((option) => Number(option.is_start_node) !== 1),
    [questionOptions],
  );
  const selfId = currentQuestionId ?? null;
  const formatQuestionType = (type?: number) => {
    if (type === 0) return t("questions.create.type_question");
    if (type === 1) return t("questions.create.type_answer");
    return t("questions.create.type_unknown");
  };
  const answersRootError = !Array.isArray(errors.answers) ? errors.answers?.message : undefined;

  const handleAddAnswer = () => {
    append({ ...defaultAnswer, _action: "create" });
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length === 1) return;
    remove(index);
  };

  useEffect(() => {
    if (typeValue === 1) {
      const currentAnswers = getValues("answers");
      if (currentAnswers.length !== 0) {
        const answersWithIds = currentAnswers.filter((answer) => answer.id);
        if (answersWithIds.length > 0) {
          replace(
            answersWithIds.map((answer) => ({
              id: answer.id,
              content: answer.content ?? "",
              next_question_id: null,
              _action: "delete" as const,
            })),
          );
        } else {
          replace([]);
        }
      }
      setValue("is_start_node", 0);
      clearErrors("answers");
    } else if (typeValue === 0) {
      const currentAnswers = getValues("answers");
      if (!currentAnswers || currentAnswers.length === 0) {
        replace([{ ...defaultAnswer, _action: "create" }]);
      }
    }
  }, [typeValue, getValues, replace, setValue, clearErrors]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card className="border-blue-100 shadow-sm">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">{t("questions.create.basic_information")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="question-content">{t("questions.create.content_label")}</Label>
            <Controller
              control={control}
              name="content"
              rules={{ required: t("questions.create.errors.content_required") as string }}
              render={({ field }) => (
                <div className="flex flex-col gap-1">
                  <PlainTextarea
                    id="question-content"
                    rows={5}
                    placeholder={t("questions.create.content_placeholder") ?? ""}
                    disableResize
                    {...field}
                  />
                  {errors.content && <span className="text-xs text-red-500">{errors.content.message}</span>}
                </div>
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("questions.create.type_label")}</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={String(field.value)} onValueChange={(value) => field.onChange(Number(value))}>
                  <SelectTrigger className="w-full text-left">
                    <SelectValue placeholder={t("questions.create.type_placeholder") ?? ""} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)} className="whitespace-normal">
                        {t(option.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {typeValue === 0 ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="question-start-node">{t("questions.create.is_start_node")}</Label>
              <Controller
                control={control}
                name="is_start_node"
                render={({ field }) => (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      id="question-start-node"
                      className={cn("flex items-center gap-2 rounded-full border border-blue-200 px-3 py-1 text-sm", field.value === 1 ? "bg-blue-50 text-blue-600" : "bg-white text-slate-600")}
                      onClick={() => field.onChange(field.value === 1 ? 0 : 1)}
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: field.value === 1 ? "#2563eb" : "#CBD5F5" }} />
                      {field.value === 1 ? t("questions.create.start_yes") : t("questions.create.start_no")}
                    </button>
                    <span className="text-sm text-slate-600">{field.value === 1 ? t("questions.create.start_yes") : t("questions.create.start_no")}</span>
                  </div>
                )}
              />
            </div>
          ) : (
            <input type="hidden" {...register("is_start_node", { valueAsNumber: true })} value={0} readOnly />
          )}
        </CardContent>
      </Card>

      {typeValue === 0 && (
        <Card className="border-blue-100 shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold text-slate-800">{t("questions.create.answers_section")}</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddAnswer} className="flex w-full items-center justify-center gap-2 sm:w-auto">
              <Plus className="size-4" />
              {t("questions.create.add_answer")}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {answers.map((answer, index) => {
              const fieldMeta = answerFields[index];
              return (
                <div key={fieldMeta?.id ?? index} className="rounded-lg border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">{t("questions.create.answer_label", { index: index + 1 })}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn("text-slate-400 hover:text-red-500", answers.length === 1 && "cursor-not-allowed opacity-60")}
                      onClick={() => handleRemoveAnswer(index)}
                      disabled={answers.length === 1}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>

                  <input
                    type="hidden"
                    {...register(`answers.${index}.id`, {
                      setValueAs: (value) => {
                        if (value === "" || value === null || value === undefined) return undefined;
                        const parsed = Number(value);
                        return Number.isFinite(parsed) ? parsed : undefined;
                      },
                    })}
                    value={answer?.id ?? ""}
                    readOnly
                  />
                  <input type="hidden" {...register(`answers.${index}._action`)} value={answer?._action ?? "update"} readOnly />
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`answer-content-${index}`}>{t("questions.create.answer_content_label")}</Label>
                      <Controller
                        control={control}
                        name={`answers.${index}.content`}
                        rules={{ required: t("questions.create.errors.answer_content_required") as string }}
                        render={({ field }) => (
                          <div className="flex flex-col gap-1">
                            <PlainTextarea
                              id={`answer-content-${index}`}
                              rows={3}
                              placeholder={t("questions.create.answer_content_placeholder") ?? ""}
                              disableResize
                              {...field}
                              disabled={answer._action === "delete"}
                            />
                            {errors.answers?.[index]?.content && <span className="text-xs text-red-500">{errors.answers[index]?.content?.message}</span>}
                          </div>
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`answer-next-question-${index}`}>{t("questions.create.next_question_label")}</Label>
                      <Controller
                        control={control}
                        name={`answers.${index}.next_question_id`}
                        render={({ field }) => (
                          <div className="flex flex-col gap-1">
                            <Select
                              value={field.value === null || field.value === undefined ? "__clear__" : String(field.value)}
                              onValueChange={(value) => {
                                if (value === "__clear__") {
                                  field.onChange(null);
                                  return;
                                }
                                field.onChange(Number(value));
                              }}
                            >
                              <SelectTrigger id={`answer-next-question-${index}`} className="w-full text-left">
                                <SelectValue placeholder={isQuestionsLoading ? t("questions.create.next_question_loading") : t("questions.create.next_question_placeholder")} />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                <SelectItem value="__clear__" className="whitespace-normal">
                                  {t("questions.create.no_redirect_option")}
                                </SelectItem>
                                {questionOptions.length === 0 && (
                                  <SelectItem value="__empty" disabled className="whitespace-normal">
                                    {isQuestionsLoading ? t("questions.create.next_question_loading") : t("questions.create.no_question_available")}
                                  </SelectItem>
                                )}
                                {selectableQuestionOptions.map((option) => {
                                  const isSelf = selfId === option.id;
                                  return (
                                    <SelectItem key={option.id} value={String(option.id)} className="whitespace-normal" disabled={isSelf}>
                                      {`${option.content} – ${formatQuestionType(option.type)}`}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                            {errors.answers?.[index]?.next_question_id && <span className="text-xs text-red-500">{errors.answers[index]?.next_question_id?.message}</span>}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {answersRootError && <span className="text-sm text-red-500">{answersRootError}</span>}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        {showResetButton && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => {
              setValue("content", "");
              setValue("type", 0);
              setValue("is_start_node", 0);
              setValue("answers", [defaultAnswer]);
            }}
            className="w-full sm:w-auto"
          >
            {t("questions.create.reset")}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? t("common.processing") : (submitLabel ?? t("questions.create.submit"))}
        </Button>
      </div>
    </form>
  );
};

export default CreateQuestionForm;
