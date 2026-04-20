import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tpf-favorites";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => read());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
    } catch {
      // ignore storage errors
    }
  }, [favorites]);

  const toggle = useCallback((key: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const has = useCallback(
    (key: string) => favorites.has(key),
    [favorites],
  );

  return { favorites, toggle, has };
}

export function favoriteKey(ship: { callSign: string; name: string }): string {
  return ship.callSign || ship.name;
}
