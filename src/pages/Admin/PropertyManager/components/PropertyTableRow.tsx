import RowActions from "@/components/RowActions/RowActions";
import { TableCell, TableRow } from "@/components/ui/table";
import { ROUTERS } from "@/constant";
import { PropertyTableRowProps } from "@/dataHelper/property.dataHelper";
import { useNavigate } from "react-router-dom";
import PropertyImagesCell from "./PropertyImagesCell";
import { highlightText } from "@/utils/utils";
import { buildAdminUrl, toBookingsByProperty, toRoomsByProperty } from "@/utils/adminNavigation";
import { BedDouble, CalendarDays, User } from "lucide-react";
import { useTranslation } from "react-i18next";

const PropertyTableRow: React.FC<PropertyTableRowProps> = ({ property, onDelete, highlightTerms }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          viewLabel={t("adminCrossNav.view_profile")}
          editLabel={t("adminCrossNav.edit")}
          onView={() => {
            navigate(`${ROUTERS.PROPERTIES_DETAIL}/${property.id}`);
          }}
          onEdit={() => {
            navigate(`${ROUTERS.PROPERTIES_EDIT}/edit-property/${property.id}`);
          }}
          onDelete={() => {
            onDelete(property.id);
          }}
          customActions={[
            {
              key: "property-rooms",
              label: t("adminCrossNav.rooms"),
              icon: <BedDouble className="size-4" />,
              onClick: () => {
                navigate(buildAdminUrl(ROUTERS.ROOMS, toRoomsByProperty(property.id, "property-management", property.name)));
              },
            },
            {
              key: "property-bookings",
              label: t("adminCrossNav.bookings"),
              icon: <CalendarDays className="size-4" />,
              onClick: () => {
                navigate(buildAdminUrl(ROUTERS.BOOKING_MANAGE, toBookingsByProperty(property.id, "property-management", property.name)));
              },
            },
            {
              key: "property-user",
              label: t("adminCrossNav.representative_account"),
              icon: <User className="size-4" />,
              onClick: () => {
                navigate(`${ROUTERS.USER_DETAIL}/${property.user_id}`);
              },
            },
          ]}
        />
      </TableCell>
    </TableRow>
  );
};

export default PropertyTableRow;


