import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ShipStatus } from "@/lib/types";

const statusStyles: Record<ShipStatus, string> = {
  予定: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  決定: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  実績: "bg-green-500/20 text-green-400 border-green-500/30",
};

interface StatusBadgeProps {
  status: ShipStatus;
  operationStatus?: string;
}

export function StatusBadge({ status, operationStatus }: StatusBadgeProps) {
  const isDeparted = operationStatus === "離岸済";

  return (
    <div className="flex items-center gap-1.5">
      <Badge
        variant="outline"
        className={cn(
          isDeparted
            ? "bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
            : statusStyles[status],
        )}
      >
        {status}
      </Badge>
      {isDeparted && (
        <Badge
          variant="outline"
          className="bg-neutral-500/20 text-neutral-400 border-neutral-500/30"
        >
          離岸済
        </Badge>
      )}
    </div>
  );
}
