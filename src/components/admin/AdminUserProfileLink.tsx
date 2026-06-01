import React from "react";
import { ROUTERS } from "@/constant";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface AdminUserProfileLinkProps {
  userId?: number | null;
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

/**
 * Drill-down link to admin user detail when userId is available.
 */
const AdminUserProfileLink: React.FC<AdminUserProfileLinkProps> = ({
  userId,
  children,
  className,
  onClick,
}) => {
  if (!userId) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      to={`${ROUTERS.USER_DETAIL}/${userId}`}
      className={cn(
        "font-medium text-primary underline-offset-2 transition-colors hover:text-primary-hover hover:underline",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default AdminUserProfileLink;
