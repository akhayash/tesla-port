import type { Ship } from "../src/lib/types.ts";
import {
  type IdentifierEnrichmentResult,
  type IdentifierLookupSource,
} from "./identifier-enrichment/domain.ts";
import { enrichShipsWithIdentifiers } from "./identifier-enrichment/enrich-ships-with-identifiers.ts";
import { FileIdentifierCacheRepository } from "./identifier-enrichment/file-identifier-cache-repository.ts";
import { VesselFinderScrapeSource } from "./identifier-enrichment/vesselfinder-scrape-source.ts";

const IDENTIFIER_LOOKUP_SOURCE =
  process.env.IDENTIFIER_LOOKUP_SOURCE?.trim().toLowerCase() ||
  "vesselfinder-scrape";

function createLookupSource(): IdentifierLookupSource | null {
  switch (IDENTIFIER_LOOKUP_SOURCE) {
    case "none":
      return null;
    case "vesselfinder-scrape":
      return new VesselFinderScrapeSource();
    default:
      throw new Error(
        `Unsupported IDENTIFIER_LOOKUP_SOURCE: ${IDENTIFIER_LOOKUP_SOURCE}`
      );
  }
}

export async function enrichShipIdentifiers(
  ships: Ship[]
): Promise<IdentifierEnrichmentResult> {
  const cacheRepository = new FileIdentifierCacheRepository();
  const lookupSource = createLookupSource();

  return enrichShipsWithIdentifiers(ships, {
    cacheRepository,
    lookupSource,
  });
}
