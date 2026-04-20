import { useEffect, useMemo, useState } from "react";
import { Search, Ship as ShipIcon, Zap } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { Ship } from "@/lib/types";

interface CommandPaletteProps {
  ships: Ship[];
  onSelect: (ship: Ship) => void;
}

export function CommandPalette({ ships, onSelect }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const items = useMemo(() => {
    return ships.map((ship, idx) => ({
      key: `${ship.callSign || ship.name}-${idx}`,
      ship,
      searchText: [
        ship.name,
        ship.callSign,
        ship.imo,
        ship.mmsi,
        ship.previousPort,
        ship.nextPort,
        ship.originPort,
        ship.destinationPort,
        ship.vesselType,
      ]
        .filter(Boolean)
        .join(" "),
    }));
  }, [ships]);

  const teslaItems = items.filter((i) => i.ship.isTeslaCandidate);
  const otherItems = items.filter((i) => !i.ship.isTeslaCandidate);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:h-8"
        aria-label="検索を開く (Ctrl/⌘+K)"
      >
        <Search className="size-3.5" />
        <span>検索</span>
        <kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono sm:inline">
          ⌘K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="船名・IMO・港名で検索…" />
        <CommandList>
          <CommandEmpty>該当する船舶がありません</CommandEmpty>
          {teslaItems.length > 0 && (
            <CommandGroup heading="Tesla 候補">
              {teslaItems.map(({ key, ship, searchText }) => (
                <CommandItem
                  key={key}
                  value={searchText}
                  onSelect={() => {
                    onSelect(ship);
                    setOpen(false);
                  }}
                >
                  <Zap className="size-4 fill-red-500 text-red-500" />
                  <span className="font-medium">{ship.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {ship.previousPort || "—"} → 横浜
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {otherItems.length > 0 && (
            <CommandGroup heading="その他の船舶">
              {otherItems.map(({ key, ship, searchText }) => (
                <CommandItem
                  key={key}
                  value={searchText}
                  onSelect={() => {
                    onSelect(ship);
                    setOpen(false);
                  }}
                >
                  <ShipIcon className="size-4 text-muted-foreground" />
                  <span>{ship.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {ship.vesselType || "—"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
