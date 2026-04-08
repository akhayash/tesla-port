import { AlertCircle, RefreshCw } from "lucide-react";
import { Header } from "@/components/header";
import { ShipTable } from "@/components/ship-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useShips } from "@/hooks/use-ships";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-36 w-full" />
      <div className="hidden md:block">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function App() {
  const { ships, scrapedAt, isLoading, error, retry } = useShips();

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
            <ShipTable ships={ships} allShips={ships} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
