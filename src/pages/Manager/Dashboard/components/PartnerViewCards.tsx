import { useTotalPartner } from "@/hooks/useDashboardQuery";
import { UserCog } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

const PartnerViewCards: React.FC = () => {
  const { t } = useTranslation();

  const { data } = useTotalPartner();
  const partner = data?.data;

  const cards = [
    {
      label: t("dashboard.new_partner_this_month"),
      icon: UserCog,
      value: partner?.newUPartnerThisMonth ?? 0,
      color: "text-green-600",
    },
    {
      label: t("dashboard.partner_pending"),
      icon: UserCog,
      value: partner?.partnerPending ?? 0,
      color: "text-orange-600",
    },
    {
      label: t("dashboard.partner_block"),
      icon: UserCog,
      value: partner?.partnerBlock ?? 0,
      color: "text-red-600",
    },
    {
      label: t("dashboard.total_partners"),
      icon: UserCog,
      value: partner?.totalPartners ?? 0,
      color: "text-slate-700",
    },
  ];

  return (
    <section aria-label="Overview Cards" className="space-y-4">
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="group flex flex-col justify-between rounded-xl border border-slate-300 bg-gradient-to-br from-white to-gray-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
            tabIndex={0}
            aria-label={card.label}
          >
            <span className="mb-1 block text-sm text-slate-500">{card.label}</span>
            <div className="flex flex-row items-center justify-between gap-2">
              <card.icon className={`size-5 ${card.color} transition-transform duration-300 group-hover:scale-110`} />
              <span className={`text-2xl font-bold ${card.color} group-hover:brightness-110`}>{card.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PartnerViewCards;
