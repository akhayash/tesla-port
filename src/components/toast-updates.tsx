import { useEffect, useMemo, useState } from "react";
import { X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Ship } from "@/lib/types";

const STORAGE_KEY = "tpf-last-seen";

interface ToastUpdatesProps {
  ships: Ship[];
  scrapedAt: string | null;
  onSelect: (ship: Ship) => void;
}

function readLastSeen(): {
  scrapedAt: string | null;
  teslaKeys: string[];
} {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { scrapedAt: null, teslaKeys: [] };
    const parsed = JSON.parse(raw);
    return {
      scrapedAt: typeof parsed.scrapedAt === "string" ? parsed.scrapedAt : null,
      teslaKeys: Array.isArray(parsed.teslaKeys) ? parsed.teslaKeys : [],
    };
  } catch {
    return { scrapedAt: null, teslaKeys: [] };
  }
}

function keyOf(ship: Ship) {
  return ship.callSign || ship.name;
}

export function ToastUpdates({ ships, scrapedAt, onSelect }: ToastUpdatesProps) {
  const [dismissed, setDismissed] = useState(false);

  const currentTeslaKeys = useMemo(
    () => ships.filter((s) => s.isTeslaCandidate).map(keyOf),
    [ships],
  );

  const { newShips, isFirstVisit } = useMemo(() => {
    if (!scrapedAt) return { newShips: [] as Ship[], isFirstVisit: true };
    const prev = readLastSeen();
    if (!prev.scrapedAt) return { newShips: [], isFirstVisit: true };
    if (prev.scrapedAt === scrapedAt) return { newShips: [], isFirstVisit: false };
    const prevSet = new Set(prev.teslaKeys);
    const added = ships.filter(
      (s) => s.isTeslaCandidate && !prevSet.has(keyOf(s)),
    );
    return { newShips: added, isFirstVisit: false };
  }, [ships, scrapedAt]);

  useEffect(() => {
    if (!scrapedAt) return;
    // Update last-seen marker once we've rendered (gives user a chance to see the toast).
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ scrapedAt, teslaKeys: currentTeslaKeys }),
        );
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [scrapedAt, currentTeslaKeys]);

  if (dismissed || isFirstVisit || newShips.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-4 left-1/2 z-40 w-[min(calc(100vw-2rem),28rem)] -translate-x-1/2 rounded-lg border border-tesla/40 bg-card/95 p-3 text-sm shadow-xl ring-1 ring-tesla/20 backdrop-blur",
        "animate-in fade-in slide-in-from-bottom-4",
      )}
    >
      <div className="flex items-start gap-3">
        <Zap className="mt-0.5 size-5 shrink-0 fill-tesla text-tesla animate-tesla-pulse" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="font-medium">
            新しい Tesla 候補が {newShips.length} 隻追加されました
          </div>
          <ul className="space-y-0.5 text-xs text-muted-foreground">
            {newShips.slice(0, 3).map((ship) => (
              <li key={keyOf(ship)}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(ship);
                    setDismissed(true);
                  }}
                  className="truncate underline-offset-2 hover:text-foreground hover:underline"
                >
                  {ship.name}
                </button>
              </li>
            ))}
            {newShips.length > 3 && (
              <li className="text-muted-foreground">
                他 {newShips.length - 3} 隻
              </li>
            )}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="通知を閉じる"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
