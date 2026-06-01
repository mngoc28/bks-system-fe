import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminTheme } from "@/lib/adminTheme";
import { AdminNavigationContext } from "@/utils/adminNavigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ContextFilterChipsProps {
  context: AdminNavigationContext;
  onClear: () => void;
}

const labelByKey: Record<string, string> = {
  source: "Nguồn",
  partner_id: "Partner",
  property_id: "Tài sản",
  room_id: "Phòng",
  user_id: "Người dùng",
  booking_id: "Booking",
  from_approval: "Duyệt đối tác",
};

const orderedKeys: Array<keyof AdminNavigationContext> = [
  "source",
  "partner_id",
  "property_id",
  "room_id",
  "user_id",
  "booking_id",
  "from_approval",
];

const getDisplayValue = (key: keyof AdminNavigationContext, context: AdminNavigationContext): string | undefined => {
  if (key === "partner_id") {
    return context.partner_name ? `${context.partner_name} (#${context.partner_id})` : context.partner_id;
  }

  if (key === "property_id") {
    return context.property_name ? `${context.property_name} (#${context.property_id})` : context.property_id;
  }

  if (key === "room_id") {
    return context.room_name ? `${context.room_name} (#${context.room_id})` : context.room_id;
  }

  if (key === "user_id") {
    return context.user_name ? `${context.user_name} (#${context.user_id})` : context.user_id;
  }

  return context[key];
};

const ContextFilterChips = ({ context, onClear }: ContextFilterChipsProps) => {
  const entries = orderedKeys
    .map((key) => ({ key, value: context[key] }))
    .filter((item) => item.value);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className={adminTheme.chipBar}>
      {entries.map((entry) => {
        const displayValue = getDisplayValue(entry.key, context);
        if (!displayValue) {
          return null;
        }

        return (
        <Badge key={entry.key} variant="outline" className={adminTheme.chipBadge}>
          {labelByKey[entry.key]}: {displayValue}
        </Badge>
        );
      })}
      <Button type="button" variant="ghost" size="sm" className={cn(adminTheme.chipClearBtn)} onClick={onClear}>
        <X className="mr-1 size-3" />
        Bỏ lọc ngữ cảnh
      </Button>
    </div>
  );
};

export default ContextFilterChips;

