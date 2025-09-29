import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { fetchLocaleContent as fetchLocaleContentType } from './localeContent';

let fetchLocaleContent: typeof fetchLocaleContentType;

type FetchMock = ReturnType<typeof vi.fn>;

function mkResponse<T>(data: T) {
  return {
    ok: true,
    status: 200,
    json: async () => data,
  } as unknown as Response;
}

beforeEach(async () => {
  vi.resetModules();
  const mod = await import('./localeContent');
  fetchLocaleContent = mod.fetchLocaleContent;

  // Type-safe way to mock global fetch
  Object.defineProperty(globalThis, 'fetch', {
    value: vi.fn() as FetchMock,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('fetchLocaleContent', () => {
  it('caches results per language (same lang -> second call served from cache)', async () => {
    (globalThis.fetch as FetchMock).mockResolvedValueOnce(
      mkResponse({ title: 'Startside NO' }),
    );

    const a = await fetchLocaleContent('no');
    const b = await fetchLocaleContent('no');

    expect(a).toEqual({ title: 'Startside NO' });
    expect(b).toEqual({ title: 'Startside NO' });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('keeps separate caches per language (different lang -> separate fetches)', async () => {
    (globalThis.fetch as FetchMock)
      .mockResolvedValueOnce(mkResponse({ title: 'Startside NO' }))
      .mockResolvedValueOnce(mkResponse({ title: 'Homepage EN' }));

    const no1 = await fetchLocaleContent('no');
    const en1 = await fetchLocaleContent('en');

    expect(no1).toEqual({ title: 'Startside NO' });
    expect(en1).toEqual({ title: 'Homepage EN' });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    const no2 = await fetchLocaleContent('no');
    const en2 = await fetchLocaleContent('en');

    expect(no2).toEqual({ title: 'Startside NO' });
    expect(en2).toEqual({ title: 'Homepage EN' });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('deduplicates multiple simultaneous requests for the same language (ensures only one network fetch)', async () => {
    (globalThis.fetch as FetchMock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve(mkResponse({ title: 'Startside NO' })), 0),
        ),
    );

    const [a, b] = await Promise.all([
      fetchLocaleContent('no'),
      fetchLocaleContent('no'),
    ]);

    expect(a).toEqual({ title: 'Startside NO' });
    expect(b).toEqual({ title: 'Startside NO' });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});
