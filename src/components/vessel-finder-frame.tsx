import { ExternalLink, MapPinned } from "lucide-react";
import type { Ship } from "@/lib/types";

const VESSELFINDER_ROOT_URL = "https://www.vesselfinder.com/";
const VESSELFINDER_AISMAP_URL = "https://www.vesselfinder.com/aismap";

function buildQuery(ship: Ship) {
  const params = new URLSearchParams({
    height: "400",
    names: "true",
    track: "true",
  });

  if (ship.imo) params.set("imo", ship.imo);
  if (ship.mmsi) params.set("mmsi", ship.mmsi);

  return params;
}

function buildExternalUrl(ship: Ship): string {
  if (!ship.imo && !ship.mmsi) return VESSELFINDER_ROOT_URL;
  return `${VESSELFINDER_AISMAP_URL}?${buildQuery(ship).toString()}`;
}

function getIdentifiers(ship: Ship): string | null {
  const parts = [ship.imo ? `IMO ${ship.imo}` : null, ship.mmsi ? `MMSI ${ship.mmsi}` : null]
    .filter((value): value is string => Boolean(value));

  return parts.length ? parts.join(" / ") : null;
}

interface VesselFinderFrameProps {
  ship: Ship;
}

export function VesselFinderFrame({ ship }: VesselFinderFrameProps) {
  const externalUrl = buildExternalUrl(ship);
  const identifiers = getIdentifiers(ship);
  const hasIdentifier = Boolean(ship.imo || ship.mmsi);

  return (
    <section className="space-y-3 border-b px-4 py-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        現在位置
      </h3>

      <div className="overflow-hidden rounded-lg border border-border/60 bg-background">
        {hasIdentifier ? (
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 px-6 py-6 text-center">
            <MapPinned className="size-8 text-muted-foreground" />
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              VesselFinderで現在位置を開く
              <ExternalLink className="size-4" />
            </a>
          </div>
        ) : (
          <div className="flex min-h-32 flex-col items-center justify-center gap-3 px-6 py-6 text-center">
            <MapPinned className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              IMO / MMSI が未登録のため、位置情報リンクを表示できません
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        {identifiers && <p>識別子: {identifiers}</p>}
        <p>
          AIS 情報は遅延・欠落・誤差を含む可能性があります。航行判断・安全判断には使用できません。
        </p>
      </div>
    </section>
  );
}
