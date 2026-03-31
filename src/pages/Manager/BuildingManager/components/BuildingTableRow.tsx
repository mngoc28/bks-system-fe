import RowActions from "@/components/RowActions/RowActions";
import { TableCell, TableRow } from "@/components/ui/table";
import { ROUTERS } from "@/constant";
import { BuildingTableRowProps } from "@/dataHelper/building.dataHelper";
import { useNavigate } from "react-router-dom";
import BuildingImagesCell from "./BuildingImagesCell";

const BuildingTableRow: React.FC<BuildingTableRowProps> = ({ building, onDelete }) => {
  const navigate = useNavigate();

  return (
    <TableRow key={building.id} className="hover:bg-muted/50">
      <TableCell className="px-4 py-3 text-center align-middle">{building.id}</TableCell>
      <TableCell className="px-4 py-3 align-middle">
        <BuildingImagesCell buildingId={building.id} />
      </TableCell>
      <TableCell className="px-4 py-3 align-middle">{building.name}</TableCell>
      <TableCell className="px-4 py-3 align-middle">{building.user_name}</TableCell>
      <TableCell className="px-4 py-3 align-middle">{building.province_name}</TableCell>
      <TableCell className="px-4 py-3 align-middle">{building.ward_name}</TableCell>
      <TableCell className="px-4 py-3 align-middle">{building.area}</TableCell>
      <TableCell className="px-4 py-3 text-center align-middle">
        <RowActions
          id={building.id.toString()}
          onView={() => {
            navigate(`${ROUTERS.BUILDINGS_DETAIL}/${building.user_id}/${building.id}`);
          }}
          onEdit={() => {
            navigate(`${ROUTERS.BUILDINGS_EDIT}/edit-building/${building.user_id}/${building.id}`);
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

