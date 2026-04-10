import type {
  Ship,
  ShipIdentifierCacheFile,
  ShipIdentifierRecord,
} from "../../src/lib/types.ts";

export type IdentifierLookupStatus = "matched" | "miss" | "ambiguous";

export interface IdentifierLookupResult {
  status: IdentifierLookupStatus;
  record?: ShipIdentifierRecord;
}

export interface IdentifierLookupSource {
  readonly name: string;
  lookup(ship: Ship): Promise<IdentifierLookupResult>;
}

export interface IdentifierCacheRepository {
  exists(): boolean;
  load(): ShipIdentifierCacheFile;
  save(cache: ShipIdentifierCacheFile): void;
}

export interface IdentifierEnrichmentStats {
  candidates: number;
  cacheHits: number;
  lookupHits: number;
  misses: number;
  ambiguous: number;
  skipped: number;
  errors: number;
}

export interface IdentifierEnrichmentResult {
  ships: Ship[];
  stats: IdentifierEnrichmentStats;
}

export const DEFAULT_IDENTIFIER_CACHE: ShipIdentifierCacheFile = {
  updatedAt: null,
  ships: [],
};

export function normalize(value: string | undefined): string {
  return (value ?? "").trim().toUpperCase().replace(/\s+/g, " ");
}

export function hasIdentifier(ship: Ship): boolean {
  return Boolean(ship.imo || ship.mmsi);
}

export function findCacheEntry(
  ship: Ship,
  cache: ShipIdentifierCacheFile
): ShipIdentifierRecord | undefined {
  const callSign = normalize(ship.callSign);
  const name = normalize(ship.name);

  return cache.ships.find((entry) => {
    if (callSign && normalize(entry.callSign) === callSign) return true;
    if (name && normalize(entry.name) === name) return true;
    return false;
  });
}

export function mergeRecord(ship: Ship, record?: ShipIdentifierRecord): Ship {
  if (!record) return ship;

  return {
    ...ship,
    imo: ship.imo ?? record.imo,
    mmsi: ship.mmsi ?? record.mmsi,
  };
}

export function upsertCache(
  cache: ShipIdentifierCacheFile,
  ship: Ship,
  source: string
): boolean {
  if (!hasIdentifier(ship)) return false;

  const now = new Date().toISOString();
  const record: ShipIdentifierRecord = {
    callSign: ship.callSign,
    name: ship.name,
    imo: ship.imo,
    mmsi: ship.mmsi,
    source,
    updatedAt: now,
  };

  const existingIndex = cache.ships.findIndex((entry) => {
    const sameCallSign =
      normalize(entry.callSign) &&
      normalize(entry.callSign) === normalize(ship.callSign);
    const sameName =
      normalize(entry.name) && normalize(entry.name) === normalize(ship.name);
    return sameCallSign || sameName;
  });

  const existing = existingIndex >= 0 ? cache.ships[existingIndex] : undefined;
  const merged: ShipIdentifierRecord = existing
    ? {
        ...existing,
        ...record,
        imo: record.imo ?? existing.imo,
        mmsi: record.mmsi ?? existing.mmsi,
      }
    : record;

  const changed =
    !existing ||
    existing.imo !== merged.imo ||
    existing.mmsi !== merged.mmsi ||
    existing.callSign !== merged.callSign ||
    existing.name !== merged.name ||
    existing.source !== merged.source;

  if (!changed) return false;

  if (existingIndex >= 0) {
    cache.ships[existingIndex] = merged;
  } else {
    cache.ships.push(merged);
  }

  cache.updatedAt = now;
  return true;
}
