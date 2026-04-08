import { useEffect } from "react";
import { X, Zap, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { Ship } from "@/lib/types";

function fmt(raw: string | null): string {
  if (!raw) return "—";
  const t = raw.trim();
  return !t || t === "縲" || t === "　" ? "—" : t;
}

interface ShipDetailModalProps {
  ship: Ship;
  onClose: () => void;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border/50 py-2">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}

export function ShipDetailModal({ ship, onClose }: ShipDetailModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg border border-border bg-card text-card-foreground shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{ship.name}</h2>
              {ship.isTeslaCandidate && (
                <Zap className="size-5 fill-red-500 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge
                status={ship.status}
                operationStatus={ship.operationStatus}
              />
              <span className="text-xs text-muted-foreground">
                {ship.callSign}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Route visualization */}
        <div className="flex items-center justify-center gap-2 border-b px-4 py-3 text-sm">
          <span className="text-muted-foreground">
            {ship.previousPort || "—"}
          </span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          <span className="rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary">
            横浜
          </span>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">
            {ship.nextPort || "—"}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-0 p-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            船舶情報
          </h3>
          <Row label="船種" value={ship.vesselType || "—"} />
          <Row label="国籍" value={ship.nationality || "—"} />
          <Row
            label="総トン数"
            value={
              ship.grossTonnage
                ? ship.grossTonnage.toLocaleString() + " t"
                : "—"
            }
          />
          <Row
            label="全長"
            value={ship.length ? ship.length + " m" : "—"}
          />
          <Row label="代理店" value={ship.agent || "—"} />
          <Row label="バース" value={ship.berth || "—"} />
        </div>

        <div className="space-y-0 px-4 pb-2">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            入出港情報
          </h3>
          <Row label="入港予定" value={fmt(ship.scheduledArrival)} />
          <Row label="離岸予定" value={fmt(ship.scheduledDeparture)} />
          <Row label="着岸確定" value={fmt(ship.confirmedArrival)} />
          <Row label="離岸確定" value={fmt(ship.confirmedDeparture)} />
          <Row label="着岸実績" value={fmt(ship.actualArrival)} />
          <Row label="離岸実績" value={fmt(ship.actualDeparture)} />
        </div>

        <div className="space-y-0 px-4 pb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            航路情報
          </h3>
          <Row label="前港" value={ship.previousPort || "—"} />
          <Row label="次港" value={ship.nextPort || "—"} />
          <Row label="仕出港" value={ship.originPort || "—"} />
          <Row label="仕向港" value={ship.destinationPort || "—"} />
          <Row label="航路" value={ship.route || "—"} />
        </div>
      </div>
    </div>
  );
}
