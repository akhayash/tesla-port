import { load, type CheerioAPI } from "cheerio";
import type { AnyNode, Element } from "domhandler";
import type { Ship, ShipStatus } from "../src/lib/types.ts";

type $El = ReturnType<CheerioAPI> & Iterable<AnyNode>;

/** Split cell text by newline, returning [first, second] with empty-string defaults. */
function splitCell(el: $El, $: CheerioAPI): [string, string] {
  const html = $(el).html() ?? "";
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
  const parts = text.split("\n").map((s) => s.trim());
  return [parts[0] ?? "", parts[1] ?? ""];
}

function cellText(el: $El, $: CheerioAPI): string {
  const html = $(el).html() ?? "";
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function parseNumber(s: string): number {
  const cleaned = s.replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

function parseStatus(s: string): ShipStatus {
  const trimmed = s.trim();
  if (trimmed === "予定" || trimmed === "決定" || trimmed === "実績") {
    return trimmed;
  }
  return "予定";
}

function emptyToNull(s: string): string | null {
  const trimmed = s.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Determine if a row is a header row.
 * Header rows typically have th elements or specific bg colors.
 */
function isHeaderRow(row: Element, $: CheerioAPI): boolean {
  const ths = $(row).find("th");
  if (ths.length > 0) return true;

  // Some tables use bgcolor on header rows
  const bg = $(row).attr("bgcolor")?.toLowerCase();
  if (bg === "#cccccc" || bg === "#999999" || bg === "#c0c0c0") return true;

  // Check if most cells contain typical header text
  const cells = $(row).find("td");
  if (cells.length > 0) {
    const firstText = $(cells.first()).text().trim();
    if (firstText === "コールサイン" || firstText === "船名") return true;
  }

  return false;
}

/**
 * Parse the Yokohama port HTML table into Ship objects.
 * The table has 2 header rows, then 10 data rows, then 2 header rows again, etc.
 */
export function parseShipTable(html: string): Ship[] {
  const $ = load(html);
  const ships: Ship[] = [];

  // Find all tables — the ship data is in a table with many rows
  const tables = $("table");
  let targetTable: ReturnType<CheerioAPI> | null = null;

  tables.each((_, table) => {
    const rows = $(table).find("tr");
    if (rows.length > 10) {
      targetTable = $(table);
      return false; // break
    }
  });

  if (!targetTable) {
    console.warn("No ship data table found in HTML");
    return ships;
  }

  const rows = (targetTable as ReturnType<CheerioAPI>).find("tr");

  rows.each((_, row) => {
    if (isHeaderRow(row as Element, $)) return; // skip header rows

    const cells = $(row).find("td");
    if (cells.length < 16) return; // not a data row

    try {
      const [callSign, vesselName] = splitCell($(cells.eq(0)), $);
      const [gtStr, loaStr] = splitCell($(cells.eq(1)), $);
      const [status, opClass] = splitCell($(cells.eq(2)), $);
      const [vesStatus, country] = splitCell($(cells.eq(3)), $);
      const [route, vesselClass] = splitCell($(cells.eq(4)), $);
      const agentName = cellText($(cells.eq(5)), $);
      const [pBerth, mBerth] = splitCell($(cells.eq(6)), $);

      // cells[7]: PEta/PStart + PAta/PAtd (scheduled & confirmed times)
      const [schedLine, confirmLine] = splitCell($(cells.eq(7)), $);
      // Schedule line may contain "arrival ~ departure"
      const schedParts = schedLine.split("~").map((s) => s.trim());
      const confirmParts = confirmLine.split("~").map((s) => s.trim());

      const pLoad = cellText($(cells.eq(8)), $);
      void pLoad; // not mapped to Ship interface

      // cells[9]: EStart + EAta/ELoad/EAtd (actual times)
      const [actualLine1, actualLine2] = splitCell($(cells.eq(9)), $);
      const actualParts1 = actualLine1.split("~").map((s) => s.trim());
      void actualLine2; // additional actual data

      // cells[10]: RAta + RAtd
      const [rAta, rAtd] = splitCell($(cells.eq(10)), $);
      void rAta;
      void rAtd;

      // cells[12]: PPort/NPort
      const [pPort, nPort] = splitCell($(cells.eq(12)), $);

      // cells[13]: DPort/FPort
      const [dPort, fPort] = splitCell($(cells.eq(13)), $);

      const ship: Ship = {
        callSign: callSign,
        name: vesselName,
        grossTonnage: parseNumber(gtStr),
        length: parseNumber(loaStr),
        status: parseStatus(status),
        operationStatus: vesStatus || opClass,
        nationality: country,
        route: route,
        vesselType: vesselClass,
        agent: agentName,
        berth: pBerth,
        berthCode: mBerth,
        scheduledArrival: emptyToNull(schedParts[0] ?? ""),
        scheduledDeparture: emptyToNull(schedParts[1] ?? ""),
        confirmedArrival: emptyToNull(confirmParts[0] ?? ""),
        confirmedDeparture: emptyToNull(confirmParts[1] ?? ""),
        actualArrival: emptyToNull(actualParts1[0] ?? ""),
        actualDeparture: emptyToNull(actualParts1[1] ?? ""),
        previousPort: pPort,
        nextPort: nPort,
        originPort: dPort,
        destinationPort: fPort,
        isTeslaCandidate: false,
      };

      // Skip rows with no meaningful data
      if (!ship.callSign && !ship.name) return;

      ships.push(ship);
    } catch (e) {
      console.warn("Failed to parse row:", e);
    }
  });

  return ships;
}
