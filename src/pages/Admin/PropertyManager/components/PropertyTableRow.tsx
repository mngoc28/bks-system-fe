import RowActions from "@/components/RowActions/RowActions";
import { TableCell, TableRow } from "@/components/ui/table";
import { ROUTERS } from "@/constant";
import { PropertyTableRowProps } from "@/dataHelper/property.dataHelper";
import { useNavigate } from "react-router-dom";
import PropertyImagesCell from "./PropertyImagesCell";
import { highlightText } from "@/utils/utils";

const PropertyTableRow: React.FC<PropertyTableRowProps> = ({ property, onDelete, highlightTerms }) => {
  const navigate = useNavigate();

  return (
    <TableRow key={property.id} className="h-[120px] hover:bg-muted/50">
      <TableCell className="px-4 py-3 text-center align-middle text-slate-700">{property.id}</TableCell>
      <TableCell className="px-4 py-3 align-middle">
        <PropertyImagesCell propertyId={property.id} coverImageUrl={property.cover_image_url} />
      </TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(property.name, highlightTerms?.name || "")}</TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-700">{property.user_name}</TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(property.province_name, highlightTerms?.province_name || "")}</TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-700">{highlightText(property.ward_name, highlightTerms?.ward_name || "")}</TableCell>
      <TableCell className="px-4 py-3 text-center align-middle text-slate-700">{property.area}</TableCell>
      <TableCell className="px-4 py-3 align-middle text-slate-700">
        <RowActions
          id={property.id.toString()}
          onView={() => {
            navigate(`${ROUTERS.PROPERTIES_DETAIL}/${property.id}`);
          }}
          onEdit={() => {
            navigate(`${ROUTERS.PROPERTIES_EDIT}/edit-property/${property.id}`);
          }}
          onDelete={() => {
            onDelete(property.id);
          }}
        />
      </TableCell>
    </TableRow>
  );
};

export default PropertyTableRow;


