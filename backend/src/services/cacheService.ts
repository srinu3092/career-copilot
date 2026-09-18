import { LRUCache } from 'lru-cache';
import crypto from 'crypto';

interface CacheOptions {
  maxEntries?: number;
  ttlMs?: number;
}

class LLMCacheService {
  private cache: LRUCache<string, any>;
  private hits = 0;
  private misses = 0;

  constructor(options: CacheOptions = {}) {
    this.cache = new LRUCache({
      max: options.maxEntries || 200,
      ttl: options.ttlMs || 1000 * 60 * 60, // 1 hour default TTL
      allowStale: false,
    });
  }

  public hashKey(prefix: string, payload: unknown): string {
    const raw = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const hash = crypto.createHash('sha256').update(raw).digest('hex').substring(0, 16);
    return `${prefix}:${hash}`;
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key) as T | undefined;
    if (item !== undefined) {
      this.hits++;
      return item;
    }
    this.misses++;
    return null;
  }

  public set(key: string, value: unknown, ttlMs?: number): void {
    this.cache.set(key, value, { ttl: ttlMs });
  }

  public getStats() {
    return {
      size: this.cache.size,
      max: this.cache.max,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(2) : '0.00',
    };
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const llmCache = new LLMCacheService();
