import React from "react";
import { Outlet, useOutletContext } from "react-router-dom";

const AuthLayout: React.FC = () => {
    const { imageSrc } = useOutletContext<{ imageSrc?: string }>();

    return (
        <div className="flex min-h-screen w-full">
            {/* Left side - Auth Form */}
            <div className="flex w-full items-center justify-center p-6 md:w-1/2 md:p-0">
                <div className="flex w-full max-w-[400px] flex-col items-center">
                    <div className="mb-6 flex h-[100px] w-[200px] items-center justify-center rounded-lg">
                        <img src="/icons/Logo.svg" alt="Horizon Study Logo" className="m-auto block size-full object-contain" aria-label="Horizon Study Logo" />
                    </div>
                    <Outlet />
                </div>
            </div>

            {/* Right side - Illustration */}
            <div className="hidden w-1/2 items-center justify-center bg-slate-50 md:flex">
                {imageSrc && <img src={imageSrc} className="m-auto size-auto max-h-[512px] max-w-[512px] rounded-lg object-contain" alt="Auth Illustration" />}
            </div>
        </div>
    );
};
export default AuthLayout;
