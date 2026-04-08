import type { ShipData, KnownTeslaShipsData } from "@/lib/types";

const BASE_URL = import.meta.env.BASE_URL;

let shipDataCache: ShipData | null = null;
let knownShipsCache: KnownTeslaShipsData | null = null;

export async function loadShipData(): Promise<ShipData> {
  if (shipDataCache) return shipDataCache;

  const res = await fetch(`${BASE_URL}data/ships.json`);
  if (!res.ok) throw new Error(`船舶データの取得に失敗しました (${res.status})`);

  const data: ShipData = await res.json();
  shipDataCache = data;
  return data;
}

export async function loadKnownShips(): Promise<KnownTeslaShipsData> {
  if (knownShipsCache) return knownShipsCache;

  const res = await fetch(`${BASE_URL}data/known-tesla-ships.json`);
  if (!res.ok)
    throw new Error(`既知船舶データの取得に失敗しました (${res.status})`);

  const data: KnownTeslaShipsData = await res.json();
  knownShipsCache = data;
  return data;
}
