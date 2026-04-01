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
                return <ChevronUp className="size-4 text-slate-700" />
            } else if(sortDirection === 'desc') {
                return <ChevronDown className="size-4 text-slate-700" />
            }
        }
        return <ChevronsUpDown className="size-4 text-slate-500" />
    }
    // render sortable header
    const renderSortableHeader = (field: string, label: string) => {
       return (
        <TableHead
            className="cursor-pointer whitespace-nowrap border-r border-slate-200 px-4 py-3 text-center text-slate-700 font-semibold"
            onClick={() => onSort(field)}
            aria-sort={sortField === field ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
            <span className="flex items-center justify-between gap-1">
                {label}
                {renderSortIcon(field)}
            </span>
        </TableHead>
       );
    }
    return (
      <TableHeader>
        <tr className="border-b border-slate-200 bg-slate-50/80">
            {renderSortableHeader("id", t("news.table_id"))}
            <TableHead className="whitespace-nowrap border-r border-slate-200 px-4 py-3 text-slate-700 font-semibold">
                {t("news.table_image")}
            </TableHead>
            {renderSortableHeader("user_name", t("news.table_user"))}
            {renderSortableHeader("title", t("news.table_title"))}
            {/* {renderSortableHeader("summary", t("news.table_summary"))} */}
            {renderSortableHeader("published_at", t("news.table_published_at"))}           
            {renderSortableHeader("status", t("news.table_status"))}
            <TableHead className="cursor-pointer whitespace-nowrap border-r border-slate-200 px-4 py-3 text-center text-slate-700 font-semibold">
                {t("common.actions")}
            </TableHead>
        </tr>
      </TableHeader>   
    );
}

export default NewsTableHeader;