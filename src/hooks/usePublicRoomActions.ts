import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ROUTERS } from "@/constant";
import { toastSuccess, toastError } from "@/components/ui/toast";

const WISHLIST_STORAGE_KEY = "bks_wishlist";

export const usePublicRoomActions = () => {
  const { t } = useTranslation();
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const handleToggleWishlist = useCallback((e: React.MouseEvent, roomId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const isAlreadyWishlisted = prev.includes(roomId);
      if (isAlreadyWishlisted) {
        toastSuccess(t("public.home.rooms.removedFromWishlist"));
        return prev.filter((id) => id !== roomId);
      }

      toastSuccess(t("public.home.rooms.addedToWishlist"));
      return [...prev, roomId];
    });
  }, [t]);

  const handleShareRoom = useCallback((e: React.MouseEvent, roomId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${ROUTERS.PUBLIC_ROOM_DETAIL.replace(":roomId", roomId.toString())}`;

    const copySuccess = () => toastSuccess(t("public.home.rooms.copyLinkSuccess"));
    const copyFailure = () => toastError(t("public.home.rooms.copyLinkError"));

    navigator.clipboard.writeText(url)
      .then(copySuccess)
      .catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
          copySuccess();
        } catch {
          copyFailure();
        }
        document.body.removeChild(textArea);
      });
  }, [t]);

  return {
    wishlist,
    handleToggleWishlist,
    handleShareRoom,
  };
};
