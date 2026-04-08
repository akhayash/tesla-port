import { useCallback, useMemo, useState } from "react";
import type { Ship } from "@/lib/types";

interface Filters {
  search: string;
}

interface UseFilterReturn {
  filters: Filters;
  setSearch: (value: string) => void;
  applyFilters: (ships: Ship[]) => Ship[];
}

export function useFilter(): UseFilterReturn {
  const [search, setSearch] = useState("");

  const filters = useMemo<Filters>(() => ({ search }), [search]);

  const applyFilters = useCallback(
    (ships: Ship[]): Ship[] => {
      if (!search.trim()) return ships;
      const q = search.trim().toLowerCase();
      return ships.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.callSign.toLowerCase().includes(q),
      );
    },
    [search],
  );

  return { filters, setSearch, applyFilters };
}
