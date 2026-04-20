import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ship } from "@/lib/types";
import { arrivalOf, parseShipDate } from "@/lib/ship-utils";

interface CalendarViewProps {
  ships: Ship[];
  onSelect: (ship: Ship) => void;
}

export function CalendarView({ ships, onSelect }: CalendarViewProps) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => startOfMonth(today));

  const shipsByDay = useMemo(() => {
    const map = new Map<string, Ship[]>();
    for (const ship of ships) {
      const arr = parseShipDate(arrivalOf(ship), today);
      if (!arr) continue;
      const key = format(arr, "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(ship);
      map.set(key, list);
    }
    return map;
  }, [ships, today]);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold">
          {format(cursor, "yyyy年 M月", { locale: ja })}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="前月"
            onClick={() => setCursor((c) => subMonths(c, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            今月
          </button>
          <button
            type="button"
            aria-label="翌月"
            onClick={() => setCursor((c) => addMonths(c, 1))}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        {weekdays.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const items = shipsByDay.get(key) ?? [];
          const teslaItems = items.filter((s) => s.isTeslaCandidate);
          const inMonth = isSameMonth(day, cursor);
          const isToday = isSameDay(day, today);
          return (
            <div
              key={key}
              className={cn(
                "flex min-h-20 flex-col gap-1 rounded-md border border-border/60 p-1.5 text-left text-[11px]",
                !inMonth && "opacity-40",
                isToday && "border-tesla/60 bg-tesla/5",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="tabular-nums text-muted-foreground">
                  {format(day, "d")}
                </span>
                {teslaItems.length > 0 && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-tesla/15 px-1.5 text-[9px] font-medium text-tesla">
                    <Zap className="size-2.5 fill-tesla" />
                    {teslaItems.length}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 overflow-hidden">
                {items.slice(0, 3).map((ship, idx) => (
                  <button
                    key={`${key}-${idx}`}
                    type="button"
                    onClick={() => onSelect(ship)}
                    title={ship.name}
                    className={cn(
                      "truncate rounded px-1 text-left text-[10px] hover:bg-muted",
                      ship.isTeslaCandidate && "text-tesla",
                    )}
                  >
                    {ship.name}
                  </button>
                ))}
                {items.length > 3 && (
                  <span className="px-1 text-[10px] text-muted-foreground">
                    +{items.length - 3}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
