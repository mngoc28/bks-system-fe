import { SortControlsProps } from "@/dataHelper/property.dataHelper";
import { useTranslation } from "react-i18next";

const SortControls: React.FC<SortControlsProps> = ({ hasSort, onClearSort }) => {
  const { t } = useTranslation();

  if (!hasSort) return null;

  return (
    <div>
      <button
        type="button"
        className="flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-indigo-600"
        onClick={onClearSort}
      >
        {t("properties.delete_sort")}
      </button>
    </div>
  );
};

export default SortControls;


