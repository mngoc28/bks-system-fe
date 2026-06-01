import { Spinner } from "@/components/ui/spinner";
import { adminTheme } from "@/lib/adminTheme";
import { cn } from "@/lib/utils";

interface AdminContentLoaderProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Loading scoped to admin main content — does not cover sidebar/header.
 */
const AdminContentLoader: React.FC<AdminContentLoaderProps> = ({
  text,
  className,
  size = "lg",
}) => (
  <div className={cn(adminTheme.contentLoading, className)} role="status" aria-live="polite">
    <Spinner size={size} showText text={text} />
  </div>
);

export default AdminContentLoader;
