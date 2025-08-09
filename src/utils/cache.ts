import type { User, Department, Project, Role, TravelRequest } from '../types';

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Supported cache data types
type CacheableData =
  | User[]
  | User
  | Department[]
  | Department
  | Project[]
  | Project
  | Role[]
  | Role
  | TravelRequest[]
  | TravelRequest
  | string
  | number
  | boolean
  | Record<string, string | number | boolean>;

// Professional API cache with strong typing
class ApiCache {
  private cache = new Map<string, CacheEntry<CacheableData>>();

  /**
   * Store data in cache with TTL
   */
  set<T extends CacheableData>(
    key: string,
    data: T,
    ttlMinutes: number = 5
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  /**
   * Retrieve data from cache if not expired
   */
  get<T extends CacheableData>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const apiCache = new ApiCache();
