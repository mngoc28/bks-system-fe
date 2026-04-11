import { useSystemRoom } from "@/hooks/useDashboardQuery";
import { Building } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Room Overview Cards
 * Displays metrics for total rooms, private vs public, and currently available units.
 */
const RoomViewCards: React.FC = () => {
  const { t } = useTranslation();

  const { data } = useSystemRoom();
  const room = data?.data;

  const cards = [
    {
      label: t("dashboard.total_rooms"),
      value: room?.totalRooms ?? 0,
      icon: Building,
      color: "text-primary",
    },
    {
      label: t("dashboard.total_private_rooms"),
      value: room?.totalPrivateRooms ?? 0,
      icon: Building,
      color: "text-red-600",
    },
    {
      label: t("dashboard.total_public_rooms"),
      value: room?.totalPublicRooms ?? 0,
      icon: Building,
      color: "text-green-700",
    },
    {
      label: t("dashboard.total_available_rooms"),
      value: room?.totalAvailableRooms ?? 0,
      icon: Building,
      color: "text-emerald-700",
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

export default RoomViewCards;
