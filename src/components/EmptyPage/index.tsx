import React from "react";
import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { EmptyPageProps } from "../type";

const EmptyPage: React.FC<EmptyPageProps> = ({title ="common.empty_title", description = "common.empty_description", icon = <XCircle className="mr-2 size-10" />, loading = true}) => {
  const {t} = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="text-lg font-semibold text-slate-800">{t(title)}</div>
      <p className="mt-1 text-sm text-slate-500">{t(description)}</p>
      <div className="mt-4 flex items-center gap-2">
        <Label 
         onClick={() => !loading && window.location.reload()}
         className={`flex flex-col items-center justify-center border-slate-700 text-sm text-slate-500 ${!loading && "cursor-pointer"}`}>
          {icon}
        </Label>
      </div>
    </div>
  );
};


export default EmptyPage;
