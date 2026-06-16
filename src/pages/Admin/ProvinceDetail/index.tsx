import { ROUTERS } from "@/constant"; // kept for potential future use
import { useProvinceQuery } from "@/hooks/useProvinceQuery";
import { Spinner } from "@/components/ui/spinner";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { ProvinceDetailForm } from "./components";

/**
 * Province Detail Page
 * Fetches and displays the configuration of a specific geographical province, including its localized metadata.
 */
const ProvinceDetail: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const provinceId = id ? parseInt(id, 10) : 0;
    const { data, isLoading, isError } = useProvinceQuery(provinceId);

    const province = React.useMemo(() => {
        if (!data) return undefined;
        return data;
    }, [data]);

    const handleCancel = () => {
        // navigate(-1) restores the exact ProvinceManage URL (with page/filter search params)
        // so the user returns to the same state they left
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(ROUTERS.PROVINCE_MANAGE);
        }
    }

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center p-3 sm:p-6">
                <Spinner size="lg" showText text={t("common.loading_data")} />
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