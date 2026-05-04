import { TableHead, TableHeader } from "@/components/ui/table";
import { NewsTableHeaderProps } from "@/dataHelper/news.dataHelper";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

const NewsTableHeader: React.FC<NewsTableHeaderProps> = ({ onSort, sortField, sortDirection }) => {
    const {t} = useTranslation();

    // render sort icon dựa trên sort state từ parent
    const renderSortIcon = (field: string) => {
        if(field === sortField) {
            if(sortDirection === 'asc') {
                return <ChevronUp className="size-4" />
            } else if(sortDirection === 'desc') {
                return <ChevronDown className="size-4" />
            }
        }
        return <ChevronsUpDown className="size-4" />
    }
    // render sortable header
    const renderSortableHeader = (field: string, label: string) => {
       return (
        <TableHead
            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
            onClick={() => onSort(field)}
            aria-sort={sortField === field ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                {renderSortIcon(field)}
            </span>
        </TableHead>
       );
    }
    return (
      <TableHeader className="sticky top-0 z-10 bg-slate-100">
        <tr className="border-b border-gray-300">
            {renderSortableHeader("id", t("news.table_id"))}
                        <TableHead className="whitespace-nowrap px-4 py-3 text-center text-slate-700">
                <span className="inline-flex items-center gap-1">
                  {t("news.table_image")}
                </span>
            </TableHead>
            {renderSortableHeader("user_name", t("news.table_user"))}
            {renderSortableHeader("title", t("news.table_title"))}
            {/* {renderSortableHeader("summary", t("news.table_summary"))} */}
            {renderSortableHeader("published_at", t("news.table_published_at"))}           
            {renderSortableHeader("status", t("news.table_status"))}
            <TableHead className="whitespace-nowrap px-4 py-3 text-center text-slate-700">
                {t("common.actions")}
            </TableHead>
        </tr>
      </TableHeader>   
    );
}

export default NewsTableHeader;