import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { resolve } from "node:path";
import * as iconv from "iconv-lite";
import { parseShipTable } from "./parser.ts";
import { applyTeslaFilter } from "./filter.ts";
import type { ShipData } from "../src/lib/types.ts";

const TARGET_URL = "http://www.port.city.yokohama.jp/APP/Pves0040InPlanC";

const FORM_PARAMS: Record<string, string> = {
  hid_gamenid: "Jyoho04",
  cbo_cberth: "",
  "txt_cetay/m/d": "",
  cbo_status: "",
  txt_callsign: "",
  txt_vesselname: "",
};

function buildFormBody(params: Record<string, string>): Buffer {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    parts.push(
      `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    );
  }
  const bodyStr = parts.join("&");
  // Encode form body as Shift_JIS for the server
  return iconv.encode(bodyStr, "Shift_JIS");
}

async function fetchPage(): Promise<string> {
  console.log(`[scrape] POST ${TARGET_URL}`);
  const body = buildFormBody(FORM_PARAMS);

  const response = await fetch(TARGET_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "TeslaPortTracker/1.0",
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // Response is Shift_JIS encoded — read as raw bytes and decode
  const buffer = Buffer.from(await response.arrayBuffer());
  const html = iconv.decode(buffer, "Shift_JIS");
  console.log(`[scrape] Received ${buffer.length} bytes, decoded ${html.length} chars`);
  return html;
}

function todayString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function main(): Promise<void> {
  const startTime = Date.now();
  console.log(`[scrape] Starting scrape at ${new Date().toISOString()}`);

  // 1. Fetch HTML
  let html: string;
  try {
    html = await fetchPage();
  } catch (err) {
    console.error("[scrape] Failed to fetch page:", err);
    process.exit(1);
  }

  // 2. Parse HTML into Ship[]
  console.log("[scrape] Parsing HTML table...");
  let ships = parseShipTable(html);
  console.log(`[scrape] Parsed ${ships.length} ships`);

  if (ships.length === 0) {
    console.warn("[scrape] No ships found — the page structure may have changed");
  }

  // 3. Apply Tesla filter
  console.log("[scrape] Applying Tesla candidate filter...");
  ships = applyTeslaFilter(ships);
  const teslaCandidates = ships.filter((s) => s.isTeslaCandidate);
  console.log(`[scrape] Found ${teslaCandidates.length} Tesla candidate(s)`);

  for (const candidate of teslaCandidates) {
    console.log(`  → ${candidate.name} (${candidate.callSign}) [${candidate.vesselType}] from ${candidate.originPort}`);
  }

  // 4. Build output
  const data: ShipData = {
    scrapedAt: new Date().toISOString(),
    source: TARGET_URL,
    ships,
  };

  const rootDir = resolve(import.meta.dirname!, "..");
  const dataDir = resolve(rootDir, "data");
  const historyDir = resolve(dataDir, "history");

  mkdirSync(historyDir, { recursive: true });

  // 5. Write data/ships.json
  const shipsPath = resolve(dataDir, "ships.json");
  writeFileSync(shipsPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`[scrape] Wrote ${shipsPath}`);

  // 6. Copy to data/history/YYYY-MM-DD.json
  const historyPath = resolve(historyDir, `${todayString()}.json`);
  copyFileSync(shipsPath, historyPath);
  console.log(`[scrape] Copied to ${historyPath}`);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[scrape] Done in ${elapsed}s — ${ships.length} ships total, ${teslaCandidates.length} Tesla candidate(s)`);
}

main();
