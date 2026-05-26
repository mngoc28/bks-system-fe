import {PasswordStrength } from "@/dataHelper/auth.dataHelper";
import { useTranslation } from "react-i18next";

function getPasswordStrength(password: string, t: any){
  let score = 0;

  if(password.length >= 8) score++;
  if(/[A-Z]/.test(password)) score++;
  if(/[0-9]/.test(password)) score++;
  if(/[^A-Za-z0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{}|;:',.<>?/]/.test(password)) score++;

  switch(score){
    case 0:
    case 1: return {label: t('validation.password.weak'), color: "bg-red-500", width: "20%"}
    case 2: return {label: t('validation.password.medium'), color: "bg-yellow-400", width: "40%"}
    case 3: return {label: t('validation.password.medium'), color: "bg-yellow-400", width: "60%"}
    case 4: return {label: t('validation.password.strong'), color: "bg-green-400", width:"80%"}
    case 5: return {label: t('validation.password.veryStrong'), color: "bg-green-600",width:"100%"}
    default: return {label: t('validation.password.weak'), color: "bg-red-500", width: "20%"}
  }

}

const PasswordStrengthBarProps: React.FC<PasswordStrength> = ({ password }) => {
  const { t } = useTranslation();
  if(password.length < 8) return null;
  const { label, color, width } = getPasswordStrength(password, t);

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Độ mạnh mật khẩu</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider ${color.replace('bg-', 'text-')}`}>{label}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width }}
        ></div>
      </div>
    </div>
  );
};

export default PasswordStrengthBarProps;
