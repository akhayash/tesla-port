import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { FavoriteButton } from "@/components/favorite-button";
import { favoriteKey } from "@/hooks/use-favorites";
import type { Ship } from "@/lib/types";
import { arrivalOf, departureOf } from "@/lib/ship-utils";

function fmt(raw: string | null): string {
  if (!raw) return "—";
  const t = raw.trim();
  return !t || t === "縲" || t === "　" ? "—" : t;
}

interface ShipCardListProps {
  ships: Ship[];
  onSelect: (ship: Ship) => void;
  favorites?: {
    has: (key: string) => boolean;
    toggle: (key: string) => void;
  };
}

export function ShipCardList({ ships, onSelect, favorites }: ShipCardListProps) {
  if (ships.length === 0) {
    return (
      <div className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
        該当する船舶がありません
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {ships.map((ship, idx) => (
        <li key={`${ship.callSign || ship.name}-${idx}`}>
          <button
            type="button"
            onClick={() => onSelect(ship)}
            className={cn(
              "flex w-full flex-col gap-2 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/40 active:scale-[0.99]",
              ship.isTeslaCandidate &&
                "border-red-500/40 bg-red-500/5 hover:bg-red-500/10",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                {favorites && (
                  <FavoriteButton
                    active={favorites.has(favoriteKey(ship))}
                    onToggle={() => favorites.toggle(favoriteKey(ship))}
                  />
                )}
                {ship.isTeslaCandidate && (
                  <Zap className="size-4 shrink-0 fill-tesla text-tesla animate-tesla-pulse" />
                )}
                <span className="truncate font-medium">{ship.name}</span>
              </div>
              <StatusBadge
                status={ship.status}
                operationStatus={ship.operationStatus}
              />
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="truncate">{ship.previousPort || "—"}</span>
              <span>→</span>
              <span className="font-semibold text-primary">横浜</span>
              <span>→</span>
              <span className="truncate">{ship.nextPort || "—"}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs tabular-nums">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  入港
                </div>
                <div>{fmt(arrivalOf(ship))}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  離岸
                </div>
                <div>{fmt(departureOf(ship))}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>{ship.vesselType || "—"}</span>
              {ship.originPort && <span>仕出: {ship.originPort}</span>}
              {ship.destinationPort && (
                <span>仕向: {ship.destinationPort}</span>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
