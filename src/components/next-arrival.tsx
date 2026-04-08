import { useMemo } from "react";
import { format, formatDistanceToNow, isPast, isValid } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { Ship } from "@/lib/types";

function getBestArrival(ship: Ship): Date | null {
  const raw =
    ship.actualArrival ?? ship.confirmedArrival ?? ship.scheduledArrival;
  if (!raw) return null;
  const d = new Date(raw);
  return isValid(d) ? d : null;
}

interface NextArrivalProps {
  ships: Ship[];
}

export function NextArrival({ ships }: NextArrivalProps) {
  const nextShip = useMemo(() => {
    const candidates = ships
      .filter((s) => s.isTeslaCandidate)
      .map((s) => ({ ship: s, arrival: getBestArrival(s) }))
      .filter(
        (c): c is { ship: Ship; arrival: Date } =>
          c.arrival !== null && !isPast(c.arrival),
      )
      .sort((a, b) => a.arrival.getTime() - b.arrival.getTime());

    // If no future arrivals, find most recent Tesla candidate that's in port
    if (candidates.length === 0) {
      const inPort = ships
        .filter(
          (s) =>
            s.isTeslaCandidate &&
            s.operationStatus !== "離岸済" &&
            getBestArrival(s) !== null,
        )
        .map((s) => ({ ship: s, arrival: getBestArrival(s)! }))
        .sort((a, b) => b.arrival.getTime() - a.arrival.getTime());
      return inPort[0] ?? null;
    }

    return candidates[0] ?? null;
  }, [ships]);

  if (!nextShip) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <Clock className="mb-2 size-8" />
          <p className="text-sm">現在予定なし</p>
          <p className="text-xs">Tesla候補船の入港予定はありません</p>
        </CardContent>
      </Card>
    );
  }

  const { ship, arrival } = nextShip;
  const isFuture = !isPast(arrival);

  return (
    <Card className="border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent">
      <CardHeader>
        <CardDescription className="flex items-center gap-1.5 text-red-400">
          <Clock className="size-3.5" />
          {isFuture ? "次のTesla候補船" : "入港中のTesla候補船"}
        </CardDescription>
        <CardTitle className="text-2xl font-bold tracking-tight">
          {ship.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge
            status={ship.status}
            operationStatus={ship.operationStatus}
          />
          <span className="text-sm text-muted-foreground">
            {isFuture ? (
              <>
                <span className="font-semibold text-foreground">
                  {formatDistanceToNow(arrival, { locale: ja, addSuffix: true })}
                </span>
                {" — "}
                {format(arrival, "M/d (E) HH:mm", { locale: ja })}
              </>
            ) : (
              <>
                入港:{" "}
                {format(arrival, "M/d (E) HH:mm", { locale: ja })}
              </>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="flex flex-wrap items-center gap-1">
            <span>{ship.originPort || "—"}</span>
            <ArrowRight className="size-3" />
            <span className="font-semibold text-foreground">横浜</span>
            <ArrowRight className="size-3" />
            <span>{ship.destinationPort || ship.nextPort || "—"}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
