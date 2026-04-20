import { Moon, Sun, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, type ThemeMode } from "@/hooks/use-theme";

const OPTIONS: { id: ThemeMode; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: "light", icon: Sun, label: "ライト" },
  { id: "dark", icon: Moon, label: "ダーク" },
  { id: "system", icon: Laptop, label: "システム" },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="テーマ切替"
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-background p-0.5"
    >
      {OPTIONS.map(({ id, icon: Icon, label }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setMode(id)}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}
