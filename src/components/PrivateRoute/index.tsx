import React from "react";
import { Navigate } from "react-router-dom";
import { ROUTERS } from "../../constant";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Giả sử có một biến isAuthenticated để theo dõi trạng thái đăng nhập
  // Trong thực tế, bạn cần lấy thông tin này từ localStorage, context, hoặc redux store
  const isAuthenticated = localStorage.getItem("token") !== null;

  if (!isAuthenticated) {
    // Chuyển hướng đến trang đăng nhập nếu người dùng chưa xác thực
    return <Navigate to={ROUTERS.LOGIN} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
