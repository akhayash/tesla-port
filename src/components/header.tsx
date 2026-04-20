import { Ship, Zap } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  scrapedAt: string | null;
  rightSlot?: React.ReactNode;
}

export function Header({ scrapedAt, rightSlot }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden
            className="relative inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/20 to-red-700/10 ring-1 ring-red-500/30"
          >
            <Ship className="size-5 text-red-500" strokeWidth={2.25} />
            <Zap className="absolute -bottom-0.5 -right-0.5 size-3.5 fill-red-500 text-red-500 drop-shadow" />
          </span>
          <div className="flex min-w-0 flex-col leading-tight">
            <h1 className="truncate font-heading text-base font-semibold tracking-tight sm:text-lg">
              Tesla Port Finder
            </h1>
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              横浜港 Tesla 車両輸送船トラッカー
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {rightSlot}
          <ThemeToggle />
          {scrapedAt && (
            <p className="hidden text-xs text-muted-foreground tabular-nums md:block">
              {format(new Date(scrapedAt), "M/d HH:mm", { locale: ja })}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
