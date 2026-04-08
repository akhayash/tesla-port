import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Ship, KnownTeslaShipsData } from "../src/lib/types.ts";

const CAR_CARRIER_TYPE = "自動車専用船";

let _knownData: KnownTeslaShipsData | null = null;

function loadKnownData(): KnownTeslaShipsData {
  if (_knownData) return _knownData;

  const filePath = resolve(import.meta.dirname!, "..", "data", "known-tesla-ships.json");
  const raw = readFileSync(filePath, "utf-8");
  _knownData = JSON.parse(raw) as KnownTeslaShipsData;
  return _knownData;
}

/** Check if the ship name matches any known Tesla ship. */
function isKnownShip(ship: Ship, data: KnownTeslaShipsData): boolean {
  const nameUpper = ship.name.toUpperCase().trim();
  const callUpper = ship.callSign.toUpperCase().trim();

  return data.ships.some((known) => {
    if (known.callSign && callUpper === known.callSign.toUpperCase()) return true;
    if (known.name && nameUpper === known.name.toUpperCase()) return true;
    return false;
  });
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

/** Check if the ship's route matches known Tesla shipping routes. */
function isRouteMatch(ship: Ship, data: KnownTeslaShipsData): boolean {
  const { originPorts, adjacentPorts } = data.routePatterns;

  const shipPorts = [ship.previousPort, ship.nextPort, ship.originPort, ship.destinationPort];
  const originMatch = matchesPorts(shipPorts, originPorts);
  const adjacentMatch = matchesPorts(shipPorts, adjacentPorts);

  // Origin/destination port matches Chinese Tesla ports
  if (matchesPorts([ship.originPort], originPorts)) return true;

  // Previous port is a known origin AND next port is an adjacent Japanese port (or vice versa)
  if (originMatch && adjacentMatch) return true;

  return false;
}

/** Determine if a ship is a Tesla candidate. */
export function isTeslaCandidate(ship: Ship): boolean {
  const data = loadKnownData();

  // Must be a car carrier
  const isCarCarrier = ship.vesselType.includes(CAR_CARRIER_TYPE);

  // Known Tesla ship — always a candidate regardless of type
  if (isKnownShip(ship, data)) return true;

  // Car carrier on a matching route
  if (isCarCarrier && isRouteMatch(ship, data)) return true;

  return false;
}

/** Apply Tesla candidate filter to all ships, setting the isTeslaCandidate flag. */
export function applyTeslaFilter(ships: Ship[]): Ship[] {
  return ships.map((ship) => ({
    ...ship,
    isTeslaCandidate: isTeslaCandidate(ship),
  }));
}
