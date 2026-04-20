import { useCallback, useEffect, useState } from "react";
import type { Ship } from "@/lib/types";

function shipHashKeyOf(ship: Ship, ships: Ship[]): string {
  const base = ship.callSign || encodeURIComponent(ship.name);
  const sameKey = ships.filter(
    (s) => (s.callSign || encodeURIComponent(s.name)) === base,
  );
  if (sameKey.length <= 1) return base;
  const idx = sameKey.indexOf(ship);
  return idx > 0 ? `${base}:${idx}` : base;
}

export function useShipModal(ships: Ship[]) {
  const [selected, setSelected] = useState<Ship | null>(null);

  // Load selection from hash on mount / when ships become available.
  useEffect(() => {
    if (ships.length === 0) return;
    const raw = window.location.hash.replace(/^#/, "");
    if (!raw) return;
    const [key, idxStr] = raw.split(":");
    const idx = idxStr !== undefined ? Number(idxStr) : 0;
    const decoded = decodeURIComponent(key);
    const candidates = ships.filter(
      (s) => s.callSign === key || s.name === decoded,
    );
    const match = candidates[idx] ?? candidates[0];
    if (match) setSelected(match);
  }, [ships]);

  const open = useCallback(
    (ship: Ship) => {
      setSelected(ship);
      window.history.replaceState(null, "", `#${shipHashKeyOf(ship, ships)}`);
    },
    [ships],
  );

  const close = useCallback(() => {
    setSelected(null);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }, []);

  return { selected, open, close };
}
