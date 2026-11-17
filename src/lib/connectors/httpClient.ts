import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'data', 'api_cache.json');

interface CacheEntry<T = unknown> {
  data: T;
  fetchedAt: string;
  expiresAt: number;
}

type CacheStore = Record<string, CacheEntry>;

const memoryCache = new Map<string, CacheEntry>();
const hostLastRequestTime = new Map<string, number>();

const DEFAULT_HOST_MIN_INTERVAL_MS: Record<string, number> = {
  'brasilapi.com.br': 1100,
  'minhareceita.org': 1100,
  'servicodados.ibge.gov.br': 250,
};

let diskCacheLoaded = false;

function loadDiskCache(): CacheStore {
  try {
    if (!fs.existsSync(CACHE_FILE)) return {};
    const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
    return JSON.parse(raw) as CacheStore;
  } catch {
    return {};
  }
}

function ensureMemoryCacheLoaded() {
  if (diskCacheLoaded) return;
  diskCacheLoaded = true;
  const store = loadDiskCache();
  const now = Date.now();
  for (const [key, entry] of Object.entries(store)) {
    if (entry && entry.expiresAt > now) {
      memoryCache.set(key, entry);
    }
  }
}

function persistDiskCache() {
  try {
    const dir = path.dirname(CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const now = Date.now();
    const obj: CacheStore = {};
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt > now) {
        obj[key] = entry;
      }
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch {
    // Falha ao gravar cache em disco não deve quebrar a consulta
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForHostRateLimit(url: string): Promise<void> {
  let host = 'default';
  try {
    host = new URL(url).hostname;
  } catch {
    host = 'default';
  }
  const minInterval = DEFAULT_HOST_MIN_INTERVAL_MS[host] ?? 300;
  const lastTime = hostLastRequestTime.get(host) ?? 0;
  const elapsed = Date.now() - lastTime;
  if (elapsed < minInterval) {
    await sleep(minInterval - elapsed);
  }
  hostLastRequestTime.set(host, Date.now());
}

export interface FetchJsonResult<T> {
  ok: boolean;
  data?: T;
  status?: number;
  error?: string;
  fetchedAt: string;
  fromCache: boolean;
}

export async function fetchJsonWithRetryAndCache<T>(
  url: string,
  options?: {
    ttlMs?: number;
    maxRetries?: number;
    timeoutMs?: number;
    bypassCache?: boolean;
  }
): Promise<FetchJsonResult<T>> {
  const ttlMs = options?.ttlMs ?? 24 * 60 * 60 * 1000;
  const maxRetries = options?.maxRetries ?? 3;
  const timeoutMs = options?.timeoutMs ?? 10000;

  ensureMemoryCacheLoaded();

  if (!options?.bypassCache) {
    const cached = memoryCache.get(url);
    if (cached && cached.expiresAt > Date.now()) {
      return {
        ok: true,
        data: cached.data as T,
        status: 200,
        fetchedAt: cached.fetchedAt,
        fromCache: true,
      };
    }
  }

  let lastStatus: number | undefined;
  let lastError = 'Erro desconhecido ao consultar API';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    await waitForHostRateLimit(url);

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      }).finally(() => clearTimeout(timer));

      lastStatus = res.status;

      if (res.ok) {
        const data = (await res.json()) as T;
        const fetchedAt = new Date().toISOString();
        memoryCache.set(url, {
          data,
          fetchedAt,
          expiresAt: Date.now() + ttlMs,
        });
        persistDiskCache();
        return {
          ok: true,
          data,
          status: res.status,
          fetchedAt,
          fromCache: false,
        };
      }

      // 404/400 não faz sentido repetir
      if (res.status === 400 || res.status === 404) {
        return {
          ok: false,
          status: res.status,
          error: `HTTP ${res.status}`,
          fetchedAt: new Date().toISOString(),
          fromCache: false,
        };
      }

      lastError = `HTTP ${res.status}`;

      if (attempt < maxRetries && (res.status === 429 || res.status >= 500)) {
        const retryAfterHeader = res.headers.get('retry-after');
        const retryAfterSec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;
        const backoffMs = !Number.isNaN(retryAfterSec)
          ? retryAfterSec * 1000
          : 1000 * Math.pow(2, attempt - 1);
        await sleep(backoffMs);
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < maxRetries) {
        await sleep(1000 * Math.pow(2, attempt - 1));
      }
    }
  }

  return {
    ok: false,
    status: lastStatus,
    error: lastError,
    fetchedAt: new Date().toISOString(),
    fromCache: false,
  };
}

export function clearHttpCacheForTests(): void {
  memoryCache.clear();
  diskCacheLoaded = false;
}
