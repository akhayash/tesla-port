import { useMemo, useState, useCallback, useEffect } from "react";
import { AlertCircle, CalendarDays, GanttChart, RefreshCw, TableIcon } from "lucide-react";
import { Header } from "@/components/header";
import { ShipTable } from "@/components/ship-table";
import { ShipDetailModal } from "@/components/ship-detail-modal";
import { NextArrivalCard } from "@/components/next-arrival-card";
import { KpiRow } from "@/components/kpi-row";
import { CommandPalette } from "@/components/command-palette";
import { CalendarView } from "@/components/calendar-view";
import { TimelineView } from "@/components/timeline-view";
import { ToastUpdates } from "@/components/toast-updates";
import {
  QuickFilters,
  type QuickFilterId,
} from "@/components/quick-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useShips } from "@/hooks/use-ships";
import { favoriteKey, useFavorites } from "@/hooks/use-favorites";
import { useShipModal } from "@/hooks/use-ship-modal";
import {
  arrivalOf,
  isInPort,
  isSameDay,
  isWithinDays,
  parseShipDate,
} from "@/lib/ship-utils";
import { cn } from "@/lib/utils";
import type { Ship } from "@/lib/types";

type ViewMode = "table" | "timeline" | "calendar";

function LoadingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-8 w-full max-w-md" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

function applyQuickFilter(
  ships: Ship[],
  filter: QuickFilterId,
  now: Date,
  favorites: Set<string>,
): Ship[] {
  switch (filter) {
    case "all":
      return ships;
    case "tesla":
      return ships.filter((s) => s.isTeslaCandidate);
    case "favorites":
      return ships.filter((s) => favorites.has(favoriteKey(s)));
    case "today":
      return ships.filter((s) => {
        const arr = parseShipDate(arrivalOf(s), now);
        return arr ? isSameDay(arr, now) : false;
      });
    case "week":
      return ships.filter((s) => {
        const arr = parseShipDate(arrivalOf(s), now);
        return arr ? isWithinDays(arr, now, 7) : false;
      });
    case "inPort":
      return ships.filter((s) => isInPort(s, now));
    case "scheduled":
      return ships.filter((s) => s.status === "予定");
    default:
      return ships;
  }
}

const VIEW_OPTIONS: {
  id: ViewMode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "table", label: "一覧", icon: TableIcon },
  { id: "timeline", label: "タイムライン", icon: GanttChart },
  { id: "calendar", label: "カレンダー", icon: CalendarDays },
];

function App() {
  const { ships, scrapedAt, isLoading, error, retry } = useShips();
  const [quickFilter, setQuickFilter] = useState<QuickFilterId>("tesla");
  const [view, setView] = useState<ViewMode>("table");
  const favs = useFavorites();
  const modal = useShipModal(ships);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const counts = useMemo(() => {
    const build = (f: QuickFilterId) =>
      applyQuickFilter(ships, f, now, favs.favorites).length;
    return {
      all: ships.length,
      tesla: build("tesla"),
      favorites: build("favorites"),
      today: build("today"),
      week: build("week"),
      inPort: build("inPort"),
      scheduled: build("scheduled"),
    };
  }, [ships, now, favs.favorites]);

  const filteredShips = useMemo(
    () => applyQuickFilter(ships, quickFilter, now, favs.favorites),
    [ships, quickFilter, now, favs.favorites],
  );

  const handleSelectHero = useCallback(
    (ship: Ship) => {
      modal.open(ship);
    },
    [modal],
  );

  const headerRightSlot =
    !isLoading && !error && ships.length > 0 ? (
      <CommandPalette ships={ships} onSelect={handleSelectHero} />
    ) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header scrapedAt={scrapedAt} rightSlot={headerRightSlot} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
            <AlertCircle className="size-10 text-destructive" />
            <p className="text-sm">{error}</p>
            <Button variant="outline" onClick={retry}>
              <RefreshCw className="size-4" />
              再読み込み
            </Button>
          </div>
        ) : isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <NextArrivalCard ships={ships} onSelect={handleSelectHero} />
            <KpiRow ships={ships} scrapedAt={scrapedAt} />
            <div className="sticky top-[52px] z-30 -mx-4 border-b border-border/40 bg-background/90 px-4 py-2 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <QuickFilters
                  value={quickFilter}
                  counts={counts}
                  onChange={setQuickFilter}
                />
                <div
                  role="radiogroup"
                  aria-label="ビュー切替"
                  className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background p-0.5"
                >
                  {VIEW_OPTIONS.map(({ id, label, icon: Icon }) => {
                    const active = view === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={label}
                        title={label}
                        onClick={() => setView(id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors",
                          active
                            ? "bg-muted text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="size-3.5" />
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {view === "table" && (
              <ShipTable
                ships={filteredShips}
                allShips={ships}
                onOpenShip={handleSelectHero}
                favorites={favs}
              />
            )}
            {view === "timeline" && (
              <TimelineView ships={filteredShips} onSelect={handleSelectHero} />
            )}
            {view === "calendar" && (
              <CalendarView ships={filteredShips} onSelect={handleSelectHero} />
            )}

            <footer className="space-y-1 pb-4 text-xs text-muted-foreground">
              <p>
                ⚡ Tesla 候補の判定条件: 船種が「自動車専用船」または「RORO 船」かつ仕出港または前港が上海（Shanghai）の船舶を自動判定しています。Tesla 車両の積載を保証するものではありません。
              </p>
              <p>
                データソース:{" "}
                <a
                  href="http://www.port.city.yokohama.jp/APP/Pves0040InPlanC"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-foreground"
                >
                  横浜港 入出港予定船情報照会
                </a>
              </p>
            </footer>
            <ToastUpdates
              ships={ships}
              scrapedAt={scrapedAt}
              onSelect={handleSelectHero}
            />
          </>
        )}
      </main>
      {modal.selected && (
        <ShipDetailModal
          ship={modal.selected}
          linkedShips={ships.filter(
            (s) => s !== modal.selected && s.name === modal.selected?.name,
          )}
          onClose={modal.close}
          onSelectLinked={handleSelectHero}
        />
      )}
    </div>
  );
}

export default App;
