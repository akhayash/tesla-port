import { useCallback, useMemo, useState } from "react";
import type { Ship, ShipStatus } from "@/lib/types";

export type StatusFilter = ShipStatus | "all";

interface Filters {
  search: string;
  status: StatusFilter;
  teslaOnly: boolean;
}

interface UseFilterReturn {
  filters: Filters;
  setSearch: (value: string) => void;
  setStatus: (value: StatusFilter) => void;
  setTeslaOnly: (value: boolean) => void;
  applyFilters: (ships: Ship[]) => Ship[];
}

export function useFilter(): UseFilterReturn {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [teslaOnly, setTeslaOnly] = useState(false);

  const filters = useMemo<Filters>(
    () => ({ search, status, teslaOnly }),
    [search, status, teslaOnly],
  );

  const applyFilters = useCallback(
    (ships: Ship[]): Ship[] => {
      let result = ships;

      if (search.trim()) {
        const q = search.trim().toLowerCase();
        result = result.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.callSign.toLowerCase().includes(q),
        );
      }

      if (status !== "all") {
        result = result.filter((s) => s.status === status);
      }

      if (teslaOnly) {
        result = result.filter((s) => s.isTeslaCandidate);
      }

      return result;
    },
    [search, status, teslaOnly],
  );

  return { filters, setSearch, setStatus, setTeslaOnly, applyFilters };
}
