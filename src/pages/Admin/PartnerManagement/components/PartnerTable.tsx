import RowActions from "@/components/RowActions/RowActions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CLOUDINARY_HEADER_IMAGE_URL, ROUTERS } from "@/constant"
import { PartnerTableProps } from "@/dataHelper/partner.dataHelper"
import { resolveImageUrl } from "@/utils/imageUtils"
import { highlightText } from "@/utils/utils"
import { t } from "i18next"
import { ChevronDown, ChevronsUpDown, ChevronUp, ImageIcon } from "lucide-react"
import { useNavigate } from "react-router-dom"

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
        <div className="flex flex-1 flex-col">
            <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm">
                <Table className="min-w-max text-sm text-slate-700">
                    <TableHeader className="sticky top-0 z-10 bg-slate-100">
                        <tr className="border-b border-gray-300">
                            <TableHead
                                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-center text-slate-700"
                                onClick={() => onSort("id")}
                                aria-sort={filters.sort_field === "id" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {t('partner.id')}
                                    {filters.sort_field === "id" ? (
                                        filters.sort_direction === "asc" ? (
                                            <ChevronUp className="size-4" />
                                        ) : (
                                            <ChevronDown className="size-4" />
                                        )
                                    ) : (
                                        <ChevronsUpDown className="size-4" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t('partner.image')}</TableHead>
                            <TableHead
                                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                                onClick={() => onSort("company_name")}
                                aria-sort={filters.sort_field === "company_name" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {t('partner.company_name')}
                                    {filters.sort_field === "company_name" ? (
                                        filters.sort_direction === "asc" ? (
                                            <ChevronUp className="size-4" />
                                        ) : (
                                            <ChevronDown className="size-4" />
                                        )
                                    ) : (
                                        <ChevronsUpDown className="size-4" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                                onClick={() => onSort("user_name")}
                                aria-sort={filters.sort_field === "user_name" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {t('partner.user_name')}
                                    {filters.sort_field === "user_name" ? (
                                        filters.sort_direction === "asc" ? (
                                            <ChevronUp className="size-4" />
                                        ) : (
                                            <ChevronDown className="size-4" />
                                        )
                                    ) : (
                                        <ChevronsUpDown className="size-4" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                                onClick={() => onSort("province_name")}
                                aria-sort={filters.sort_field === "province_name" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {t('partner.province_name')}
                                    {filters.sort_field === "province_name" ? (
                                        filters.sort_direction === "asc" ? (
                                            <ChevronUp className="size-4" />
                                        ) : (
                                            <ChevronDown className="size-4" />
                                        )
                                    ) : (
                                        <ChevronsUpDown className="size-4" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer select-none whitespace-nowrap px-4 py-3 text-slate-700"
                                onClick={() => onSort("ward_name")}
                                aria-sort={filters.sort_field === "ward_name" ? (filters.sort_direction === "asc" ? "ascending" : "descending") : "none"}
                            >
                                <span className="inline-flex items-center gap-1">
                                    {t('partner.ward_name')}
                                    {filters.sort_field === "ward_name" ? (
                                        filters.sort_direction === "asc" ? (
                                            <ChevronUp className="size-4" />
                                        ) : (
                                            <ChevronDown className="size-4" />
                                        )
                                    ) : (
                                        <ChevronsUpDown className="size-4" />
                                    )}
                                </span>
                            </TableHead>
                            <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t('partner.address')}</TableHead>
                            <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t('partner.phone')}</TableHead>
                            <TableHead className="whitespace-nowrap px-4 py-3 text-slate-700">{t('partner.action')}</TableHead>
                        </tr>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((partner) => (
                            <TableRow key={partner.id} className="h-[120px] hover:bg-muted/50">
                                <TableCell className="px-4 py-3 text-center align-middle text-slate-700">{partner.id}</TableCell>
                                <TableCell className="px-4 py-3 align-middle">
                                    {partner.image_1 ? (
                                        <img
                                            src={resolveImageUrl(partner.image_1, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL }) || "/assets/images/photo_error2.png"}
                                            onError={(e) => {
                                                if (e.currentTarget.src !== '/assets/images/photo_error2.png') {
                                                    e.currentTarget.src = '/assets/images/photo_error2.png';
                                                }
                                            }}
                                            className="h-[150px] w-[150px] cursor-pointer rounded object-cover"
                                            alt="Partner"
                                        />
                                    ) : (
                                        <div className="h-[150px] w-[150px] flex flex-col items-center justify-center rounded bg-gray-200 p-4 text-center">
                                            <ImageIcon className="size-10 mx-auto mb-3 text-gray-400" />
                                            <p className="text-gray-500 text-sm">{t("partner.no_images_yet")}</p>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(partner.company_name || "", filters.company_name || "")}</TableCell>
                                <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(partner.user_name || "", filters.user_name || "")}</TableCell>
                                <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(partner.province_name || "", filters.province_name || "")}</TableCell>
                                <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(partner.ward_name || "", filters.ward_name || "")}</TableCell>
                                <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(partner.address || "-", filters.address || "")}</TableCell>
                                <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(partner.phone || "-", filters.phone || "")}</TableCell>
                                <TableCell className="px-4 py-3 align-middle text-slate-700">
                                    <RowActions
                                        id={partner.id.toString()}
                                        onView={(id) => navigate(`${ROUTERS.PARTNER_MANAGEMENT}/detail/${id}`)}
                                        onEdit={(id) => navigate(`${ROUTERS.PARTNER_MANAGEMENT}/edit/${id}`)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default PartnerTable;