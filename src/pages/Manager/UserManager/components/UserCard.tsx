import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/dataHelper/user.dataHelper";
import { Edit, Trash2, Mail, Phone, Key, User } from "lucide-react";

interface UserCardProps {
  user: UserProfile;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onResetPassword: (id: number) => void;
  isCurrentUser?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ user, onView, onEdit, onDelete, onResetPassword, isCurrentUser = false }) => {
  const { t } = useTranslation();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="bg-rose-500 hover:bg-rose-600 border-none px-3 py-0.5 text-[10px] font-bold uppercase">Admin</Badge>;
      case "partner": return <Badge className="bg-indigo-500 hover:bg-indigo-600 border-none px-3 py-0.5 text-[10px] font-bold uppercase">Partner</Badge>;
      default: return <Badge className="bg-slate-500 hover:bg-slate-600 border-none px-3 py-0.5 text-[10px] font-bold uppercase">User</Badge>;
    }
  };

  return (
    <Card
      className="glass-card hover-scale animate-in group relative flex flex-col items-center overflow-hidden rounded-2xl border-none p-6 transition-all duration-300 cursor-pointer"
      onClick={() => onView(user.id)}
    >
      {/* Top Right Badges */}
      <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
        {getRoleBadge(user.role)}
        {isCurrentUser && <Badge variant="outline" className="text-[10px] border-indigo-200 text-indigo-500 bg-indigo-50 px-2 py-0">You</Badge>}
      </div>

      {/* Large Avatar */}
      <div className="relative mb-4 mt-2">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-20 blur-lg group-hover:opacity-40 transition-opacity"></div>
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-indigo-50 text-2xl font-black text-indigo-600 shadow-xl dark:border-slate-800">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              {user.name?.[0]?.toUpperCase() || <User className="size-10" />}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 text-center">
        <h3 className="mb-1 text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{user.name || "Anonymous"}</h3>
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">ID: {user.id}</p>
      </div>

      {/* Info Column */}
      <div className="mb-8 flex w-full flex-col gap-3">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
            <Mail className="size-4 text-slate-400" />
          </div>
          <span className="truncate flex-1 font-medium" title={user.email}>{user.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
            <Phone className="size-4 text-slate-400" />
          </div>
          <span className="font-medium">{user.phone || "-"}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto grid w-full grid-cols-3 gap-2 border-t border-slate-50 pt-5 dark:border-slate-800">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-full rounded-xl border-slate-100 bg-white/50 hover:bg-white hover:text-indigo-600 dark:bg-slate-800/50"
          onClick={(e) => { e.stopPropagation(); onEdit(user.id); }}
          title={t("common.edit")}
        >
          <Edit className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-full rounded-xl border-slate-100 bg-white/50 hover:bg-white hover:text-amber-600 dark:bg-slate-800/50"
          onClick={(e) => { e.stopPropagation(); onResetPassword(user.id); }}
          title={t("user.reset_password")}
        >
          <Key className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-full rounded-xl border-slate-100 bg-white/50 hover:bg-red-50 hover:text-red-600 hover:border-red-100 dark:bg-slate-800/50"
          onClick={(e) => { e.stopPropagation(); onDelete(user.id); }}
          disabled={isCurrentUser}
          title={t("common.delete")}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </Card>
  );
};

export default UserCard;
