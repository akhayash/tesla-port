import { useState, useMemo, useRef, useCallback } from "react";
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
  type FilterFn,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Zap, Copy, Image, Check } from "lucide-react";
import { toPng } from "html-to-image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { FacetedFilter } from "@/components/faceted-filter";
import { ShipCardList } from "@/components/ship-card-list";
import { FavoriteButton } from "@/components/favorite-button";
import { favoriteKey } from "@/hooks/use-favorites";
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
  return Array.from(
    new Set(ships.map(get).map((v) => v.trim()).filter(Boolean)),
  ).sort();
}

const multiSelectFilter: FilterFn<Ship> = (row, columnId, filterValue: Set<string>) => {
  if (!filterValue || filterValue.size === 0) return true;
  const cellValue = String(row.getValue(columnId)).trim();
  return filterValue.has(cellValue);
};

const helper = createColumnHelper<Ship>();

interface ShipTableProps {
  ships: Ship[];
  allShips: Ship[];
  onOpenShip: (ship: Ship) => void;
  favorites?: {
    has: (key: string) => boolean;
    toggle: (key: string) => void;
  };
}

export function ShipTable({ ships, allShips, onOpenShip, favorites }: ShipTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "arrival", desc: false },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Build a unique hash key for each ship (callSign or name + index for duplicates)
  const shipHashKey = useCallback(
    (ship: Ship): string => {
      const base = ship.callSign || encodeURIComponent(ship.name);
      const sameKey = ships.filter(
        (s) => (s.callSign || encodeURIComponent(s.name)) === base
      );
      if (sameKey.length <= 1) return base;
      const idx = sameKey.indexOf(ship);
      return idx > 0 ? `${base}:${idx}` : base;
    },
    [ships]
  );

  void shipHashKey;

  const openShip = onOpenShip;

  const shipNames = useMemo(() => unique(allShips, (s) => s.name), [allShips]);
  const vesselTypes = useMemo(() => unique(allShips, (s) => s.vesselType), [allShips]);
  const statuses = useMemo(() => unique(allShips, (s) => s.status), [allShips]);
  const prevPorts = useMemo(() => unique(allShips, (s) => s.previousPort), [allShips]);
  const originPorts = useMemo(() => unique(allShips, (s) => s.originPort), [allShips]);
  const destPorts = useMemo(() => unique(allShips, (s) => s.destinationPort), [allShips]);

  const columns = useMemo(
    () => [
      helper.accessor("name", {
        header: "船名",
        cell: (i) => {
          const ship = i.row.original;
          const key = favoriteKey(ship);
          return (
            <span className="inline-flex items-center gap-1.5">
              {favorites && (
                <FavoriteButton
                  active={favorites.has(key)}
                  onToggle={() => favorites.toggle(key)}
                />
              )}
              <span>{i.getValue()}</span>
            </span>
          );
        },
        filterFn: multiSelectFilter,
      }),
      helper.accessor("vesselType", {
        header: "船種",
        cell: (i) => i.getValue() || "—",
        filterFn: multiSelectFilter,
      }),
      helper.accessor("status", {
        header: "ステータス",
        cell: (i) => (
          <StatusBadge
            status={i.getValue()}
            operationStatus={i.row.original.operationStatus}
          />
        ),
        filterFn: multiSelectFilter,
      }),
      helper.accessor((r) => arrival(r), {
        id: "arrival",
        header: "入港予定",
        cell: (i) => <span className="tabular-nums">{fmt(i.getValue())}</span>,
        filterFn: "includesString",
      }),
      helper.accessor((r) => departure(r), {
        id: "departure",
        header: "離岸予定",
        cell: (i) => <span className="tabular-nums">{fmt(i.getValue())}</span>,
        filterFn: "includesString",
      }),
      helper.accessor("previousPort", {
        header: "前港→横浜→次港",
        cell: (i) => (
          <span className="inline-flex items-center gap-1">
            <span>{i.getValue() || "—"}</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold text-primary">横浜</span>
            <span className="text-muted-foreground">→</span>
            <span>{i.row.original.nextPort || "—"}</span>
          </span>
        ),
        filterFn: multiSelectFilter,
      }),
      helper.accessor("originPort", {
        header: "仕出港",
        cell: (i) => i.getValue() || "—",
        filterFn: multiSelectFilter,
      }),
      helper.accessor("destinationPort", {
        header: "仕向港",
        cell: (i) => i.getValue() || "—",
        filterFn: multiSelectFilter,
      }),
      helper.accessor("isTeslaCandidate", {
        header: "Tesla",
        cell: (i) =>
          i.getValue() ? (
            <Zap className="size-4 fill-red-500 text-red-500" />
          ) : null,
        filterFn: (row, _id, val) =>
          val === true ? row.original.isTeslaCandidate : true,
        enableSorting: true,
      }),
    ],
    [favorites],
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

  const facetedOptions: Record<string, { title: string; options: string[] }> = {
    name: { title: "船名", options: shipNames },
    vesselType: { title: "船種", options: vesselTypes },
    status: { title: "ステータス", options: statuses },
    previousPort: { title: "前港", options: prevPorts },
    originPort: { title: "仕出港", options: originPorts },
    destinationPort: { title: "仕向港", options: destPorts },
  };

  const handleCopyText = useCallback(async () => {
    try {
      const rows = table.getFilteredRowModel().rows;
      const header = "船名\t船種\tステータス\t入港予定\t離岸予定\t前港\t次港\t仕出港\t仕向港\tTesla";
      const lines = rows.map((r) => {
        const s = r.original;
        return [
          s.name, s.vesselType, s.status,
          fmt(arrival(s)), fmt(departure(s)),
          s.previousPort, s.nextPort, s.originPort, s.destinationPort,
          s.isTeslaCandidate ? "⚡" : "",
        ].join("\t");
      });
      await navigator.clipboard.writeText([header, ...lines].join("\n"));
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // silently fail
    }
  }, [table]);

  const handleCopyImage = useCallback(async () => {
    if (!tableRef.current) return;
    const dataUrl = await toPng(tableRef.current, {
      backgroundColor: "#1c1c22",
      pixelRatio: 2,
    });
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      const link = document.createElement("a");
      link.download = "tesla-port-table.png";
      link.href = dataUrl;
      link.click();
    }
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleCopyText}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
          title="表示中のデータをテキストコピー"
        >
          {copiedText ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
          テキスト
        </button>
        <button
          onClick={handleCopyImage}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
          title="表示中のテーブルを画像コピー"
        >
          {copiedImage ? <Check className="size-3 text-green-500" /> : <Image className="size-3" />}
          画像
        </button>
        <span className="text-xs text-muted-foreground">
          {filtered === total
            ? `${total}隻`
            : `${filtered} / ${total}隻`}
        </span>
      </div>
      <div ref={tableRef} className="hidden overflow-x-auto rounded-md border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead
                    key={h.id}
                    className={cn(
                      h.column.getCanSort() && "cursor-pointer select-none",
                    )}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                      {flexRender(
                        h.column.columnDef.header,
                        h.getContext(),
                      )}
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
                  <ColFilter
                    header={h}
                    facetedOptions={facetedOptions}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-8 text-center text-muted-foreground"
                >
                  該当する船舶がありません
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    "cursor-pointer",
                    row.original.isTeslaCandidate && "bg-red-500/5",
                  )}
                  onClick={() => openShip(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="whitespace-nowrap text-sm"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="md:hidden">
        <ShipCardList
          ships={table.getRowModel().rows.map((r) => r.original)}
          onSelect={openShip}
          favorites={favorites}
        />
      </div>
      {/* Modal is rendered by the parent (App) to support all views. */}
    </div>
  );
}

function ColFilter({
  header,
  facetedOptions,
}: {
  header: Header<Ship, unknown>;
  facetedOptions: Record<string, { title: string; options: string[] }>;
}) {
  const { column } = header;
  const id = column.id;
  const val = column.getFilterValue();

  // Faceted multi-select for port/type/status columns
  if (id in facetedOptions) {
    const { title, options } = facetedOptions[id];
    const selected =
      val instanceof Set ? (val as Set<string>) : new Set<string>();
    return (
      <FacetedFilter
        title={title}
        options={options}
        selected={selected}
        onSelectionChange={(s) =>
          column.setFilterValue(s.size > 0 ? s : undefined)
        }
      />
    );
  }

  // Tesla toggle is handled by the global QuickFilters above the table.
  if (id === "isTeslaCandidate") {
    return null;
  }

  // Text input for arrival, departure
  if (id === "arrival" || id === "departure") {
    return (
      <Input
        placeholder="MM/DD..."
        value={(val as string) ?? ""}
        onChange={(e) =>
          column.setFilterValue(e.target.value || undefined)
        }
        className="h-7 text-xs"
      />
    );
  }

  return null;
}
