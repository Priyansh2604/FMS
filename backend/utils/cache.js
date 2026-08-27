class MemoryCache {
  constructor() {
    this._store = new Map();
  }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key, value, ttlMs) {
    this._store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  has(key) {
    return this.get(key) !== undefined;
  }

  invalidate(key) {
    this._store.delete(key);
  }

  invalidatePrefix(prefix) {
    for (const key of this._store.keys()) {
      if (key.startsWith(prefix)) this._store.delete(key);
    }
  }

  clear() {
    this._store.clear();
  }
}

const QUOTE_TTL = 20 * 1000;
const INDEX_TTL = 20 * 1000;
const HISTORY_TTL = 10 * 60 * 1000;
const SEARCH_TTL = 5 * 60 * 1000;

const cache = new MemoryCache();

module.exports = { MemoryCache, cache, QUOTE_TTL, INDEX_TTL, HISTORY_TTL, SEARCH_TTL };
