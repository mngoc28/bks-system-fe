import { Button } from "@/components/ui/button";
import { ScrollControlsProps } from "@/dataHelper/building.dataHelper";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ScrollControls: React.FC<ScrollControlsProps> = ({
  hasScroll,
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
}) => {
  if (!hasScroll) return null;

  return (
    <div className="flex flex-row gap-2">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-2 h-6 w-6 border-[1px] border-blue-500",
          canScrollLeft
            ? "hover:bg-blue-50 bg-blue-50 text-blue-600 cursor-pointer"
            : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
        )}
        onClick={onScrollLeft}
        disabled={!canScrollLeft}
      >
        <ChevronLeft size={14} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "flex items-center gap-2 h-6 w-6 border-[1px] border-blue-500",
          canScrollRight
            ? "hover:bg-blue-50 bg-blue-50 text-blue-600 cursor-pointer"
            : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
        )}
        onClick={onScrollRight}
        disabled={!canScrollRight}
      >
        <ChevronRight size={14} />
      </Button>
    </div>
  );
};

export default ScrollControls;

