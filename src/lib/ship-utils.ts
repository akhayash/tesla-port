import { parse, addYears, subYears } from "date-fns";
import type { Ship } from "./types";

/** Best-effort arrival time: actual > confirmed > scheduled. */
export function arrivalOf(s: Ship): string | null {
  return s.actualArrival ?? s.confirmedArrival ?? s.scheduledArrival;
}

/** Best-effort departure time: actual > confirmed > scheduled. */
export function departureOf(s: Ship): string | null {
  return s.actualDeparture ?? s.confirmedDeparture ?? s.scheduledDeparture;
}

/**
 * Parse a "MM/DD HH:mm" timestamp as returned by the Yokohama port feed.
 * The feed omits the year, so we pick the year that places the date
 * closest to `reference` (within ±6 months).
 */
export function parseShipDate(
  raw: string | null | undefined,
  reference: Date = new Date(),
): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "縲" || trimmed === "　") return null;

  const normalized = trimmed.replace(/\s+/g, " ");
  const parsed = parse(normalized, "MM/dd HH:mm", reference);
  if (Number.isNaN(parsed.getTime())) return null;

  const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 183;
  const diff = parsed.getTime() - reference.getTime();
  if (diff > SIX_MONTHS_MS) return subYears(parsed, 1);
  if (diff < -SIX_MONTHS_MS) return addYears(parsed, 1);
  return parsed;
}

export function isInPort(s: Ship, now: Date = new Date()): boolean {
  const arr = parseShipDate(arrivalOf(s), now);
  if (!arr || arr.getTime() > now.getTime()) return false;
  if (s.actualDeparture) return false;
  const dep = parseShipDate(departureOf(s), now);
  if (!dep) return true;
  return dep.getTime() >= now.getTime();
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isWithinDays(
  date: Date,
  reference: Date,
  days: number,
): boolean {
  const start = new Date(reference);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + days);
  return date.getTime() >= start.getTime() && date.getTime() < end.getTime();
}
