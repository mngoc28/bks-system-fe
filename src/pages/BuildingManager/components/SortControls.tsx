import { SortControlsProps } from "@/dataHelper/building.dataHelper";
import { useTranslation } from "react-i18next";

const SortControls: React.FC<SortControlsProps> = ({ hasSort, onClearSort }) => {
  const { t } = useTranslation();

  if (!hasSort) return null;

  return (
    <div>
      <button
        type="button"
        className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white px-2 py-2 rounded-md text-sm font-medium"
        onClick={onClearSort}
      >
        {t("buildings.delete_sort")}
      </button>
    </div>
  );
};

export default SortControls;

