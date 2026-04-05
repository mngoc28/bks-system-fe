import RowActions from "@/components/RowActions/RowActions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ROUTERS } from "@/constant"
import { PartnerTableProps } from "@/dataHelper/partner.dataHelper"
import { t } from "i18next"
import { ChevronDown, ChevronsUpDown, ChevronUp, ImageIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

const VITE_IMAGES_URL = import.meta.env.VITE_IMAGES_URL || ''

/**
 * Partner Table
 * A tabular representation of partners, supporting sorting and direct access to row actions like viewing and editing.
 */
const PartnerTable: React.FC<PartnerTableProps> = ({
    filtered,
    onSort,
    filters,
}) => {
    const navigate = useNavigate();

    return (
        <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white">
            <Table className="min-w-max bg-white text-sm text-slate-700">
                <TableHeader>
                    <tr className="bg-slate-100">
                        <TableHead
                            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                            onClick={() => onSort("id")}
                            aria-sort={filters.sort_field === "id" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                        >
                            <span className="inline-flex items-center gap-1">
                                {t('partner.id')}
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
                            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                        >
                            <span className="inline-flex items-center gap-1">
                                {t('partner.image')}
                            </span>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                            onClick={() => onSort("user_name")}
                            aria-sort={filters.sort_field === "user_name" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                        >
                            <span className="inline-flex items-center gap-1">
                                {t('partner.user_name')}
                                {filters.sort_field === "user_name" ? (
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
                            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                            onClick={() => onSort("province_name")}
                            aria-sort={filters.sort_field === "province_name" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                        >
                            <span className="inline-flex items-center gap-1">
                                {t('partner.province_name')}
                                {filters.sort_field === "province_name" ? (
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
                            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                            onClick={() => onSort("ward_name")}
                            aria-sort={filters.sort_field === "ward_name" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                        >
                            <span className="inline-flex items-center gap-1">
                                {t('partner.ward_name')}
                                {filters.sort_field === "ward_name" ? (
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
                            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                        >
                            <span className="inline-flex items-center gap-1">
                                {t('partner.address')}
                            </span>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                        >
                            <span className="inline-flex items-center gap-1">
                                {t('partner.phone')}
                            </span>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                        >
                            <span className="inline-flex items-center gap-1">
                                {t('partner.action')}
                            </span>
                        </TableHead>
                    </tr>
                </TableHeader>
                <TableBody>
                    {filtered.map((partner) => (
                        <TableRow key={partner.id} className="">
                            <TableCell className="px-4 py-3 text-center text-slate-700">{partner.id}</TableCell>
                            <TableCell className="px-4 py-3 text-center">
                                {partner.image_1 ? (
                                    <img
                                        src={`${VITE_IMAGES_URL}${partner.image_1}`}
                                        onError={(e) => {
                                            e.currentTarget.src = "/assets/images/photo_error.png";
                                        }}
                                        className="h-[150px] w-[150px] object-cover mx-auto"
                                        alt="partner"
                                    />
                                ) : (
                                    <div className="text-center flex flex-col items-center justify-center bg-gray-200 border rounded-sm p-4 h-[150px] w-[150px] mx-auto">
                                        <ImageIcon className="size-10 mx-auto mb-4 text-gray-400" />
                                        <p className="text-gray-500">{t("partner.no_images_yet")}</p>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-slate-700">{partner.user_name}</TableCell>
                            <TableCell className="px-4 py-3 text-slate-700">{partner.province_name}</TableCell>
                            <TableCell className="px-4 py-3 text-slate-700">{partner.ward_name}</TableCell>
                            <TableCell className="px-4 py-3 text-slate-700">{partner.address}</TableCell>
                            <TableCell className="px-4 py-3 text-slate-700">{partner.phone}</TableCell>
                            <TableCell className="px-4 py-3 text-slate-700">
                                <RowActions
                                    id={partner.id.toString()}
                                    onView={(id) => navigate(`${ROUTERS.PARTNER_DETAIL}/${id}`)}
                                    onEdit={(id) => navigate(`${ROUTERS.PARTNER_EDIT}/${id}`)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default PartnerTable;