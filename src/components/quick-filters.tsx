import { Anchor, CalendarDays, CalendarRange, List, Sparkle, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuickFilterId =
  | "all"
  | "tesla"
  | "favorites"
  | "today"
  | "week"
  | "inPort"
  | "scheduled";

interface QuickFiltersProps {
  value: QuickFilterId;
  counts: Record<QuickFilterId, number>;
  onChange: (value: QuickFilterId) => void;
}

const CHIPS: {
  id: QuickFilterId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  activeClass: string;
}[] = [
  {
    id: "all",
    label: "すべて",
    icon: List,
    activeClass: "border-primary/40 bg-primary/10 text-primary",
  },
  {
    id: "tesla",
    label: "Tesla のみ",
    icon: Zap,
    activeClass: "border-tesla/60 bg-tesla text-tesla-foreground",
  },
  {
    id: "favorites",
    label: "お気に入り",
    icon: Star,
    activeClass: "border-yellow-500/50 bg-yellow-500/15 text-yellow-300",
  },
  {
    id: "today",
    label: "今日",
    icon: Sparkle,
    activeClass: "border-amber-500/40 bg-amber-500/15 text-amber-300",
  },
  {
    id: "week",
    label: "今週",
    icon: CalendarRange,
    activeClass: "border-blue-500/40 bg-blue-500/15 text-blue-300",
  },
  {
    id: "inPort",
    label: "在港中",
    icon: Anchor,
    activeClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
  },
  {
    id: "scheduled",
    label: "予定",
    icon: CalendarDays,
    activeClass: "border-sky-500/40 bg-sky-500/15 text-sky-300",
  },
];

export function QuickFilters({ value, counts, onChange }: QuickFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CHIPS.map(({ id, label, icon: Icon, activeClass }) => {
        const active = value === id;
        const count = counts[id];
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors sm:h-8",
              active
                ? activeClass
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            <span>{label}</span>
            <span
              className={cn(
                "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                active ? "bg-white/20" : "bg-muted text-muted-foreground",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
