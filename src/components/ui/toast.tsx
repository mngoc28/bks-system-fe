import { toast } from "sonner";

const toastSuccess = (message: string) => {
  toast.success(message, {
    style: {
      background: "#10B981",
      color: "#FFFFFF",
    },
    className: "border-green-500",
  });
};

const toastError = (message: string) => {
  toast.error(message, {
    style: {
      background: "#EF4444",
      color: "#FFFFFF",
    },
    className: "border-red-500",
  });
};

const toastWarning = (message: string) => {
  toast.warning(message, {
    style: {
      background: "#F59E0B",
      color: "#FFFFFF",
    },
    className: "border-yellow-500",
  });
};

const toastInfo = (message: string) => {
  toast.info(message, {
    style: {
      background: "#007BFF",
      color: "#FFFFFF",
    },
    className: "border-blue-500",
  });
};

export { toastSuccess, toastError, toastWarning, toastInfo };
