import RowActions from "@/components/RowActions/RowActions";
import { TableCell, TableRow } from "@/components/ui/table";
import { ROUTERS } from "@/constant";
import { BuildingTableRowProps } from "@/dataHelper/building.dataHelper";
import { useNavigate } from "react-router-dom";
import BuildingImagesCell from "./BuildingImagesCell";
import { highlightText } from "@/utils/utils";

const BuildingTableRow: React.FC<BuildingTableRowProps> = ({ building, onDelete, highlightTerms }) => {
  const navigate = useNavigate();

  return (
    <TableRow key={building.id} className="h-[120px] hover:bg-muted/50">
      <TableCell className="px-4 py-3 text-center align-middle text-slate-700">{building.id}</TableCell>
      <TableCell className="px-4 py-3 align-middle">
        <BuildingImagesCell buildingId={building.id} coverImageUrl={building.cover_image_url} />
      </TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(building.name, highlightTerms?.name || "")}</TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-700">{building.user_name}</TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(building.province_name, highlightTerms?.province_name || "")}</TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(building.ward_name, highlightTerms?.ward_name || "")}</TableCell>
      <TableCell className="px-4 py-3 text-center align-middle text-slate-700">{building.area}</TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-700">
        <RowActions
          id={building.id.toString()}
          onView={() => {
            navigate(`${ROUTERS.BUILDINGS_DETAIL}/${building.id}`);
          }}
          onEdit={() => {
            navigate(`${ROUTERS.BUILDINGS_EDIT}/edit-building/${building.id}`);
          }}
          onDelete={() => {
            onDelete(building.id);
          }}
        />
      </TableCell>
    </TableRow>
  );
};

export default BuildingTableRow;

