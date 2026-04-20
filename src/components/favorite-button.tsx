import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  active: boolean;
  onToggle: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({
  active,
  onToggle,
  className,
  size = "sm",
}: FavoriteButtonProps) {
  const iconClass = size === "sm" ? "size-3.5" : "size-4";
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={active}
      aria-label={active ? "お気に入りから外す" : "お気に入りに追加"}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-yellow-500/50 focus-visible:outline-none",
        active
          ? "text-yellow-400 hover:text-yellow-300"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Star className={cn(iconClass, active && "fill-yellow-400")} />
    </button>
  );
}
