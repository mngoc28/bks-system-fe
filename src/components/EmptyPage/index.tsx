import React, { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { EmptyPageProps } from "../type";

const Lottie = lazy(() => import("lottie-react"));

const EmptyPage: React.FC<EmptyPageProps> = ({
  title = "common.empty_title",
  description = "common.empty_description",
  loading = false,
}) => {
  const { t } = useTranslation();
  const [animationData, setAnimationData] = React.useState<any>(null);

  React.useEffect(() => {
    fetch("https://assets9.lottiefiles.com/packages/lf20_m6zL3u.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((err) => console.error("Error loading Lottie:", err));
  }, []);
  
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center animate-in">
      <div className="relative mb-10 h-72 w-72">
        {/* Decorative background glow */}
        <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-[80px]"></div>
        
        <Suspense fallback={<div className="h-full w-full animate-pulse rounded-full bg-slate-100" />}>
           {animationData && (
             <Lottie 
               animationData={animationData}
               loop={true}
               className="relative h-full w-full"
             />
           )}
        </Suspense>
      </div>

      <div className="max-w-md">
        <h3 className="mb-3 text-3xl font-black tracking-tight text-slate-800 dark:text-slate-100">{t(title)}</h3>
        <p className="text-lg leading-relaxed text-slate-400">{t(description)}</p>
      </div>

      {!loading && (
        <button
          onClick={() => window.location.reload()}
          className="hover-scale premium-shadow mt-12 rounded-2xl border border-slate-100 bg-white px-8 py-3.5 text-sm font-black uppercase tracking-widest text-indigo-600 transition-all hover:bg-indigo-50 dark:border-slate-800 dark:bg-slate-900"
        >
          {t("common.reload", { defaultValue: "Refresh System" })}
        </button>
      )}
    </div>
  );
};

export default EmptyPage;
