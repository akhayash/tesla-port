import { useEffect, useRef, useCallback, useState } from "react";
import { X, Zap, ArrowRight, Copy, Image, Check, Link } from "lucide-react";
import { toPng } from "html-to-image";
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

function shipToText(ship: Ship): string {
  const lines = [
    `🚢 ${ship.name}${ship.isTeslaCandidate ? " ⚡Tesla候補" : ""}`,
    `ステータス: ${ship.status} / ${ship.operationStatus}`,
    `コールサイン: ${ship.callSign}`,
    "",
    `【航路】 ${ship.previousPort || "—"} → 横浜 → ${ship.nextPort || "—"}`,
    `仕出港: ${ship.originPort || "—"}`,
    `仕向港: ${ship.destinationPort || "—"}`,
    "",
    `【船舶情報】`,
    `船種: ${ship.vesselType || "—"}`,
    `国籍: ${ship.nationality || "—"}`,
    `総トン数: ${ship.grossTonnage ? ship.grossTonnage.toLocaleString() + " t" : "—"}`,
    `全長: ${ship.length ? ship.length + " m" : "—"}`,
    `代理店: ${ship.agent || "—"}`,
    `バース: ${ship.berth || "—"}`,
    "",
    `【入出港情報】`,
    `入港予定: ${fmt(ship.scheduledArrival)}`,
    `離岸予定: ${fmt(ship.scheduledDeparture)}`,
    `着岸確定: ${fmt(ship.confirmedArrival)}`,
    `離岸確定: ${fmt(ship.confirmedDeparture)}`,
    `着岸実績: ${fmt(ship.actualArrival)}`,
    `離岸実績: ${fmt(ship.actualDeparture)}`,
  ];
  return lines.join("\n");
}

export function ShipDetailModal({ ship, onClose }: ShipDetailModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shipToText(ship));
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {
      // silently fail
    }
  }, [ship]);

  const handleCopyLink = useCallback(async () => {
    try {
      const id = ship.callSign || encodeURIComponent(ship.name);
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // silently fail
    }
  }, [ship]);

  const handleCopyImage = useCallback(async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, {
      backgroundColor: "#1c1c22",
      pixelRatio: 2,
    });
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      // Fallback: download as file
      const link = document.createElement("a");
      link.download = `${ship.name}.png`;
      link.href = dataUrl;
      link.click();
    }
  }, [ship]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={cardRef}
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
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyLink}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              title="リンクをコピー"
            >
              {copiedLink ? <Check className="size-4 text-green-500" /> : <Link className="size-4" />}
            </button>
            <button
              onClick={handleCopyText}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              title="テキストをコピー"
            >
              {copiedText ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
            </button>
            <button
              onClick={handleCopyImage}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
              title="画像をコピー"
            >
              {copiedImage ? <Check className="size-4 text-green-500" /> : <Image className="size-4" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>
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
