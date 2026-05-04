import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatbotRecord } from "@/dataHelper/chatbot.dataHelper";
import { Edit, Trash2, MessageSquare } from "lucide-react";
import { highlightText } from "@/utils/utils";

interface QuestionCardProps {
  question: ChatbotRecord;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  searchTerm?: string;
}

/**
 * Question Card
 * Summarizes a chatbot question's content, type, and answer count in a grid layout, with quick actions for management.
 */
const QuestionCard: React.FC<QuestionCardProps> = ({ question, onView, onEdit, onDelete, searchTerm }) => {
  const { t } = useTranslation();

  return (
    <Card
      className="glass-card hover-scale group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border-none p-6 transition-all duration-300 animate-in"
      onClick={() => onView(question.id)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner dark:bg-indigo-900/30">
          <MessageSquare className="size-5" />
        </div>
        <Badge className="border-none bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
          QA-{question.id}
        </Badge>
      </div>

      <h3
        className="mb-4 line-clamp-3 text-lg font-black leading-tight text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100"
        title={question.content}
      >
        {highlightText(question.content, searchTerm || "")}
      </h3>

      <div className="mb-6 flex-1 space-y-3 border-t border-slate-50 pt-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <MessageSquare className="size-3.5 text-indigo-500" />
            {t("questions.table.total_answer")}:
          </div>
          <Badge variant="secondary" className="border-none bg-indigo-50 font-black text-indigo-600">{question.total_answers}</Badge>
        </div>

        <div className="pt-2">
          {question.is_start_node === 1 ? (
            <Badge className="w-full justify-center border-none bg-slate-900 py-1 text-[10px] uppercase tracking-widest text-white">
              {t("questions.table.start")}
            </Badge>
          ) : question.type === 1 ? (
            <Badge className="w-full justify-center border-none bg-sky-100 py-1 text-[10px] uppercase tracking-widest text-sky-700">
              {t("questions.table.type_answer")}
            </Badge>
          ) : (
            <Badge className="w-full justify-center border-none bg-emerald-100 py-1 text-[10px] uppercase tracking-widest text-emerald-700">
              {t("questions.table.type_question")}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-800"
          onClick={(e) => { e.stopPropagation(); onEdit(question.id); }}
        >
          <Edit className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-slate-100 text-slate-500 hover:border-red-100 hover:bg-red-50 hover:text-red-600 dark:border-slate-800"
          onClick={(e) => { e.stopPropagation(); onDelete(question.id); }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </Card>
  );
};

export default QuestionCard;
