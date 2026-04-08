import { useEffect, useState } from "react";
import { loadShipData } from "@/lib/data-loader";
import type { Ship } from "@/lib/types";

interface UseShipsReturn {
  ships: Ship[];
  scrapedAt: string | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export function useShips(): UseShipsReturn {
  const [ships, setShips] = useState<Ship[]>([]);
  const [scrapedAt, setScrapedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await loadShipData();
        if (!cancelled) {
          setShips(data.ships);
          setScrapedAt(data.scrapedAt);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "データ取得エラー");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const retry = () => setRetryCount((c) => c + 1);

  return { ships, scrapedAt, isLoading, error, retry };
}
