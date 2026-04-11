import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
  KnownTeslaShip,
  KnownTeslaShipsData,
  Ship,
} from "../src/lib/types.ts";

const CAR_CARRIER_TYPE = "自動車専用船";

let _knownData: KnownTeslaShipsData | null = null;

function loadKnownData(): KnownTeslaShipsData {
  if (_knownData) return _knownData;

  const filePath = resolve(import.meta.dirname!, "..", "data", "known-tesla-ships.json");
  const raw = readFileSync(filePath, "utf-8");
  _knownData = JSON.parse(raw) as KnownTeslaShipsData;
  return _knownData;
}

/** Find a known Tesla ship entry that matches the scraped record. */
function findKnownShip(
  ship: Ship,
  data: KnownTeslaShipsData
): KnownTeslaShip | undefined {
  const nameUpper = ship.name.toUpperCase().trim();
  const callUpper = ship.callSign.toUpperCase().trim();

  return data.ships.find((known) => {
    if (known.callSign && callUpper === known.callSign.toUpperCase()) return true;
    if (known.name && nameUpper === known.name.toUpperCase()) return true;
    return false;
  });
}

function enrichKnownShip(ship: Ship, data: KnownTeslaShipsData): Ship {
  const knownShip = findKnownShip(ship, data);
  if (!knownShip) return ship;

  return {
    ...ship,
    imo: knownShip.imo ?? ship.imo,
    mmsi: knownShip.mmsi ?? ship.mmsi,
  };
}

/** Check if any of the ship's ports match a route pattern list. */
function matchesPorts(ports: string[], patterns: string[]): boolean {
  const patternsUpper = patterns.map((p) => p.toUpperCase());
  return ports.some((port) => {
    const portUpper = port.toUpperCase().trim();
    if (!portUpper) return false;
    return patternsUpper.some((pat) => portUpper.includes(pat));
  });
}

/** Check if ship originates from a known Tesla export port (e.g. Shanghai) */
function hasOriginMatch(ship: Ship, data: KnownTeslaShipsData): boolean {
  const { originPorts } = data.routePatterns;
  return matchesPorts([ship.originPort, ship.previousPort], originPorts);
}

function isTeslaCandidateWithData(
  ship: Ship,
  data: KnownTeslaShipsData
): boolean {
  const isCarCarrier =
    ship.vesselType.includes(CAR_CARRIER_TYPE) ||
    ship.route.includes(CAR_CARRIER_TYPE);

  // Must be a car carrier
  if (!isCarCarrier) return false;

  // Must have origin from China (Shanghai etc.)
  if (!hasOriginMatch(ship, data)) return false;

  // Any car carrier from Shanghai is a candidate
  return true;
}

/** Determine if a ship is a Tesla candidate. */
export function isTeslaCandidate(ship: Ship): boolean {
  const data = loadKnownData();
  return isTeslaCandidateWithData(ship, data);
}

/** Apply Tesla candidate filter to all ships, setting the isTeslaCandidate flag. */
export function applyTeslaFilter(ships: Ship[]): Ship[] {
  const data = loadKnownData();

  return ships.map((ship) => {
    const enrichedShip = enrichKnownShip(ship, data);
    return {
      ...enrichedShip,
      isTeslaCandidate: isTeslaCandidateWithData(enrichedShip, data),
    };
  });
}
