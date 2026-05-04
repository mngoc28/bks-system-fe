import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CLOUDINARY_HEADER_IMAGE_URL } from "@/constant";
import { UserProfile } from "@/dataHelper/user.dataHelper";
import { resolveImageUrl } from "@/utils/imageUtils";
import { Edit, Trash2, Mail, Phone, Key, ImageIcon } from "lucide-react";
import { highlightText } from "@/utils/utils";

interface UserCardProps {
  user: UserProfile;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onResetPassword: (id: number) => void;
  isCurrentUser?: boolean;
  highlightTerms?: {
    q?: string;
    email?: string;
    phone?: string;
  };
}

/**
 * User Card
 * A visual representation of a user profile used in the management grid, providing quick access to contact info, role identification, and administrative actions.
 */
const UserCard: React.FC<UserCardProps> = ({ user, onView, onEdit, onDelete, onResetPassword, isCurrentUser = false, highlightTerms }) => {
  const { t } = useTranslation();
  const avatarUrl = resolveImageUrl(user.avatar, { cloudinaryBaseUrl: CLOUDINARY_HEADER_IMAGE_URL });
  const fallbackImage = "/assets/images/photo_error2.png";

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <Badge className="border-none bg-rose-500 px-3 py-0.5 text-[10px] font-bold uppercase hover:bg-rose-600">Admin</Badge>;
      case "partner": return <Badge className="border-none bg-indigo-500 px-3 py-0.5 text-[10px] font-bold uppercase hover:bg-indigo-600">Partner</Badge>;
      default: return <Badge className="border-none bg-slate-500 px-3 py-0.5 text-[10px] font-bold uppercase hover:bg-slate-600">User</Badge>;
    }
  };

  return (
    <Card
      className="glass-card hover-scale group relative flex cursor-pointer flex-col items-center overflow-hidden rounded-2xl border-none p-6 transition-all duration-300 animate-in"
      onClick={() => onView(user.id)}
    >
      {/* Top Right Badges */}
      <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
        {getRoleBadge(user.role)}
        {isCurrentUser && <Badge variant="outline" className="border-indigo-200 bg-indigo-50 px-2 py-0 text-[10px] text-indigo-500">You</Badge>}
      </div>

      {/* Large Avatar */}
      <div className="relative mb-4 mt-2">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 opacity-20 blur-lg transition-opacity group-hover:opacity-40"></div>
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-indigo-50 text-2xl font-black text-indigo-600 shadow-xl dark:border-slate-800">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={user.name} 
              className="size-full object-cover" 
              onError={(e) => {
                if (e.currentTarget.src !== fallbackImage) {
                  e.currentTarget.src = fallbackImage;
                }
              }}
            />
          ) : (
            <div className="flex size-full flex-col items-center justify-center bg-gray-200">
              <ImageIcon className="size-8 text-gray-400" />
              <p className="mt-1 text-[9px] text-gray-500">{t("user.no_images_yet")}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 text-center">
        <h3 className="mb-1 text-lg font-bold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100">{highlightText(user.name || "Anonymous", highlightTerms?.q || "")}</h3>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ID: {user.id}</p>
      </div>

      {/* Info Column */}
      <div className="mb-8 flex w-full flex-col gap-3">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex size-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
            <Mail className="size-4 text-slate-400" />
          </div>
          <span className="flex-1 truncate font-medium" title={user.email}>{highlightText(user.email, highlightTerms?.email || "")}</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex size-8 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
            <Phone className="size-4 text-slate-400" />
          </div>
          <span className="font-medium">{highlightText(user.phone || "-", highlightTerms?.phone || "")}</span>
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
          className="h-10 w-full rounded-xl border-slate-100 bg-white/50 hover:border-red-100 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800/50"
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
