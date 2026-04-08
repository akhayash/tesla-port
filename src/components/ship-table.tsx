import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnFiltersState,
  type SortingState,
  type Header,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Zap } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";
import type { Ship } from "@/lib/types";

function fmt(raw: string | null): string {
  if (!raw) return "—";
  const t = raw.trim();
  return !t || t === "縲" || t === "　" ? "—" : t;
}

function arrival(s: Ship) {
  return s.actualArrival ?? s.confirmedArrival ?? s.scheduledArrival;
}
function departure(s: Ship) {
  return s.actualDeparture ?? s.confirmedDeparture ?? s.scheduledDeparture;
}

function unique(ships: Ship[], get: (s: Ship) => string) {
  return Array.from(new Set(ships.map(get).map((v) => v.trim()).filter(Boolean))).sort();
}

const col = createColumnHelper<Ship>();

interface ShipTableProps {
  ships: Ship[];
  allShips: Ship[];
}

export function ShipTable({ ships, allShips }: ShipTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "arrival", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: "vesselType", value: "自動車専用船" },
    { id: "status", value: "予定" },
  ]);

  const vesselTypes = useMemo(() => unique(allShips, (s) => s.vesselType), [allShips]);
  const statuses = useMemo(() => unique(allShips, (s) => s.status), [allShips]);

  const columns = useMemo(
    () => [
      col.accessor("name", {
        header: "船名",
        cell: (i) => i.getValue(),
        filterFn: "includesString",
      }),
      col.accessor("vesselType", {
        header: "船種",
        cell: (i) => i.getValue() || "—",
        filterFn: "equals",
      }),
      col.accessor("status", {
        header: "ステータス",
        cell: (i) => (
          <StatusBadge status={i.getValue()} operationStatus={i.row.original.operationStatus} />
        ),
        filterFn: "equals",
      }),
      col.accessor((r) => arrival(r), {
        id: "arrival",
        header: "入港予定",
        cell: (i) => <span className="tabular-nums">{fmt(i.getValue())}</span>,
      }),
      col.accessor((r) => departure(r), {
        id: "departure",
        header: "離岸予定",
        cell: (i) => <span className="tabular-nums">{fmt(i.getValue())}</span>,
      }),
      col.accessor("previousPort", {
        header: "前港",
        cell: (i) => i.getValue() || "—",
        filterFn: "includesString",
      }),
      col.accessor("nextPort", {
        header: "次港",
        cell: (i) => i.getValue() || "—",
        filterFn: "includesString",
      }),
      col.accessor("originPort", {
        header: "仕出港",
        cell: (i) => i.getValue() || "—",
        filterFn: "includesString",
      }),
      col.accessor("destinationPort", {
        header: "仕向港",
        cell: (i) => i.getValue() || "—",
        filterFn: "includesString",
      }),
      col.accessor("isTeslaCandidate", {
        header: "Tesla",
        cell: (i) =>
          i.getValue() ? <Zap className="size-4 fill-red-500 text-red-500" /> : null,
        filterFn: (row, _id, val) => (val === true ? row.original.isTeslaCandidate : true),
        enableSorting: true,
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: ships,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const total = ships.length;
  const filtered = table.getFilteredRowModel().rows.length;

  return (
    <div className="space-y-2">
      <p className="text-right text-xs text-muted-foreground">
        {filtered === total ? `${total}隻` : `${filtered} / ${total}隻`}
      </p>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className={cn(h.column.getCanSort() && "cursor-pointer select-none")}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getCanSort() &&
                        (h.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="size-3" />
                        ) : h.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="size-3" />
                        ) : (
                          <ArrowUpDown className="size-3 text-muted-foreground" />
                        ))}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
            {/* Filter row */}
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              {table.getHeaderGroups()[0].headers.map((h) => (
                <TableHead key={`f-${h.id}`} className="py-1">
                  <ColFilter header={h} vesselTypes={vesselTypes} statuses={statuses} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                  該当する船舶がありません
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(row.original.isTeslaCandidate && "bg-red-500/5")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/* ---------- per-column filter ---------- */

function ColFilter({
  header,
  vesselTypes,
  statuses,
}: {
  header: Header<Ship, unknown>;
  vesselTypes: string[];
  statuses: string[];
}) {
  const { column } = header;
  const id = column.id;
  const val = column.getFilterValue();

  if (id === "vesselType") {
    return (
      <Select
        value={(val as string) ?? "all"}
        onValueChange={(v) => column.setFilterValue(v === "all" ? undefined : v)}
      >
        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="全て" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全て</SelectItem>
          {vesselTypes.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
        </SelectContent>
      </Select>
    );
  }

  if (id === "status") {
    return (
      <Select
        value={(val as string) ?? "all"}
        onValueChange={(v) => column.setFilterValue(v === "all" ? undefined : v)}
      >
        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="全て" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全て</SelectItem>
          {statuses.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
        </SelectContent>
      </Select>
    );
  }

  if (id === "isTeslaCandidate") {
    const on = val === true;
    return (
      <button
        onClick={() => column.setFilterValue(on ? undefined : true)}
        className={cn(
          "flex h-7 w-full items-center justify-center gap-1 rounded-md border text-xs transition-colors",
          on ? "border-red-500 bg-red-600 text-white" : "border-border text-muted-foreground hover:bg-muted",
        )}
      >
        <Zap className="size-3" />のみ
      </button>
    );
  }

  if (["name", "previousPort", "nextPort", "originPort", "destinationPort"].includes(id)) {
    return (
      <Input
        placeholder="..."
        value={(val as string) ?? ""}
        onChange={(e) => column.setFilterValue(e.target.value || undefined)}
        className="h-7 text-xs"
      />
    );
  }

  return null;
}
