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
 * Header rows have bgcolor="#FFEEFF" or contain th elements.
 */
function isHeaderRow(row: Element, $: CheerioAPI): boolean {
  const ths = $(row).find("th");
  if (ths.length > 0) return true;

  const bg = $(row).attr("bgcolor")?.toUpperCase();
  if (bg === "#FFEEFF") return true;

  return false;
}

/**
 * Parse the Yokohama port HTML table into Ship objects.
 * Table id="tblid", 18 cells per data row.
 *
 * Cell mapping (verified against live data):
 *  [0]  CallSign + VesselName
 *  [1]  GT + LOA
 *  [2]  Status + OpClass
 *  [3]  VesStatus + Country
 *  [4]  Route + VesselClass
 *  [5]  AgentName
 *  [6]  BerthCode + BerthName
 *  [7]  入港予定(PEta) + スタート(PStart)       ─ 予定
 *  [8]  着岸予定(PAta) + 離岸予定(PAtd)          ─ 予定
 *  [9]  荷役開始(PLoad)                          ─ 予定
 * [10]  スタート(EStart) + 着岸日時(EAta)        ─ 決定
 * [11]  離岸日時(EAtd) + 荷役日時(ELoad)         ─ 決定
 * [12]  着岸日時(RAta) + 離岸日時(RAtd)          ─ 実績
 * [13]  登録日(Input) + 更新日(Change)
 * [14]  前港(PPort) + 次港(NPort)
 * [15]  仕出港(DPort) + 仕向港(FPort)
 * [16]  検疫(QClass)
 * [17]  着岸舷(Docking)
 */
export function parseShipTable(html: string): Ship[] {
  const $ = load(html);
  const ships: Ship[] = [];

  // The ship data table has id="tblid"
  const targetTable = $("table#tblid");

  if (targetTable.length === 0) {
    console.warn("No ship data table (id=tblid) found in HTML");
    return ships;
  }

  const rows = targetTable.find("tr");

  rows.each((_, row) => {
    if (isHeaderRow(row as Element, $)) return;

    const cells = $(row).find("td");
    if (cells.length < 16) return;

    try {
      const [callSign, vesselName] = splitCell($(cells.eq(0)), $);
      const [gtStr, loaStr] = splitCell($(cells.eq(1)), $);
      const [status, opClass] = splitCell($(cells.eq(2)), $);
      const [vesStatus, country] = splitCell($(cells.eq(3)), $);
      const [route, vesselClass] = splitCell($(cells.eq(4)), $);
      const agentName = cellText($(cells.eq(5)), $);
      const [berthCode, berthName] = splitCell($(cells.eq(6)), $);

      // 予定情報
      const [pEta] = splitCell($(cells.eq(7)), $);           // 入港予定
      const [, pAtd] = splitCell($(cells.eq(8)), $);     // 着岸予定 + 離岸予定

      // 決定情報
      const [, eAta] = splitCell($(cells.eq(10)), $);         // 着岸日時
      const [eAtd] = splitCell($(cells.eq(11)), $);           // 離岸日時

      // 実績情報
      const [rAta, rAtd] = splitCell($(cells.eq(12)), $);     // 着岸日時 + 離岸日時

      // 前港・次港・仕出港・仕向港
      const [pPort, nPort] = splitCell($(cells.eq(14)), $);
      const [dPort, fPort] = splitCell($(cells.eq(15)), $);

      const ship: Ship = {
        callSign,
        name: vesselName,
        grossTonnage: parseNumber(gtStr),
        length: parseNumber(loaStr),
        status: parseStatus(status),
        operationStatus: vesStatus || opClass,
        nationality: country,
        route,
        vesselType: vesselClass,
        agent: agentName,
        berth: berthName || berthCode,
        berthCode,
        scheduledArrival: emptyToNull(pEta),
        scheduledDeparture: emptyToNull(pAtd),
        confirmedArrival: emptyToNull(eAta),
        confirmedDeparture: emptyToNull(eAtd),
        actualArrival: emptyToNull(rAta),
        actualDeparture: emptyToNull(rAtd),
        previousPort: pPort,
        nextPort: nPort,
        originPort: dPort,
        destinationPort: fPort,
        isTeslaCandidate: false,
      };

      if (!ship.callSign && !ship.name) return;

      ships.push(ship);
    } catch (e) {
      console.warn("Failed to parse row:", e);
    }
  });

  return ships;
}
