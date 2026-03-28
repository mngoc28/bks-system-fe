import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { RoomImageList } from "./components/RoomImageList";
import { UploadRoomImage } from "./components/UploadRoomImage";

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
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-2" />
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