import { ROUTERS } from "@/constant";
import { useProvinceQuery } from "@/hooks/useProvinceQuery";
import { t } from "i18next";
import { Loader2 } from "lucide-react";
import React from "react";
import { useNavigate, useParams } from "react-router";
import { ProvinceDetailForm } from "./components";

const ProvinceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const provinceId = id ? parseInt(id, 10) : 0;
    const { data, isLoading, isError } = useProvinceQuery(provinceId);

    const province = React.useMemo(() => {
        if (!data) return undefined;
        return data;
    }, [data]);

    const handleCancel = () => {
        navigate(ROUTERS.PROVINCE_MANAGE);
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-3 sm:p-6">
                <Loader2 className="animate-spin size-6" />
            </div>
        );
    }

    if (isError || !province) {
        return (
            <div className="flex items-center justify-center p-3 sm:p-6">
                <p>{t("province.error_getting_province")}</p>
            </div>
        );
    }

    return (<ProvinceDetailForm province={province} onCancel={handleCancel} isLoading={isLoading} />);
};
export default ProvinceDetail;