import { useMemo } from "react";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ship } from "@/lib/types";
import { arrivalOf, parseShipDate } from "@/lib/ship-utils";

interface TimelineViewProps {
  ships: Ship[];
  onSelect: (ship: Ship) => void;
  days?: number;
}

export function TimelineView({ ships, onSelect, days = 14 }: TimelineViewProps) {
  const today = useMemo(() => startOfDay(new Date()), []);

  const dayBuckets = useMemo(() => {
    const buckets = Array.from({ length: days }, (_, i) => ({
      date: addDays(today, i),
      ships: [] as Ship[],
    }));
    for (const ship of ships) {
      const arr = parseShipDate(arrivalOf(ship), today);
      if (!arr) continue;
      for (const bucket of buckets) {
        if (isSameDay(bucket.date, arr)) {
          bucket.ships.push(ship);
          break;
        }
      }
    }
    for (const b of buckets) {
      b.ships.sort((a, b) => {
        const ad = parseShipDate(arrivalOf(a), today)?.getTime() ?? 0;
        const bd = parseShipDate(arrivalOf(b), today)?.getTime() ?? 0;
        return ad - bd;
      });
    }
    return buckets;
  }, [ships, today, days]);

  return (
    <div className="overflow-x-auto rounded-md border">
      <ol className="flex min-w-max">
        {dayBuckets.map(({ date, ships: dayShips }) => {
          const isToday = isSameDay(date, today);
          const teslaCount = dayShips.filter((s) => s.isTeslaCandidate).length;
          return (
            <li
              key={date.toISOString()}
              className={cn(
                "flex w-40 shrink-0 flex-col border-r border-border/60 p-2 last:border-r-0",
                isToday && "bg-tesla/5",
              )}
            >
              <div className="mb-1 flex items-baseline justify-between">
                <div className="space-y-0">
                  <div
                    className={cn(
                      "text-[11px] uppercase tracking-wider",
                      isToday ? "text-tesla" : "text-muted-foreground",
                    )}
                  >
                    {format(date, "E", { locale: ja })}
                  </div>
                  <div className="font-heading text-lg font-semibold tabular-nums">
                    {format(date, "d")}
                  </div>
                </div>
                {teslaCount > 0 && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-tesla/15 px-1.5 py-0.5 text-[10px] text-tesla">
                    <Zap className="size-2.5 fill-tesla" />
                    {teslaCount}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {dayShips.length === 0 && (
                  <span className="text-[11px] text-muted-foreground/60">
                    —
                  </span>
                )}
                {dayShips.map((ship, idx) => {
                  const arr = parseShipDate(arrivalOf(ship), today);
                  return (
                    <button
                      key={`${ship.callSign || ship.name}-${idx}`}
                      type="button"
                      onClick={() => onSelect(ship)}
                      className={cn(
                        "flex flex-col gap-0.5 rounded-md border border-border/60 bg-card px-2 py-1.5 text-left text-xs hover:bg-muted",
                        ship.isTeslaCandidate &&
                          "border-tesla/40 bg-tesla/5 hover:bg-tesla/10",
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {ship.isTeslaCandidate && (
                          <Zap className="size-3 fill-tesla text-tesla" />
                        )}
                        <span className="truncate font-medium">
                          {ship.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground tabular-nums">
                        {arr && <span>{format(arr, "HH:mm")}</span>}
                        <span className="truncate">
                          {ship.previousPort || "—"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
