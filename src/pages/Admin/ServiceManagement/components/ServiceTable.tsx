import RowActions from "@/components/RowActions/RowActions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServiceTableProps } from "@/dataHelper/service.dataHelper"
import { safeFormatDateTime } from "@/utils/dateUtils";
import { t } from "i18next";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react"

const ServiceTable: React.FC<ServiceTableProps> = ({
    filtered,
    onEdit,
    onView,
    onDelete,
    onSort,
    filters,
}) => {
    return (
            <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm">
                <Table className="min-w-max text-sm text-slate-700">
                    <TableHeader className="sticky top-0 z-10 bg-slate-100">
                        <tr className="border-b border-gray-300">
...
                            <TableHead
                                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                                onClick={() => onSort("id")}
                                aria-sort={filters.sort_field === "id" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {t('serviceManagement.id')}
                                    {filters.sort_field === "id" ? (
                                        filters.sort_direction === "asc" ? (
                                            <ChevronUp className="size-4 text-slate-700" />
                                        ) : (
                                            <ChevronDown className="size-4 text-slate-700" />
                                        )
                                    ) : (
                                            <ChevronsUpDown className="size-4 text-slate-500" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                                onClick={() => onSort("name")}
                                aria-sort={filters.sort_field === "name" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {t('serviceManagement.name')}
                                    {filters.sort_field === "name" ? (
                                        filters.sort_direction === "asc" ? (
                                            <ChevronUp className="size-4 text-slate-700" />
                                        ) : (
                                            <ChevronDown className="size-4 text-slate-700" />
                                        )
                                    ) : (
                                        <ChevronsUpDown className="size-4 text-slate-500" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                                aria-sort={filters.sort_field === "price" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {t('serviceManagement.price')}
                                </span>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                                onClick={() => onSort("created_at")}
                                aria-sort={filters.sort_field === "created_at" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {t('serviceManagement.create_at')}
                                    {filters.sort_field === "created_at" ? (
                                        filters.sort_direction === "asc" ? (
                                            <ChevronUp className="size-4 text-slate-700" />
                                        ) : (
                                            <ChevronDown className="size-4 text-slate-700" />
                                        )
                                    ) : (
                                        <ChevronsUpDown className="size-4 text-slate-500" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                                onClick={() => onSort("updated_at")}
                                aria-sort={filters.sort_field === "updated_at" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {t('serviceManagement.update_at')}
                                    {filters.sort_field === "updated_at" ? (
                                        filters.sort_direction === "asc" ? (
                                            <ChevronUp className="size-4 text-slate-700" />
                                        ) : (
                                            <ChevronDown className="size-4 text-slate-700" />
                                        )
                                    ) : (
                                        <ChevronsUpDown className="size-4 text-slate-500" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t('serviceManagement.action')}</TableHead>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((service) => (
                            <TableRow key={service.id} className="">
                                <TableCell className="px-4 py-3 text-center text-slate-700">{service.id}</TableCell>
                                <TableCell className="px-4 py-3 text-slate-700">{service.name}</TableCell>
                                <TableCell className="px-4 py-3 text-slate-700">{service.price.toLocaleString()}</TableCell>
                                <TableCell className="px-4 py-3 text-slate-700">{safeFormatDateTime(service.created_at)}</TableCell>
                                <TableCell className="px-4 py-3 text-slate-700">{safeFormatDateTime(service.updated_at)}</TableCell>
                                <TableCell className="px-4 py-3 text-slate-700">
                                    <RowActions
                                        id={service.id.toString()}
                                        onView={(id: string |number) => onView(Number(id))}
                                        onEdit={(id: string |number ) => onEdit(Number(id))}
                                        onDelete={(id: string |number ) => onDelete(Number(id))}
                                    />  
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
    )
};

export default ServiceTable;