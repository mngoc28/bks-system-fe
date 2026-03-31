import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BuildingCardProps } from "@/dataHelper/building.dataHelper";
import { Edit, Trash2 } from "lucide-react";
import { useGetUserProfileByIdQuery } from "@/hooks/useUserQuery";

const BuildingCard: React.FC<BuildingCardProps> = ({ building, onEdit, onDelete, isDeleting = false }) => {
  const { t } = useTranslation();
  const { data: createdByData, isLoading: isLoadingCreatedBy, isError: isErrorCreatedBy } = useGetUserProfileByIdQuery(building.created_by);

  const createdByUser = React.useMemo(() => {
    if (!createdByData) return null;
    return createdByData?.data || null;
  }, [createdByData]);

  const createdByName = React.useMemo(() => {
    if (isLoadingCreatedBy) return t("common.loading");
    if (isErrorCreatedBy || !createdByUser?.name) {
      return building.created_by ? building.created_by.toString() : "-";
    }
    return createdByUser.name;
  }, [isLoadingCreatedBy, isErrorCreatedBy, createdByUser, building.created_by, t]);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{building.name}</h3>
          <p className="text-gray-600">
            {building.province_name} - {building.ward_name}
          </p>
          <p className="text-sm text-gray-500">{building.area}</p>
          {building.description && <p className="mt-2 text-sm text-gray-600">{building.description}</p>}
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span>
              {t("buildings.created_by")}: {createdByName}
            </span>
            <span>
              {t("buildings.updated_at")}: {new Date(building.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(building)}>
            <Edit className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(building)} disabled={isDeleting} className="text-red-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default BuildingCard;
