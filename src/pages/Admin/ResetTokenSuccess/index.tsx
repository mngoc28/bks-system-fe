import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { ROUTERS } from "@/constant";
import { FaFacebookF, FaGoogle, FaMap, FaPhone } from "react-icons/fa";
import { CheckCircle } from "lucide-react";

/**
 * Reset Token Success Page
 * A confirmation view displayed after a user successfully resets their account token, offering next steps and support links.
 */
const ResetTokenSuccess: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const help = [
        { icon: <FaFacebookF />, link: "https://www.facebook.com/p/Goline-Global-100087327858015/", title: t("verify_email.facebook") },
        { icon: <FaGoogle />, link: "https://goline.vn/vi", title: t("verify_email.website") },
        { icon: <FaMap />, link: "https://www.google.com/maps/dir/16.0758418,108.2261504/16.0750199,108.2221424/@16.0754308,108.2215523,1083m/data=!3m2!1e3!4b1!4m4!4m3!1m1!4e1!1m0?entry=ttu&g_ep=EgoyMDI1MTEzMC4wIKXMDSoASAFQAw%3D%3D", title: t("verify_email.address") },
        { icon: <FaPhone />, link: "tel:0986989199", title: t("verify_email.phone") },
    ];

    return (
        <div className="flex min-h-screen w-screen items-center justify-center bg-slate-200 p-4">
            <div className="h-auto w-full max-w-lg md:size-3/5">
                <div className=" ">
                    <div className="grid size-full grid-cols-1 grid-rows-3 rounded-lg bg-white px-5">
                        <div className="flex flex-col items-center justify-center">
                            <CheckCircle className="size-[80px] text-emerald-500" />
                            <p className="text-center font-roboto text-xl text-green-500">
                                {t("verify_email.reset_token_success") || "Reset token verify email successfully"}
                            </p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <button
                                onClick={() => navigate(ROUTERS.PARTNER_LOGIN)}
                                className="w-full rounded-sm border border-green-500 bg-green-500 px-10 py-2 text-white">
                                {t("verify_email.back_to_login") || "Back to Login"}
                            </button>
                        </div>
                        <div className="mb-5 flex flex-col items-center justify-center">
                            <p className="mb-5 px-6 text-center text-sm">{t("verify_email.help")}</p>
                            <div className="flex flex-row gap-5">
                                {help.map((item, index) => {
                                    return (
                                        <a
                                            key={index}
                                            href={item.link}
                                            className="grid items-center justify-center text-2xl text-gray-600 transition-colors hover:text-blue-500"
                                        >
                                            {item.icon}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-5 px-6 text-center text-sm">
                    {t("verify_email.footer")}
                </div>
            </div>
        </div>
    );
};

export default ResetTokenSuccess;

