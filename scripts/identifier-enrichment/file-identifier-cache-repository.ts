import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ShipIdentifierCacheFile } from "../../src/lib/types.ts";
import {
  DEFAULT_IDENTIFIER_CACHE,
  type IdentifierCacheRepository,
} from "./domain.ts";

interface FileIdentifierCacheRepositoryOptions {
  cachePath?: string;
}

export class FileIdentifierCacheRepository
  implements IdentifierCacheRepository
{
  private readonly cachePath: string;

  constructor(options: FileIdentifierCacheRepositoryOptions = {}) {
    this.cachePath =
      options.cachePath?.trim() ||
      process.env.IDENTIFIER_CACHE_PATH?.trim() ||
      resolve(import.meta.dirname!, "..", "..", "data", "identifier-cache.json");
  }

  exists(): boolean {
    return existsSync(this.cachePath);
  }

  load(): ShipIdentifierCacheFile {
    if (!this.exists()) {
      return { ...DEFAULT_IDENTIFIER_CACHE };
    }

    const raw = readFileSync(this.cachePath, "utf-8");
    const parsed = JSON.parse(raw) as Partial<ShipIdentifierCacheFile>;

    return {
      updatedAt:
        typeof parsed.updatedAt === "string" || parsed.updatedAt === null
          ? parsed.updatedAt
          : null,
      ships: Array.isArray(parsed.ships) ? parsed.ships : [],
    };
  }

  save(cache: ShipIdentifierCacheFile): void {
    writeFileSync(this.cachePath, `${JSON.stringify(cache, null, 2)}\n`, "utf-8");
  }
}
