import { CacheEntry } from "./types";

const cache = new Map<string, CacheEntry<unknown>>();

const TTL = {
  mankier: 60 * 60 * 1000, // 1 hour
  cheatsh: 30 * 60 * 1000, // 30 minutes
  tldr: 30 * 60 * 1000,    // 30 minutes
};

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > getTTL(key)) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function getTTL(key: string): number {
  if (key.startsWith("mankier:")) return TTL.mankier;
  if (key.startsWith("cheatsh:")) return TTL.cheatsh;
  if (key.startsWith("tldr:")) return TTL.tldr;
  return TTL.mankier;
}
