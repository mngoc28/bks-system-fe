import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Truyền imageSrc qua context cho các route con.
 * @param imageSrc Đường dẫn ảnh minh họa cho từng trang Auth
 */
type Props = {
    imageSrc?: string;
};

const AuthImageOutlet: React.FC<Props> = ({ imageSrc }) => <Outlet context={{ imageSrc }} />;

export default AuthImageOutlet;
