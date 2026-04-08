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
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "縲" || trimmed === "　") return "—";
  return trimmed;
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
          <ArrowRight className="size-3 shrink-0" />
          <span className="font-medium text-foreground">横浜</span>
          <ArrowRight className="size-3 shrink-0" />
          <span>{ship.nextPort || "—"}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground">
          <div>
            <span className="text-[10px] uppercase tracking-wider">仕出港</span>
            <p>{ship.originPort || "—"}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider">仕向港</span>
            <p>{ship.destinationPort || "—"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
