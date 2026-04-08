import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface FilterBarProps {
  search: string;
  totalCount: number;
  filteredCount: number;
  onSearchChange: (value: string) => void;
}

export function FilterBar({
  search,
  totalCount,
  filteredCount,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="船名検索..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {filteredCount === totalCount
          ? `${totalCount}隻`
          : `${filteredCount} / ${totalCount}隻`}
      </span>
    </div>
  );
}
