declare module 'lru-cache' {
  interface Options<K, V> {
    max?: number;
    ttl?: number;
    maxSize?: number;
    sizeCalculation?: (value: V, key: K) => number;
    fetchMethod?: (key: K, staleValue: V, options: any) => Promise<V>;
    allowStale?: boolean;
    updateAgeOnGet?: boolean;
    updateAgeOnHas?: boolean;
    dispose?: (value: V, key: K) => void;
    noDisposeOnSet?: boolean;
    disposeAfter?: (value: V, key: K) => void;
    ttlResolution?: number;
    ttlAutopurge?: boolean;
    maxEntrySize?: number;
    maxAge?: number;  // Deprecated but still commonly used
    stale?: boolean;  // Deprecated but still commonly used
  }

  class LRUCache<K, V> {
    constructor(options?: number | Options<K, V>);
    set(key: K, value: V, options?: { ttl?: number }): boolean;
    get(key: K): V | undefined;
    peek(key: K): V | undefined;
    has(key: K): boolean;
    delete(key: K): boolean;
    clear(): void;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
    forEach(callbackFn: (value: V, key: K, cache: this) => void, thisArg?: any): void;
    size: number;
  }

  export default LRUCache;
}
