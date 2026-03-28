import { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { ROUTERS } from "../constant";

/**
 * Hàm điều hướng đến trang 404 Not Found
 * @param navigate - Hàm navigate từ useNavigate hook
 * @param replace - Có thay thế lịch sử điều hướng hay không, mặc định là true
 */
export const redirectTo404 = (navigate: NavigateFunction, replace: boolean = true): void => {
  navigate(ROUTERS.NOT_FOUND, { replace });
};

/**
 * Hàm kiểm tra xem một ID có hợp lệ hay không
 * @param id - ID cần kiểm tra
 * @param navigate - Hàm navigate từ useNavigate hook
 * @returns boolean - true nếu ID hợp lệ, false nếu không
 */
export const validateIdOrRedirect = (id: string | undefined, navigate: NavigateFunction): boolean => {
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    redirectTo404(navigate);
    return false;
  }
  return true;
};

export const handleError = (message: string | Record<string, string[]>) => {
  if (typeof message === 'object') {
    Object.values(message).forEach(messages => {
      if (Array.isArray(messages)) {
        messages.forEach(msg => {
          toast.error(msg);
        });
      }
    });
    return;
  }
  toast.error(message);
};