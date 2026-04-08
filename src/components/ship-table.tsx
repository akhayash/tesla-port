import { useState, useMemo } from "react";
import { format, isValid } from "date-fns";
import { ja } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Zap,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { Ship } from "@/lib/types";

type SortKey =
  | "name"
  | "status"
  | "arrival"
  | "departure"
  | "route"
  | "origin"
  | "tesla";
type SortDir = "asc" | "desc";

function formatDate(raw: string | null): string {
  if (!raw) return "—";
  const d = new Date(raw);
  return isValid(d) ? format(d, "M/d HH:mm", { locale: ja }) : "—";
}

function getBestArrival(ship: Ship): string | null {
  return ship.actualArrival ?? ship.confirmedArrival ?? ship.scheduledArrival;
}

function getBestDeparture(ship: Ship): string | null {
  return (
    ship.actualDeparture ?? ship.confirmedDeparture ?? ship.scheduledDeparture
  );
}

function getSortValue(ship: Ship, key: SortKey): string | number | boolean {
  switch (key) {
    case "name":
      return ship.name;
    case "status":
      return ship.status;
    case "arrival":
      return getBestArrival(ship) ?? "";
    case "departure":
      return getBestDeparture(ship) ?? "";
    case "route":
      return `${ship.previousPort}→${ship.nextPort}`;
    case "origin":
      return `${ship.originPort}→${ship.destinationPort}`;
    case "tesla":
      return ship.isTeslaCandidate ? 1 : 0;
  }
}

interface ShipTableProps {
  ships: Ship[];
}

const columns: { key: SortKey; label: string }[] = [
  { key: "name", label: "船名" },
  { key: "status", label: "ステータス" },
  { key: "arrival", label: "入港予定" },
  { key: "departure", label: "離岸予定" },
  { key: "route", label: "前港→次港" },
  { key: "origin", label: "仕出港→仕向港" },
  { key: "tesla", label: "Tesla候補" },
];

export function ShipTable({ ships }: ShipTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("arrival");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = useMemo(() => {
    return [...ships].sort((a, b) => {
      const av = getSortValue(a, sortKey);
      const bv = getSortValue(b, sortKey);
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [ships, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col)
      return <ArrowUpDown className="size-3 text-muted-foreground" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3" />
    ) : (
      <ArrowDown className="size-3" />
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className="cursor-pointer select-none"
              onClick={() => handleSort(col.key)}
            >
              <span className="inline-flex items-center gap-1">
                {col.label}
                <SortIcon col={col.key} />
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">
              該当する船舶がありません
            </TableCell>
          </TableRow>
        ) : (
          sorted.map((ship) => (
            <TableRow
              key={ship.callSign || ship.name}
              className={cn(ship.isTeslaCandidate && "bg-red-500/5")}
            >
              <TableCell className="font-medium">{ship.name}</TableCell>
              <TableCell>
                <StatusBadge
                  status={ship.status}
                  operationStatus={ship.operationStatus}
                />
              </TableCell>
              <TableCell>{formatDate(getBestArrival(ship))}</TableCell>
              <TableCell>{formatDate(getBestDeparture(ship))}</TableCell>
              <TableCell className="text-muted-foreground">
                {ship.previousPort || "—"} → {ship.nextPort || "—"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {ship.originPort || "—"} → {ship.destinationPort || "—"}
              </TableCell>
              <TableCell>
                {ship.isTeslaCandidate && (
                  <Zap className="size-4 fill-red-500 text-red-500" />
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
