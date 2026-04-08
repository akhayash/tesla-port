import { useMemo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Header } from "@/components/header";
import { FilterBar } from "@/components/filter-bar";
import { NextArrival } from "@/components/next-arrival";
import { ShipCard } from "@/components/ship-card";
import { ShipTable } from "@/components/ship-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useShips } from "@/hooks/use-ships";
import { useFilter } from "@/hooks/use-filter";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
      <div className="hidden md:block">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function App() {
  const { ships, scrapedAt, isLoading, error, retry } = useShips();
  const {
    filters, setSearch, setStatus, setTeslaOnly,
    setCarCarrierOnly, setShanghaiOrigin, setNagoyaRoute,
    applyFilters,
  } = useFilter();

  const filtered = useMemo(
    () => applyFilters(ships),
    [applyFilters, ships],
  );

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Header scrapedAt={scrapedAt} />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
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
            <NextArrival ships={ships} />

            <FilterBar
              search={filters.search}
              totalCount={ships.length}
              filteredCount={filtered.length}
              onSearchChange={setSearch}
            />

            {/* Mobile: cards */}
            <div className="grid gap-3 md:hidden">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  該当する船舶がありません
                </p>
              ) : (
                filtered.map((ship) => (
                  <ShipCard key={ship.callSign || ship.name} ship={ship} />
                ))
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block">
              <ShipTable
                ships={filtered}
                allShips={ships}
                filters={filters}
                onStatusChange={setStatus}
                onCarCarrierOnlyChange={setCarCarrierOnly}
                onShanghaiOriginChange={setShanghaiOrigin}
                onNagoyaRouteChange={setNagoyaRoute}
                onTeslaOnlyChange={setTeslaOnly}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
