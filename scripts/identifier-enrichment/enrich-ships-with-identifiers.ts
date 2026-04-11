import type { Ship } from "../../src/lib/types.ts";
import {
  findCacheEntry,
  hasIdentifier,
  mergeRecord,
  type IdentifierCacheRepository,
  type IdentifierEnrichmentResult,
  type IdentifierEnrichmentStats,
  type IdentifierLookupSource,
  upsertCache,
} from "./domain.ts";

interface EnrichShipsWithIdentifiersDependencies {
  cacheRepository: IdentifierCacheRepository;
  lookupSource: IdentifierLookupSource | null;
}

export async function enrichShipsWithIdentifiers(
  ships: Ship[],
  dependencies: EnrichShipsWithIdentifiersDependencies
): Promise<IdentifierEnrichmentResult> {
  const { cacheRepository, lookupSource } = dependencies;
  const cache = cacheRepository.load();
  let cacheDirty = false;

  const stats: IdentifierEnrichmentStats = {
    candidates: ships.filter((ship) => ship.isTeslaCandidate).length,
    cacheHits: 0,
    lookupHits: 0,
    misses: 0,
    ambiguous: 0,
    skipped: 0,
    errors: 0,
  };

  const enrichedShips: Ship[] = [];

  for (const ship of ships) {
    if (!ship.isTeslaCandidate) {
      enrichedShips.push(ship);
      continue;
    }

    let nextShip = ship;
    const cacheEntry = findCacheEntry(nextShip, cache);
    if (cacheEntry) {
      nextShip = mergeRecord(nextShip, cacheEntry);
      stats.cacheHits += 1;
    }

    if (hasIdentifier(nextShip)) {
      cacheDirty =
        upsertCache(cache, nextShip, cacheEntry?.source ?? "existing") || cacheDirty;
      enrichedShips.push(nextShip);
      continue;
    }

    if (!lookupSource) {
      stats.skipped += 1;
      console.warn(
        `[identifiers] Lookup source disabled; skipping ${ship.name} (${ship.callSign || "no callsign"})`
      );
      enrichedShips.push(nextShip);
      continue;
    }

    try {
      const lookup = await lookupSource.lookup(nextShip);

      if (lookup.status === "matched" && lookup.record) {
        nextShip = mergeRecord(nextShip, lookup.record);
        stats.lookupHits += 1;
        cacheDirty =
          upsertCache(cache, nextShip, lookup.record.source) || cacheDirty;
        enrichedShips.push(nextShip);
        continue;
      }

      if (lookup.status === "ambiguous") {
        stats.ambiguous += 1;
      } else {
        stats.misses += 1;
        console.warn(
          `[identifiers] No identifier match for ${ship.name} (${ship.callSign || "no callsign"})`
        );
      }
    } catch (error) {
      stats.errors += 1;
      console.warn(
        `[identifiers] Lookup source ${lookupSource.name} failed for ${ship.name} (${ship.callSign || "no callsign"}):`,
        error
      );
    }

    enrichedShips.push(nextShip);
  }

  if (cacheDirty || !cacheRepository.exists()) {
    cacheRepository.save(cache);
  }

  return { ships: enrichedShips, stats };
}
