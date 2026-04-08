export type ShipStatus = "予定" | "決定" | "実績";

export type OperationStatus =
  | "航行中"
  | "係留中"
  | "離岸済"
  | "入港"
  | "移動";

export interface Ship {
  callSign: string;
  name: string;
  grossTonnage: number;
  length: number;
  status: ShipStatus;
  operationStatus: string;
  nationality: string;
  route: string;
  vesselType: string;
  agent: string;
  berth: string;
  berthCode: string;
  scheduledArrival: string | null;
  scheduledDeparture: string | null;
  confirmedArrival: string | null;
  confirmedDeparture: string | null;
  actualArrival: string | null;
  actualDeparture: string | null;
  previousPort: string;
  nextPort: string;
  originPort: string;
  destinationPort: string;
  isTeslaCandidate: boolean;
}

export interface ShipData {
  scrapedAt: string;
  source: string;
  ships: Ship[];
}

export interface KnownTeslaShip {
  name: string;
  callSign: string;
  notes: string;
}

export interface RoutePatterns {
  originPorts: string[];
  adjacentPorts: string[];
}

export interface KnownTeslaShipsData {
  ships: KnownTeslaShip[];
  routePatterns: RoutePatterns;
}
