import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StatusFilter } from "@/hooks/use-filter";

interface FilterBarProps {
  search: string;
  status: StatusFilter;
  teslaOnly: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onTeslaOnlyChange: (value: boolean) => void;
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "全て" },
  { value: "予定", label: "予定" },
  { value: "決定", label: "決定" },
  { value: "実績", label: "実績" },
];

export function FilterBar({
  search,
  status,
  teslaOnly,
  onSearchChange,
  onStatusChange,
  onTeslaOnlyChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="船名検索..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex items-center gap-2">
        <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={teslaOnly ? "default" : "outline"}
          size="sm"
          onClick={() => onTeslaOnlyChange(!teslaOnly)}
          className={cn(
            teslaOnly && "bg-red-600 text-white hover:bg-red-700",
          )}
        >
          Tesla候補のみ
        </Button>
      </div>
    </div>
  );
}
