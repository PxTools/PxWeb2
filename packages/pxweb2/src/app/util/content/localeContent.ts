import type { LocaleContent } from '../config/localeContentTypes';

// In-memory cache for previously fetched content per language
const cache = new Map<string, LocaleContent | null>();

// Tracks ongoing fetch requests per language.
const pendingRequests = new Map<string, Promise<LocaleContent | null>>();

export async function fetchLocaleContent(
  lang: string,
): Promise<LocaleContent | null> {
  const key = lang || 'en';

  if (cache.has(key)) {
    return cache.get(key)!;
  }

  const existing = pendingRequests.get(key);
  if (existing) {
    return existing;
  }

  // 3) Start fetch and memoize the in-flight promise
  const fetchPromise = (async () => {
    try {
      const res = await fetch(
        `./content/${key}/content.json?v=${__BUILD_VERSION__}`,
        {
          cache: 'no-store',
        },
      );
      if (!res.ok) {
        return null;
      }
      const data = (await res.json()) as LocaleContent;
      cache.set(key, data);
      return data;
    } catch {
      cache.set(key, null);
      return null;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, fetchPromise);
  return fetchPromise;
}
