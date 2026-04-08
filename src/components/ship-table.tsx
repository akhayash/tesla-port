import { useState, useMemo } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Zap,
  Filter,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Ship } from "@/lib/types";
import type { StatusFilter } from "@/hooks/use-filter";

type SortKey =
  | "name"
  | "vesselType"
  | "status"
  | "arrival"
  | "departure"
  | "prevPort"
  | "nextPort"
  | "originPort"
  | "destPort"
  | "tesla";
type SortDir = "asc" | "desc";

function formatDate(raw: string | null): string {
  if (!raw) return "—";
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "縲" || trimmed === "　") return "—";
  return trimmed;
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
    case "vesselType":
      return ship.vesselType;
    case "status":
      return ship.status;
    case "arrival":
      return getBestArrival(ship) ?? "";
    case "departure":
      return getBestDeparture(ship) ?? "";
    case "prevPort":
      return ship.previousPort;
    case "nextPort":
      return ship.nextPort;
    case "originPort":
      return ship.originPort;
    case "destPort":
      return ship.destinationPort;
    case "tesla":
      return ship.isTeslaCandidate ? 1 : 0;
  }
}

// Collect unique values for dropdown filters
function uniqueValues(ships: Ship[], getter: (s: Ship) => string): string[] {
  const set = new Set<string>();
  for (const s of ships) {
    const v = getter(s).trim();
    if (v) set.add(v);
  }
  return Array.from(set).sort();
}

interface ShipTableProps {
  ships: Ship[];
  allShips: Ship[];
  filters: {
    status: StatusFilter;
    carCarrierOnly: boolean;
    shanghaiOrigin: boolean;
    nagoyaRoute: boolean;
    teslaOnly: boolean;
  };
  onStatusChange: (v: StatusFilter) => void;
  onCarCarrierOnlyChange: (v: boolean) => void;
  onShanghaiOriginChange: (v: boolean) => void;
  onNagoyaRouteChange: (v: boolean) => void;
  onTeslaOnlyChange: (v: boolean) => void;
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "予定", label: "予定" },
  { value: "決定", label: "決定" },
  { value: "実績", label: "実績" },
];

export function ShipTable({
  ships,
  allShips,
  filters,
  onStatusChange,
  onCarCarrierOnlyChange,
  onShanghaiOriginChange,
  onNagoyaRouteChange,
  onTeslaOnlyChange,
}: ShipTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("arrival");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const vesselTypes = useMemo(() => uniqueValues(allShips, (s) => s.vesselType), [allShips]);

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

  void vesselTypes;

  return (
    <Table>
      <TableHeader>
        {/* Column labels */}
        <TableRow>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
            <span className="inline-flex items-center gap-1">船名 <SortIcon col="name" /></span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("vesselType")}>
            <span className="inline-flex items-center gap-1">船種 <SortIcon col="vesselType" /></span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("status")}>
            <span className="inline-flex items-center gap-1">ステータス <SortIcon col="status" /></span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("arrival")}>
            <span className="inline-flex items-center gap-1">入港予定 <SortIcon col="arrival" /></span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("departure")}>
            <span className="inline-flex items-center gap-1">離岸予定 <SortIcon col="departure" /></span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("prevPort")}>
            <span className="inline-flex items-center gap-1">前港 <SortIcon col="prevPort" /></span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("nextPort")}>
            <span className="inline-flex items-center gap-1">次港 <SortIcon col="nextPort" /></span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("originPort")}>
            <span className="inline-flex items-center gap-1">仕出港 <SortIcon col="originPort" /></span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("destPort")}>
            <span className="inline-flex items-center gap-1">仕向港 <SortIcon col="destPort" /></span>
          </TableHead>
          <TableHead className="cursor-pointer select-none" onClick={() => handleSort("tesla")}>
            <span className="inline-flex items-center gap-1">Tesla <SortIcon col="tesla" /></span>
          </TableHead>
        </TableRow>
        {/* Filter row */}
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableHead />
          <TableHead>
            <Select
              value={filters.carCarrierOnly ? "自動車専用船" : "all"}
              onValueChange={(v) => onCarCarrierOnlyChange(v === "自動車専用船")}
            >
              <SelectTrigger className="h-7 w-full text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全て</SelectItem>
                <SelectItem value="自動車専用船">自動車専用船</SelectItem>
              </SelectContent>
            </Select>
          </TableHead>
          <TableHead>
            <Select
              value={filters.status}
              onValueChange={(v) => onStatusChange(v as StatusFilter)}
            >
              <SelectTrigger className="h-7 w-full text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TableHead>
          <TableHead />
          <TableHead />
          <TableHead />
          <TableHead />
          <TableHead>
            <Button
              variant={filters.shanghaiOrigin ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-7 w-full text-[10px]",
                filters.shanghaiOrigin && "bg-amber-600 text-white hover:bg-amber-700",
              )}
              onClick={() => onShanghaiOriginChange(!filters.shanghaiOrigin)}
            >
              <Filter className="size-3" />
              上海
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant={filters.nagoyaRoute ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-7 w-full text-[10px]",
                filters.nagoyaRoute && "bg-emerald-600 text-white hover:bg-emerald-700",
              )}
              onClick={() => onNagoyaRouteChange(!filters.nagoyaRoute)}
            >
              <Filter className="size-3" />
              名古屋
            </Button>
          </TableHead>
          <TableHead>
            <Button
              variant={filters.teslaOnly ? "default" : "ghost"}
              size="sm"
              className={cn(
                "h-7 w-full text-[10px]",
                filters.teslaOnly && "bg-red-600 text-white hover:bg-red-700",
              )}
              onClick={() => onTeslaOnlyChange(!filters.teslaOnly)}
            >
              <Zap className="size-3" />
              のみ
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
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
                <Badge variant="outline" className="text-[10px]">{ship.vesselType || "—"}</Badge>
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={ship.status}
                  operationStatus={ship.operationStatus}
                />
              </TableCell>
              <TableCell className="tabular-nums">{formatDate(getBestArrival(ship))}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="tabular-nums text-[10px]">{formatDate(getBestDeparture(ship))}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">{ship.previousPort || "—"}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">{ship.nextPort || "—"}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{ship.originPort || "—"}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">{ship.destinationPort || "—"}</Badge>
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
