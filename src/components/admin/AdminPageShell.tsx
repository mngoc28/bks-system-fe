import React from "react";
import { adminTheme } from "@/lib/adminTheme";
import { cn } from "@/lib/utils";

type AdminPageShellProps = {
  children: React.ReactNode;
  className?: string;
};

const AdminPageShell: React.FC<AdminPageShellProps> = ({ children, className }) => (
  <div className={cn(adminTheme.page, className)}>{children}</div>
);

export default AdminPageShell;
