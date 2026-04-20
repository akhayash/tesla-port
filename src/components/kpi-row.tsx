import { useMemo } from "react";
import { Anchor, CalendarDays, Clock, Zap } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Ship } from "@/lib/types";
import {
  arrivalOf,
  isInPort,
  isWithinDays,
  parseShipDate,
} from "@/lib/ship-utils";

interface KpiRowProps {
  ships: Ship[];
  scrapedAt: string | null;
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card
      size="sm"
      className="ring-foreground/5 transition-colors hover:ring-foreground/15"
    >
      <div className="flex items-start justify-between gap-2 px-3">
        <div className="space-y-0.5">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div
            className={cn(
              "font-heading text-2xl font-semibold tabular-nums",
              accent,
            )}
          >
            {value}
          </div>
          {hint && (
            <div className="text-[10px] text-muted-foreground">{hint}</div>
          )}
        </div>
        <div className={cn("shrink-0 text-muted-foreground", accent)}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function KpiRow({ ships, scrapedAt }: KpiRowProps) {
  const now = useMemo(() => new Date(), [ships, scrapedAt]);

  const metrics = useMemo(() => {
    const teslaCount = ships.filter((s) => s.isTeslaCandidate).length;

    const thisWeekCount = ships.filter((s) => {
      if (!s.isTeslaCandidate) return false;
      const arrival = parseShipDate(arrivalOf(s), now);
      return arrival ? isWithinDays(arrival, now, 7) : false;
    }).length;

    const inPortCount = ships.filter((s) => isInPort(s, now)).length;

    return { teslaCount, thisWeekCount, inPortCount };
  }, [ships, now]);

  const updated = scrapedAt
    ? format(new Date(scrapedAt), "M/d HH:mm", { locale: ja })
    : "—";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <KpiCard
        label="Tesla 候補"
        value={metrics.teslaCount}
        hint="自動車専用船 / RORO × 上海発"
        icon={<Zap className="size-5 fill-red-500/20 text-red-500" />}
        accent="text-red-400"
      />
      <KpiCard
        label="今週入港"
        value={metrics.thisWeekCount}
        hint="7日以内の Tesla 候補"
        icon={<CalendarDays className="size-5" />}
      />
      <KpiCard
        label="本日在港"
        value={metrics.inPortCount}
        hint="全船舶の合計"
        icon={<Anchor className="size-5" />}
      />
      <KpiCard
        label="最終更新"
        value={updated}
        hint="自動スクレイピング"
        icon={<Clock className="size-5" />}
      />
    </div>
  );
}
