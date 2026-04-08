import { Search, Ship as ShipIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StatusFilter } from "@/hooks/use-filter";

interface FilterBarProps {
  search: string;
  status: StatusFilter;
  teslaOnly: boolean;
  carCarrierOnly: boolean;
  shanghaiOrigin: boolean;
  nagoyaRoute: boolean;
  totalCount: number;
  filteredCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onTeslaOnlyChange: (value: boolean) => void;
  onCarCarrierOnlyChange: (value: boolean) => void;
  onShanghaiOriginChange: (value: boolean) => void;
  onNagoyaRouteChange: (value: boolean) => void;
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
  carCarrierOnly,
  shanghaiOrigin,
  nagoyaRoute,
  totalCount,
  filteredCount,
  onSearchChange,
  onStatusChange,
  onTeslaOnlyChange,
  onCarCarrierOnlyChange,
  onShanghaiOriginChange,
  onNagoyaRouteChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="船名検索..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={carCarrierOnly ? "default" : "outline"}
          size="sm"
          onClick={() => onCarCarrierOnlyChange(!carCarrierOnly)}
          className={cn(
            "gap-1.5",
            carCarrierOnly && "bg-blue-600 text-white hover:bg-blue-700",
          )}
        >
          <ShipIcon className="size-3.5" />
          自動車専用船
        </Button>
        <Button
          variant={shanghaiOrigin ? "default" : "outline"}
          size="sm"
          onClick={() => onShanghaiOriginChange(!shanghaiOrigin)}
          className={cn(
            shanghaiOrigin && "bg-amber-600 text-white hover:bg-amber-700",
          )}
        >
          仕出港: 上海
        </Button>
        <Button
          variant={nagoyaRoute ? "default" : "outline"}
          size="sm"
          onClick={() => onNagoyaRouteChange(!nagoyaRoute)}
          className={cn(
            nagoyaRoute && "bg-emerald-600 text-white hover:bg-emerald-700",
          )}
        >
          名古屋経由
        </Button>
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

        <div className="flex items-center gap-1">
          {statusOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={status === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(opt.value)}
              className={cn(
                "text-xs",
                status === opt.value && "bg-violet-600 text-white hover:bg-violet-700",
              )}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        <span className="ml-auto text-xs text-muted-foreground">
          {filteredCount === totalCount
            ? `${totalCount}隻`
            : `${filteredCount} / ${totalCount}隻`}
        </span>
      </div>
    </div>
  );
}
