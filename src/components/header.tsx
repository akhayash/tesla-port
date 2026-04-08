import { Ship } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface HeaderProps {
  scrapedAt: string | null;
}

export function Header({ scrapedAt }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Ship className="size-6 text-red-500" />
          <h1 className="text-lg font-bold tracking-tight">Tesla Port</h1>
        </div>
        {scrapedAt && (
          <p className="text-xs text-muted-foreground">
            最終更新:{" "}
            {format(new Date(scrapedAt), "yyyy/MM/dd HH:mm", { locale: ja })}
          </p>
        )}
      </div>
    </header>
  );
}
