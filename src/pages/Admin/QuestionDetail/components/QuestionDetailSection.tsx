import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { QuestionDetailProps } from "@/dataHelper/chatbot.dataHelper";
import { cn } from "@/lib/utils";
import { Bot, MapPinned, PlayCircle, Shuffle } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Question Detail Section
 * Renders the core information of a question, including its position in the flowchart and a table of possible answers.
 */
const QuestionDetailSection = ({ detail, onNavigateNext }: QuestionDetailProps) => {
  const { t } = useTranslation();
  const totalAnswers = detail.answers.length;
  const isAnswerType = detail.type === 1;
  const typeLabel = isAnswerType ? t("questions.detail.type_answer") : t("questions.detail.type_question");

  const renderBadgeClass = detail.is_start_node ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700";

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Bot className="size-5" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-800">{t("questions.detail.title")}</CardTitle>
          </div>

          <div className="flex flex-col gap-3 text-sm text-slate-500 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
            <div className="flex items-center gap-1">
              <MapPinned className="size-4" />
              <span>
                {detail.position_x}, {detail.position_y}
              </span>
            </div>
            <div className="hidden h-4 w-px bg-slate-200 lg:block" aria-hidden="true" />
            <div className="flex items-center gap-1">
              <Shuffle className="size-4" />
              <span>
                {t("questions.detail.type")}: {typeLabel}
              </span>
            </div>
            <div className="hidden h-4 w-px bg-slate-200 lg:block" aria-hidden="true" />
            <div className="flex items-center gap-1">
              <PlayCircle className="size-4" />
              <span>{t("questions.detail.answers", { count: totalAnswers })}</span>
            </div>
            <Badge variant="secondary" className={cn("mt-2 w-fit rounded-full border-none px-3 py-1 text-xs font-medium lg:mt-0", renderBadgeClass)}>
              {detail.is_start_node ? t("questions.detail.start_node") : t("questions.detail.standard_node")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-primary/10 bg-blue-50/60 p-4 text-sm text-slate-700">
            <p className="whitespace-pre-wrap break-words font-medium text-slate-800">{detail.content}</p>
          </div>
          {!isAnswerType && (
            <>
              <div className="hidden overflow-auto rounded-lg border border-slate-200 lg:block">
                <Table className="w-full table-fixed bg-white text-sm text-slate-700">
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead className="w-[80px] text-center">{t("questions.detail.answer_id")}</TableHead>
                      <TableHead className="text-left">{t("questions.detail.answer_content")}</TableHead>
                      <TableHead className="w-[160px] text-center">{t("questions.detail.next_question")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_tr:last-child]:border-b-0 [&_tr>td]:px-4 [&_tr>td]:py-3 [&_tr]:border-b">
                    {detail.answers.map((answer) => (
                      <TableRow key={answer.id}>
                        <TableCell className="w-[80px] text-center font-medium text-slate-700">{answer.id}</TableCell>
                        <TableCell className="whitespace-pre-wrap break-words text-left text-slate-700">{answer.content}</TableCell>
                        <TableCell className="w-[160px] text-center text-slate-600">
                          {answer.next_question_id !== null ? (
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600 hover:text-blue-700" onClick={() => onNavigateNext?.(answer.next_question_id!)}>
                              #{answer.next_question_id}
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">{t("questions.detail.no_redirect")}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {detail.answers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="px-4 py-6 text-center text-sm text-slate-500">
                          {t("questions.detail.empty")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 lg:hidden">
                {detail.answers.map((answer) => (
                  <div key={answer.id} className="rounded-lg border border-primary/10 bg-slate-50/60 p-4 text-sm text-slate-700 shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-800">#{answer.id}</span>
                      {answer.next_question_id !== null ? (
                        <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600 hover:text-blue-700" onClick={() => onNavigateNext?.(answer.next_question_id!)}>
                          #{answer.next_question_id}
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">{t("questions.detail.no_redirect")}</span>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-700">{answer.content}</p>
                  </div>
                ))}
                {detail.answers.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">{t("questions.detail.empty")}</div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDetailSection;
