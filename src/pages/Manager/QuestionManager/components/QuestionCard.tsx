import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatbotRecord } from "@/dataHelper/chatbot.dataHelper";
import { Edit, Trash2, MessageSquare } from "lucide-react";

interface QuestionCardProps {
  question: ChatbotRecord;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Question Card
 * Summarizes a chatbot question's content, type, and answer count in a grid layout, with quick actions for management.
 */
const QuestionCard: React.FC<QuestionCardProps> = ({ question, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();

  return (
    <Card
      className="glass-card hover-scale animate-in group relative overflow-hidden rounded-2xl border-none p-6 transition-all duration-300 h-full flex flex-col cursor-pointer"
      onClick={() => onView(question.id)}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner dark:bg-indigo-900/30">
          <MessageSquare className="size-5" />
        </div>
        <Badge className="bg-indigo-50 text-indigo-600 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          QA-{question.id}
        </Badge>
      </div>

      <h3
        className="mb-4 line-clamp-3 text-lg font-black leading-tight text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors"
        title={question.content}
      >
        {question.content}
      </h3>

      <div className="mb-6 space-y-3 flex-1 border-t border-slate-50 pt-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <MessageSquare className="size-3.5 text-indigo-500" />
            {t("questions.table.total_answer")}:
          </div>
          <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-black">{question.total_answers}</Badge>
        </div>

        <div className="pt-2">
          {question.is_start_node === 1 ? (
            <Badge className="bg-slate-900 text-white border-none w-full justify-center py-1 uppercase tracking-widest text-[10px]">
              {t("questions.table.start")}
            </Badge>
          ) : question.type === 1 ? (
            <Badge className="bg-sky-100 text-sky-700 border-none w-full justify-center py-1 uppercase tracking-widest text-[10px]">
              {t("questions.table.type_answer")}
            </Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-700 border-none w-full justify-center py-1 uppercase tracking-widest text-[10px]">
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
          className="h-9 rounded-lg border-slate-100 hover:bg-slate-50 hover:text-indigo-600 text-slate-500 dark:border-slate-800"
          onClick={(e) => { e.stopPropagation(); onEdit(question.id); }}
        >
          <Edit className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-lg border-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 text-slate-500 dark:border-slate-800"
          onClick={(e) => { e.stopPropagation(); onDelete(question.id); }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </Card>
  );
};

export default QuestionCard;
