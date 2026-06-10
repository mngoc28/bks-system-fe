import { toast, type ExternalToast } from "sonner";

type ToastExtraOptions = Pick<ExternalToast, "action" | "duration" | "id">;

const TOAST_STYLES = {
  success: {
    style: { background: "#10B981", color: "#FFFFFF" },
    className: "border-green-500",
  },
  error: {
    style: { background: "#EF4444", color: "#FFFFFF" },
    className: "border-red-500",
  },
  warning: {
    style: { background: "#F59E0B", color: "#FFFFFF" },
    className: "border-yellow-500",
  },
  info: {
    style: { background: "#007BFF", color: "#FFFFFF" },
    className: "border-blue-500",
  },
  loading: {
    style: { background: "#64748B", color: "#FFFFFF" },
    className: "border-slate-500",
  },
} as const;

const toastSuccess = (message: string, options?: ToastExtraOptions) => {
  toast.success(message, { ...TOAST_STYLES.success, ...options });
};

const toastError = (message: string, options?: ToastExtraOptions) => {
  toast.error(message, { ...TOAST_STYLES.error, ...options });
};

const toastWarning = (message: string, options?: ToastExtraOptions) => {
  toast.warning(message, { ...TOAST_STYLES.warning, ...options });
};

const toastInfo = (message: string, options?: ToastExtraOptions) => {
  toast.info(message, { ...TOAST_STYLES.info, ...options });
};

const toastLoading = (message: string, options?: ToastExtraOptions) => {
  return toast.loading(message, { ...TOAST_STYLES.loading, ...options });
};

const toastDismiss = (id?: string | number) => {
  toast.dismiss(id);
};

export { toastSuccess, toastError, toastWarning, toastInfo, toastLoading, toastDismiss };
