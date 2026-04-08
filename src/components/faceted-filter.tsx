import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FacetedFilterProps {
  title: string;
  options: string[];
  selected: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
}

export function FacetedFilter({
  title,
  options,
  selected,
  onSelectionChange,
}: FacetedFilterProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? options.filter((o) => o.toLowerCase().includes(search.toLowerCase()))
    : options;

  const toggle = (value: string) => {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onSelectionChange(next);
  };

  const clear = () => {
    onSelectionChange(new Set());
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-7 w-full justify-between text-xs",
              selected.size > 0 && "border-primary",
            )}
          />
        }
      >
        <span className="truncate">
          {selected.size === 0
            ? title
            : selected.size <= 2
              ? Array.from(selected).join(", ")
              : `${selected.size}件選択`}
        </span>
        <ChevronsUpDown className="size-3 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-52 p-0" align="start">
        <div className="p-2">
          <Input
            placeholder={`${title}を検索...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div className="max-h-48 overflow-y-auto px-1 pb-1">
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              見つかりません
            </p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt}
                onClick={() => toggle(opt)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs hover:bg-muted"
              >
                <Check
                  className={cn(
                    "size-3 shrink-0",
                    selected.has(opt) ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{opt}</span>
              </button>
            ))
          )}
        </div>
        {selected.size > 0 && (
          <div className="border-t p-1">
            <button
              onClick={clear}
              className="flex h-7 w-full items-center justify-center gap-1 rounded-sm text-xs text-muted-foreground hover:bg-muted"
            >
              <X className="size-3" />
              クリア
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
