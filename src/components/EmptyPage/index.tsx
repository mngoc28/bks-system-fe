import React from "react";
import { useTranslation } from "react-i18next";
import { EmptyPageProps } from "../type";
import { Database } from "lucide-react";

const EmptyPage: React.FC<EmptyPageProps> = ({
  title = "common.empty_title",
  description = "common.empty_description",
  loading = true,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="flex size-24 items-center justify-center rounded-full bg-primary/5 ring-8 ring-primary/5">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Database className="size-8 text-primary/60" strokeWidth={1.5} />
          </div>
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-1 -right-1 size-3 rounded-full bg-primary/20" />
        <div className="absolute -bottom-1 -left-2 size-2 rounded-full bg-slate-200" />
      </div>

      <h3 className="text-lg font-semibold text-slate-700">{t(title)}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-400 leading-relaxed">{t(description)}</p>

      {!loading && (
        <button
          onClick={() => window.location.reload()}
          className="mt-6 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary transition-all hover:bg-primary/10"
        >
          {t("common.reload", { defaultValue: "Tải lại" })}
        </button>
      )}
    </div>
  );
};

export default EmptyPage;
