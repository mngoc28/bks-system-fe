import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteRoomDialogProps } from "@/dataHelper/room.dataHelper";
import { useTranslation } from "react-i18next";

// Delete Room Confirmation Dialog Component
/**
 * Delete Room Dialog
 * A confirmation modal that ensures property managers intentionally remove a room listing, displaying room details for verification.
 */
const DeleteRoomDialog: React.FC<DeleteRoomDialogProps> = ({ isOpen, room, onCancel, onConfirm, isLoading }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-full bg-red-100 p-2 text-red-600">
              <img src="/assets/trash-2.svg" alt="Delete" className="size-5" />
            </div>
            {t("rooms.delete_room_title")}
          </DialogTitle>
        </DialogHeader>
        <div className="mb-2 text-gray-700">
          {t("rooms.delete_room_confirm")}
        </div>
        {room && (
          <div className="mb-4 rounded bg-gray-50 p-3">
            <div><b>ID:</b> {room.id}</div>
            <div><b>{t("rooms.room_number")}:</b> {room.room_number}</div>
            <div><b>{t("rooms.property")}:</b> {room.property_name}</div>
          </div>
        )}
        <div className="mb-2 text-sm text-red-500">{t("rooms.delete_room_warning")}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>{t("common.cancel")}</Button>
          <Button className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-2 font-bold text-white transition-colors hover:bg-red-700" onClick={onConfirm} disabled={isLoading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash2-icon lucide-trash-2">
              <path d="M10 11v6"/>
              <path d="M14 11v6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              <path d="M3 6h18"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteRoomDialog;
