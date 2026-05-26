import { LoadingScreen } from "@/components/ui/loading-screen";
import { useResetTokenVerifyEmailQuery, useVerifyEmailTokenQuery } from "@/hooks/useAuthQuery";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { FaFacebookF, FaGoogle, FaMap, FaPhone } from "react-icons/fa";
import { useState, useEffect } from "react";
import { ThreeDot } from "react-loading-indicators";
import { ROUTERS } from "@/constant";
import { CheckCircle, XCircle } from "lucide-react";

/**
 * Verify Email Token Page
 * Processes the email verification token from the URL, providing visual feedback on success or failure and allowing users to request a new token if necessary.
 */
const VerifyEmailToken: React.FC = () => {
    const { t } = useTranslation();
    const { token } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useVerifyEmailTokenQuery(token as string);
    const [isClick, setIsClick] = useState(false);
    const resetTokenVerifyEmail = useResetTokenVerifyEmailQuery(token as string);
    
    useEffect(() => {
        if (resetTokenVerifyEmail.isSuccess) {
            navigate(ROUTERS.RESET_TOKEN_SUCCESS);
        }
    }, [resetTokenVerifyEmail.isSuccess, navigate]);
    const help = [
        { icon: <FaFacebookF />, link: "https://www.facebook.com/p/Goline-Global-100087327858015/", title: t("verify_email.facebook") },
        { icon: <FaGoogle />, link: "https://goline.vn/vi", title: t("verify_email.website") },
        { icon: <FaMap />, link: "https://www.google.com/maps/dir/16.0758418,108.2261504/16.0750199,108.2221424/@16.0754308,108.2215523,1083m/data=!3m2!1e3!4b1!4m4!4m3!1m1!4e1!1m0?entry=ttu&g_ep=EgoyMDI1MTEzMC4wIKXMDSoASAFQAw%3D%3D", title: t("verify_email.address") },
        { icon: <FaPhone />, link: "tel:0986989199", title: t("verify_email.phone") },
    ];
    const textResetTokenVerifyEmail = [
        { text: t("verify_email.VET1"), isSuccess: false, value: "VET1", color: "red-500", checkSuccess: false },
        { text: t("verify_email.VET2"), isSuccess: false, value: "VET2", color: "red-500", checkSuccess: false },
        { text: t("verify_email.VET3"), isSuccess: true, value: "VET3", color: "orange-500", checkSuccess: false },
        { text: t("verify_email.VET4"), isSuccess: false, value: "VET4", color: "red-500", checkSuccess: false },
        { text: t("verify_email.VET5"), isSuccess: true, value: "VET5", color: "green-500", checkSuccess: true },
        { text: t("verify_email.VET6"), isSuccess: true, value: "VET6", color: "green-500", checkSuccess: true },
    ]
    const resultResetTokenVerifyEmail = textResetTokenVerifyEmail.find(item => item.value === data?.data);
    return (
        <>
            {isLoading && <LoadingScreen text={t("common.loading")} />}
            {!isLoading && (
                <div className="flex min-h-screen w-screen items-center justify-center bg-slate-200 p-4">
                    <div className="h-auto w-full max-w-lg md:size-3/5">
                        <div className=" ">
                            <div className="grid size-full grid-cols-1 grid-rows-3 rounded-lg bg-white px-5">
                                <div className="flex flex-col items-center justify-center">
                                    {resultResetTokenVerifyEmail?.checkSuccess ? (
                                        <CheckCircle className="size-[80px] text-emerald-500" />
                                    ) : (
                                        <XCircle className="size-[80px] text-rose-500" />
                                    )}
                                    {
                                        resultResetTokenVerifyEmail?.value === "VET5" || resultResetTokenVerifyEmail?.value === "VET6" ?
                                            <></> :
                                            <p className={`text-center font-roboto text-xl ${resultResetTokenVerifyEmail?.checkSuccess ? "text-green-500" : "text-red-500"}`}>
                                                {!resultResetTokenVerifyEmail?.checkSuccess ? t("verify_email.title_error") :
                                                    t("verify_email.title_success")} </p>
                                    }
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    {
                                        !resultResetTokenVerifyEmail ? <></> : (
                                            <>
                                                <p className={`text- mb-3 text-center text-xl${resultResetTokenVerifyEmail?.color}`}>{resultResetTokenVerifyEmail.text}</p>
                                                {resultResetTokenVerifyEmail.isSuccess ? <button
                                                    onClick={() => {
                                                        if (resultResetTokenVerifyEmail.value === "VET3") {
                                                            setIsClick(true);
                                                            resetTokenVerifyEmail.mutate();
                                                        }
                                                        else if (resultResetTokenVerifyEmail.value === "VET6" || resultResetTokenVerifyEmail.value === "VET5") {
                                                            navigate(ROUTERS.PARTNER_LOGIN);
                                                        }
                                                    }}
                                                    disabled={resetTokenVerifyEmail.isPending || isClick}
                                                    className={`bg-${resultResetTokenVerifyEmail?.color} border- border px-10 py-2${resultResetTokenVerifyEmail?.color} w-full rounded-sm text-white disabled:cursor-not-allowed disabled:opacity-50`}>
                                                    {(isClick || resetTokenVerifyEmail.isPending) ? <ThreeDot variant="bounce" color="#ffffff" size="small" /> :
                                                        resultResetTokenVerifyEmail.value === "VET3" ?
                                                            t("verify_email.reset_token_verify_email") :
                                                            t("verify_email.back")}
                                                </button> : <></>}
                                            </>
                                        )
                                    }

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
                                        })
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 px-6 text-center text-sm">
                            {t("verify_email.footer")}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
export default VerifyEmailToken;