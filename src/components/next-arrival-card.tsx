import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, Zap } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Ship } from "@/lib/types";
import { arrivalOf, parseShipDate } from "@/lib/ship-utils";

interface NextArrivalCardProps {
  ships: Ship[];
  onSelect?: (ship: Ship) => void;
}

type CandidateEntry = {
  ship: Ship;
  arrival: Date;
  isUpcoming: boolean;
};

function findNextCandidate(ships: Ship[], now: Date): CandidateEntry | null {
  const candidates = ships.filter((s) => s.isTeslaCandidate);
  if (candidates.length === 0) return null;

  const withDates = candidates
    .map((ship) => {
      const arrival = parseShipDate(arrivalOf(ship), now);
      return arrival ? { ship, arrival } : null;
    })
    .filter((v): v is { ship: Ship; arrival: Date } => v !== null);

  if (withDates.length === 0) return null;

  const upcoming = withDates
    .filter((v) => v.arrival.getTime() >= now.getTime())
    .sort((a, b) => a.arrival.getTime() - b.arrival.getTime());

  if (upcoming.length > 0) {
    return { ...upcoming[0], isUpcoming: true };
  }

  const past = withDates
    .slice()
    .sort((a, b) => b.arrival.getTime() - a.arrival.getTime());
  return { ...past[0], isUpcoming: false };
}

function formatCountdown(target: Date, now: Date): string {
  const diff = target.getTime() - now.getTime();
  const abs = Math.abs(diff);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}日`);
  if (hours > 0 || days > 0) parts.push(`${hours}時間`);
  parts.push(`${minutes}分`);
  return parts.join(" ");
}

export function NextArrivalCard({ ships, onSelect }: NextArrivalCardProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const entry = useMemo(() => findNextCandidate(ships, now), [ships, now]);

  if (!entry) {
    return (
      <Card className="border-dashed bg-card/40 ring-foreground/5">
        <div className="flex items-center gap-3 px-4 py-4 text-sm text-muted-foreground">
          <Zap className="size-5 text-red-500/60" />
          <span>
            現在、Tesla 候補の入港予定はありません。スクレイピングの次回更新をお待ちください。
          </span>
        </div>
      </Card>
    );
  }

  const { ship, arrival, isUpcoming } = entry;
  const countdown = formatCountdown(arrival, now);
  const dateLabel = format(arrival, "M月d日 (E) HH:mm", { locale: ja });

  return (
    <Card
      onClick={() => onSelect?.(ship)}
      className={cn(
        "cursor-pointer border border-red-500/30 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent ring-red-500/20 transition-colors hover:border-red-500/50",
      )}
    >
      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
            <Zap className="size-4 fill-red-500 text-red-500" />
            {isUpcoming ? "次の Tesla 候補入港" : "直近の Tesla 候補入港"}
          </div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {ship.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{ship.previousPort || "—"}</span>
            <ArrowRight className="size-4 shrink-0" />
            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
              横浜
            </span>
            <ArrowRight className="size-4 shrink-0" />
            <span>{ship.nextPort || "—"}</span>
          </div>
        </div>

        <div className="space-y-1 sm:text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {isUpcoming ? "入港まで" : "入港から"}
          </div>
          <div className="flex items-center gap-2 sm:justify-end">
            <Clock className="size-4 text-red-400" />
            <span className="font-heading text-2xl font-semibold tabular-nums">
              {countdown}
            </span>
          </div>
          <div className="text-xs tabular-nums text-muted-foreground">
            {dateLabel}
          </div>
        </div>
      </div>
    </Card>
  );
}
