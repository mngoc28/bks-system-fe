import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { News, NewsTableProps } from "@/dataHelper/news.dataHelper";
import { useTranslation } from "react-i18next";
import NewsTableHeader from "./NewsTableHeader";
import RowActions from "@/components/RowActions/RowActions";
import { statusNews } from "@/utils/utils";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { ImageIcon } from "lucide-react";
// import { useNavigate } from "react-router";
// import { ROUTERS } from "@/constant";

const NewsTable: React.FC<NewsTableProps> = ({ news, onDelete, onEdit, onView, onSort, sortField, sortDirection }) => {
    const {t} = useTranslation();
    // const navigate = useNavigate();
    return (
        <div className="flex flex-1 flex-col">
            <div className="w-full overflow-auto rounded-xl border border-blue-100 bg-white shadow-sm">
                <Table className="min-w-max text-sm text-slate-700 font-medium">
                    <NewsTableHeader onSort={onSort} sortField={sortField} sortDirection={sortDirection} />
                <TableBody>
                    {news?.data.map((newsItem: News) => (
                        <TableRow key={newsItem.id} >
                            <TableCell className="px-4 py-3 text-center align-middle">{newsItem.id}</TableCell>
                            <TableCell className="">
                                {
                                    newsItem.image_url !== null && newsItem.image_url !== "" ? (
                                        <img  
                                        src={CLOUDINARY_HEADER_IMAGE_URL + '/' + newsItem.image_url} 
                                        alt={newsItem.title} className="w-[150px] h-[150px] object-cover" 
                                        onError={(e) => (e.currentTarget.src = "/assets/images/photo_error2.png")}
                                        />
                                    ) : (
                                        <div className="w-[150px] h-[150px] text-center flex flex-col items-center justify-center bg-gray-200 p-4">
                                            <ImageIcon className="size-10 mx-auto mb-4 text-gray-400" />
                                            <p className="text-gray-500 text-sm">{t("news.no_image")}</p>
                                        </div>
                                    )
                                }
                            </TableCell>
                            <TableCell className="px-4 py-3 align-middle">{newsItem.user_name}</TableCell>
                            <TableCell className="px-4 py-3 align-middle">{newsItem.title}</TableCell>
                            {/* <TableCell className="px-4 py-3 align-middle two-lines">{newsItem.summary}</TableCell> */}
                            <TableCell className="px-4 py-3 align-middle">{newsItem.published_at ? new Date(newsItem.published_at).toLocaleString() : ""}</TableCell>
                            <TableCell className={`px-4 py-3 align-middle`}>
                                <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${statusNews(newsItem.status).color}`}>
                                    {t(statusNews(newsItem.status).status)}
                                </span>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center align-middle">
                                <RowActions
                                    id={newsItem.id.toString()}
                                    onView={() => onView(newsItem.id)}
                                    onEdit={() => onEdit(newsItem.id)}
                                    onDelete={() => onDelete(newsItem.id)}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        </div>
    );
}

export default NewsTable;