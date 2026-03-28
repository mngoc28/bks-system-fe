import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { ROUTERS } from "@/constant";
import { FaFacebookF, FaGoogle, FaMap, FaPhone } from "react-icons/fa";

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
        <div className="bg-slate-200 flex items-center justify-center w-screen min-h-screen p-4">
            <div className="w-full max-w-lg md:w-3/5 h-auto md:h-3/5">
                <div className=" ">
                    <div className="grid grid-rows-3 grid-cols-1 bg-white w-full h-full rounded-lg px-5">
                        <div className="flex flex-col items-center justify-center">
                            <img src="/assets/images/success.png" alt="success" className="w-[80px] h-[80px]" />
                            <p className="text-xl font-roboto text-center text-green-500">
                                {t("verify_email.reset_token_success") || "Reset token verify email successfully"}
                            </p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <button
                                onClick={() => navigate(ROUTERS.LOGIN)}
                                className="bg-green-500 px-10 py-2 border border-green-500 rounded-sm text-white w-full">
                                {t("verify_email.back_to_login") || "Back to Login"}
                            </button>
                        </div>
                        <div className="flex flex-col items-center justify-center mb-5">
                            <p className="text-sm text-center mb-5 px-6">{t("verify_email.help")}</p>
                            <div className="flex flex-row gap-5">
                                {help.map((item, index) => {
                                    return (
                                        <a
                                            key={index}
                                            href={item.link}
                                            className="text-gray-600 hover:text-blue-500 text-2xl transition-colors grid items-center justify-center"
                                        >
                                            {item.icon}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="text-sm text-center mt-5 px-6">
                    {t("verify_email.footer")}
                </div>
            </div>
        </div>
    );
};

export default ResetTokenSuccess;

