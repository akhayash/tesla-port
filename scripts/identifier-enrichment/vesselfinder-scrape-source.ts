import { load } from "cheerio";
import type { Ship, ShipIdentifierRecord } from "../../src/lib/types.ts";
import {
  normalize,
  type IdentifierLookupResult,
  type IdentifierLookupSource,
} from "./domain.ts";

const VESSELFINDER_ROOT_URL =
  process.env.VESSELFINDER_ROOT_URL?.trim().replace(/\/$/, "") ||
  "https://www.vesselfinder.com";
const REQUEST_DELAY_MS = Number.parseInt(
  process.env.IDENTIFIER_LOOKUP_DELAY_MS ?? "2500",
  10
);
const SEARCH_RESULT_LIMIT = Number.parseInt(
  process.env.IDENTIFIER_SEARCH_RESULT_LIMIT ?? "5",
  10
);
const USER_AGENT =
  process.env.IDENTIFIER_LOOKUP_USER_AGENT?.trim() || "TeslaPortTracker/1.0";

interface VesselFinderCandidate {
  record: ShipIdentifierRecord;
  callSign?: string;
  grossTonnage?: number;
  length?: number;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/,/g, "").trim();
  if (!cleaned) return undefined;
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function extractFirstMatch(
  text: string,
  patterns: RegExp[]
): RegExpMatchArray | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match;
  }

  return undefined;
}

export class VesselFinderScrapeSource implements IdentifierLookupSource {
  readonly name = "vesselfinder-scrape";

  private lastRequestAt = 0;

  async lookup(ship: Ship): Promise<IdentifierLookupResult> {
    const detailPaths = await this.fetchDetailPaths(ship.name);

    if (detailPaths.length === 0) {
      return { status: "miss" };
    }

    const candidates: VesselFinderCandidate[] = [];

    for (const detailPath of detailPaths.slice(0, SEARCH_RESULT_LIMIT)) {
      const candidate = await this.fetchCandidate(detailPath);
      if (candidate) {
        candidates.push(candidate);
      }
    }

    return this.resolveMatch(ship, candidates);
  }

  private async fetchDetailPaths(shipName: string): Promise<string[]> {
    const url = new URL("/vessels", VESSELFINDER_ROOT_URL);
    url.searchParams.set("name", shipName);

    const html = await this.fetchHtml(url.toString());
    const $ = load(html);
    const detailPaths = new Set<string>();

    $("a[href]").each((_, element) => {
      const href = $(element).attr("href")?.trim();
      if (!href?.startsWith("/vessels/details/")) return;
      const normalizedHref = href.split("?")[0];
      if (!/^\/vessels\/details\/\d+$/.test(normalizedHref)) return;
      detailPaths.add(normalizedHref);
    });

    return [...detailPaths];
  }

  private async fetchCandidate(
    detailPath: string
  ): Promise<VesselFinderCandidate | undefined> {
    const html = await this.fetchHtml(new URL(detailPath, VESSELFINDER_ROOT_URL).toString());
    const text = normalizeWhitespace(load(html).root().text());

    const vesselSummary = extractFirstMatch(text, [
      /The vessel\s+(.+?)\s+\(IMO\s+(\d+),\s*MMSI\s+(\d+)\)/i,
      /The vessel\s+(.+?)\s+\(IMO\s+(\d+),\s*MMSI\s+([0-9]+)\)/i,
    ]);
    if (!vesselSummary) return undefined;

    const callSignMatch = extractFirstMatch(text, [
      /Callsign\s+([A-Z0-9-]+)/i,
    ]);
    const grossTonnageMatch = extractFirstMatch(text, [
      /Gross Tonnage\s+([0-9,]+)/i,
    ]);
    const lengthMatch = extractFirstMatch(text, [
      /Length \/ Beam\s+([0-9.,]+)\s*\/\s*[0-9.,]+\s*m/i,
      /Length Overall \(m\)\s+([0-9.,]+)/i,
    ]);

    const vesselName = normalizeWhitespace(vesselSummary[1]);
    const imo = vesselSummary[2]?.trim();
    const mmsi = vesselSummary[3]?.trim();

    const record: ShipIdentifierRecord = {
      callSign: callSignMatch?.[1]?.trim() || "",
      name: vesselName,
      imo,
      mmsi,
      source: this.name,
      updatedAt: new Date().toISOString(),
    };

    if (!record.imo && !record.mmsi) return undefined;

    return {
      record,
      callSign: callSignMatch?.[1]?.trim(),
      grossTonnage: parseNumber(grossTonnageMatch?.[1]),
      length: parseNumber(lengthMatch?.[1]),
    };
  }

  private resolveMatch(
    ship: Ship,
    candidates: VesselFinderCandidate[]
  ): IdentifierLookupResult {
    const exactName = candidates.filter(
      (candidate) => normalize(candidate.record.name) === normalize(ship.name)
    );
    let pool = exactName.length > 0 ? exactName : candidates;

    if (ship.callSign.trim()) {
      const exactCallSign = pool.filter(
        (candidate) => normalize(candidate.callSign) === normalize(ship.callSign)
      );
      if (exactCallSign.length === 1) {
        return {
          status: "matched",
          record: exactCallSign[0].record,
        };
      }
      if (exactCallSign.length > 1) {
        pool = exactCallSign;
      }
    }

    if (ship.grossTonnage > 0) {
      const exactGrossTonnage = pool.filter(
        (candidate) => candidate.grossTonnage === ship.grossTonnage
      );
      if (exactGrossTonnage.length === 1) {
        return {
          status: "matched",
          record: exactGrossTonnage[0].record,
        };
      }
      if (exactGrossTonnage.length > 1) {
        pool = exactGrossTonnage;
      }
    }

    if (ship.length > 0) {
      const exactLength = pool.filter((candidate) => candidate.length === ship.length);
      if (exactLength.length === 1) {
        return {
          status: "matched",
          record: exactLength[0].record,
        };
      }
      if (exactLength.length > 1) {
        pool = exactLength;
      }
    }

    if (pool.length === 1) {
      return {
        status: "matched",
        record: pool[0].record,
      };
    }

    if (pool.length > 1) {
      console.warn(
        `[identifiers] Ambiguous VesselFinder scrape results for ${ship.name} (${ship.callSign || "no callsign"})`
      );
      return { status: "ambiguous" };
    }

    return { status: "miss" };
  }

  private async fetchHtml(url: string): Promise<string> {
    await this.delay();

    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText} for ${url}`);
    }

    const html = await response.text();
    if (/captcha/i.test(html)) {
      throw new Error(`Captcha encountered for ${url}`);
    }

    return html;
  }

  private async delay(): Promise<void> {
    const waitMs = Math.max(0, REQUEST_DELAY_MS - (Date.now() - this.lastRequestAt));
    if (waitMs > 0) {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, waitMs));
    }
    this.lastRequestAt = Date.now();
  }
}
