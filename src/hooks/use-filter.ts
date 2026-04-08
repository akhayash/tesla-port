import { useCallback, useMemo, useState } from "react";
import type { Ship, ShipStatus } from "@/lib/types";

export type StatusFilter = ShipStatus | "all";

interface Filters {
  search: string;
  status: StatusFilter;
  teslaOnly: boolean;
  carCarrierOnly: boolean;
  shanghaiOrigin: boolean;
  nagoyaRoute: boolean;
}

interface UseFilterReturn {
  filters: Filters;
  setSearch: (value: string) => void;
  setStatus: (value: StatusFilter) => void;
  setTeslaOnly: (value: boolean) => void;
  setCarCarrierOnly: (value: boolean) => void;
  setShanghaiOrigin: (value: boolean) => void;
  setNagoyaRoute: (value: boolean) => void;
  applyFilters: (ships: Ship[]) => Ship[];
}

const SHANGHAI_KEYWORDS = ["上海", "SHANGHAI", "シャンハイ"];
const NAGOYA_KEYWORDS = ["名古屋", "NAGOYA"];

function matchesAny(text: string, keywords: string[]): boolean {
  const upper = text.toUpperCase().trim();
  if (!upper) return false;
  return keywords.some((k) => upper.includes(k.toUpperCase()));
}

export function useFilter(): UseFilterReturn {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("予定");
  const [teslaOnly, setTeslaOnlyRaw] = useState(false);
  const [carCarrierOnly, setCarCarrierOnly] = useState(true);
  const [shanghaiOrigin, setShanghaiOrigin] = useState(false);
  const [nagoyaRoute, setNagoyaRoute] = useState(false);

  // Tesla ON → force all prerequisite filters ON
  const setTeslaOnly = useCallback((value: boolean) => {
    setTeslaOnlyRaw(value);
    if (value) {
      setCarCarrierOnly(true);
      setShanghaiOrigin(true);
      setNagoyaRoute(true);
    }
  }, []);

  // Effective filters: when Tesla is ON, prerequisites are forced
  const effectiveCarCarrier = teslaOnly || carCarrierOnly;
  const effectiveShanghai = teslaOnly || shanghaiOrigin;
  const effectiveNagoya = teslaOnly || nagoyaRoute;

  const filters = useMemo<Filters>(
    () => ({
      search, status, teslaOnly,
      carCarrierOnly: effectiveCarCarrier,
      shanghaiOrigin: effectiveShanghai,
      nagoyaRoute: effectiveNagoya,
    }),
    [search, status, teslaOnly, effectiveCarCarrier, effectiveShanghai, effectiveNagoya],
  );

  const applyFilters = useCallback(
    (ships: Ship[]): Ship[] => {
      let result = ships;

      if (effectiveCarCarrier) {
        result = result.filter((s) => s.vesselType === "自動車専用船");
      }

      if (effectiveShanghai) {
        result = result.filter((s) => matchesAny(s.originPort, SHANGHAI_KEYWORDS));
      }

      if (effectiveNagoya) {
        result = result.filter((s) =>
          matchesAny(s.previousPort, NAGOYA_KEYWORDS) ||
          matchesAny(s.nextPort, NAGOYA_KEYWORDS) ||
          matchesAny(s.destinationPort, NAGOYA_KEYWORDS)
        );
      }

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
    [search, status, teslaOnly, effectiveCarCarrier, effectiveShanghai, effectiveNagoya],
  );

  return {
    filters, setSearch, setStatus, setTeslaOnly,
    setCarCarrierOnly, setShanghaiOrigin, setNagoyaRoute,
    applyFilters,
  };
}
