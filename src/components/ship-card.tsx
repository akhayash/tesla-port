import { format, isValid } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowRight, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { Ship } from "@/lib/types";

function formatDate(raw: string | null): string {
  if (!raw) return "—";
  const d = new Date(raw);
  return isValid(d) ? format(d, "M/d HH:mm", { locale: ja }) : "—";
}

function getBestArrival(ship: Ship): string {
  return formatDate(
    ship.actualArrival ?? ship.confirmedArrival ?? ship.scheduledArrival,
  );
}

function getBestDeparture(ship: Ship): string {
  return formatDate(
    ship.actualDeparture ?? ship.confirmedDeparture ?? ship.scheduledDeparture,
  );
}

interface ShipCardProps {
  ship: Ship;
}

export function ShipCard({ ship }: ShipCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        ship.isTeslaCandidate && "border-l-2 border-l-red-500",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            {ship.name}
          </CardTitle>
          {ship.isTeslaCandidate && (
            <Zap className="size-4 shrink-0 fill-red-500 text-red-500" />
          )}
        </div>
        <StatusBadge
          status={ship.status}
          operationStatus={ship.operationStatus}
        />
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
          <div>
            <span className="text-xs">入港</span>
            <p className="font-medium text-foreground">{getBestArrival(ship)}</p>
          </div>
          <div>
            <span className="text-xs">離岸</span>
            <p className="font-medium text-foreground">
              {getBestDeparture(ship)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{ship.previousPort || "—"}</span>
          <ArrowRight className="size-3" />
          <span className="font-medium text-foreground">横浜</span>
          <ArrowRight className="size-3" />
          <span>{ship.nextPort || "—"}</span>
        </div>
        {(ship.originPort || ship.destinationPort) && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>仕出: {ship.originPort || "—"}</span>
            <ArrowRight className="size-3" />
            <span>仕向: {ship.destinationPort || "—"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
