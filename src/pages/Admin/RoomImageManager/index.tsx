import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { RoomImageList } from "./components/RoomImageList";
import { UploadRoomImage } from "./components/UploadRoomImage";

/**
 * Room Image Manager Page
 * A dedicated workspace for managing room photography, allowing partners to upload, reorder, and delete images for room listings.
 */
const RoomImageManager: React.FC = () => {
  const { t } = useTranslation();
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const saveRef = useRef<(() => void) | null>(null);

  if (!roomId) return <div>{t("room_images.invalid_room_id")}</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 size-4" />
          {t("common.back")}
        </Button>
        <h1 className="text-2xl font-bold">{t("room_images.title")}</h1>
        <div className="ml-auto flex gap-2">
          <Button onClick={() => setShowUpload(true)}>
            {t("common.upload")}
          </Button>
          <Button disabled={!hasChanges} onClick={() => saveRef.current?.()}>
            {t("common.save")}
          </Button>
        </div>
      </div>

      <RoomImageList roomId={parseInt(roomId)} onSave={(config) => {
        saveRef.current = config.save;
        setHasChanges(config.hasChanges);
      }} />

      {showUpload && (
        <UploadRoomImage
          roomId={parseInt(roomId)}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};

export default RoomImageManager;