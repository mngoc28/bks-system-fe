// src/components/PermissionRoute.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { usePermissionStore } from "@/store/usePermissionStore";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface PermissionRouteProps {
  requiredCode: string;
  children: React.ReactNode;
  redirectPath?: string;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({
  requiredCode,
  children,
}) => {
  const { t } = useTranslation();
  const permissions = usePermissionStore((state) => state.permissions);
  const navigate = useNavigate();
  const canAccess = Array.isArray(permissions)
    ? permissions.includes(requiredCode)
    : permissions.has(requiredCode);

    useEffect(() => {
      if (!canAccess) {
        toast.error(t("screenPermissions.error_permission"));
        navigate(-1);
      }
    }, [canAccess, navigate, t]);
  
    if (!canAccess) {
      return null;
    }

  return <>{children}</>;
};

export default PermissionRoute;