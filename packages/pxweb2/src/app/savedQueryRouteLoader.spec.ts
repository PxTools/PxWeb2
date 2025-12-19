import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LoaderFunctionArgs } from 'react-router';

import { savedQueryRouteLoader } from './savedQueryRouteLoader';
import { getConfig } from './util/config/getConfig';
import i18n from '../i18n/config';
import { OpenAPI, SavedQueriesService, type SavedQueryResponse } from '@pxweb2/pxweb2-api-client';
import type { Config as AppConfig } from './util/config/configType';

const makeArgs = (sqId?: string): LoaderFunctionArgs => ({
  params: sqId ? { sqId } : {},
  request: new Request('http://localhost'),
  context: undefined,
  unstable_pattern: '',
});

vi.mock('./util/config/getConfig', () => ({
  getConfig: vi.fn(),
}));

vi.mock('@pxweb2/pxweb2-api-client', () => ({
  OpenAPI: { BASE: '' },
  SavedQueriesService: { getSaveQuery: vi.fn() },
}));

vi.mock('../i18n/config', () => ({
  default: { language: 'en', changeLanguage: vi.fn() },
}));

describe('savedQueryRouteLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    OpenAPI.BASE = '';
  });

  it('throws 400 when sqId is missing', async () => {
    vi.mocked(getConfig).mockReturnValue({
      apiUrl: 'https://api.example',
      language: { defaultLanguage: 'en', showDefaultLanguageInPath: true },
    } as unknown as AppConfig);

    await expect(savedQueryRouteLoader(makeArgs())).rejects.toMatchObject({ status: 400 });
  });

  it('redirects to /{lang}/table when showDefaultLanguageInPath=true', async () => {
    vi.mocked(getConfig).mockReturnValue({
      apiUrl: 'https://api.example',
      language: { defaultLanguage: 'en', showDefaultLanguageInPath: true },
    } as unknown as AppConfig);
    vi.mocked(SavedQueriesService.getSaveQuery).mockResolvedValue({
      language: 'en',
      id: '123',
      savedQuery: { tableId: 'T1', language: 'en', selection: { selection: [] } },
      links: [],
    } as SavedQueryResponse);
    (i18n as unknown as { language: string }).language = 'sv';

    const res = await savedQueryRouteLoader(makeArgs('123'));
    expect(res).toBeInstanceOf(Response);
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('/en/table/T1?sq=123');
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en');
    expect(OpenAPI.BASE).toBe('https://api.example');
  });

  it('redirects to /table when lang is default and showDefaultLanguageInPath=false', async () => {
    vi.mocked(getConfig).mockReturnValue({
      apiUrl: 'https://api.example',
      language: { defaultLanguage: 'en', showDefaultLanguageInPath: false },
    } as unknown as AppConfig);
    vi.mocked(SavedQueriesService.getSaveQuery).mockResolvedValue({
      language: 'en',
      id: 'ABC',
      savedQuery: { tableId: 'T2', language: 'en', selection: { selection: [] } },
      links: [],
    } as SavedQueryResponse);
    (i18n as unknown as { language: string }).language = 'en';

    const res = await savedQueryRouteLoader(makeArgs('ABC'));
    expect(res.headers.get('Location')).toBe('/table/T2?sq=ABC');
    expect(i18n.changeLanguage).not.toHaveBeenCalled();
  });

  it('redirects to /{lang}/table when lang is non-default and showDefaultLanguageInPath=false', async () => {
    vi.mocked(getConfig).mockReturnValue({
      apiUrl: 'https://api.example',
      language: { defaultLanguage: 'en', showDefaultLanguageInPath: false },
    } as unknown as AppConfig);
    vi.mocked(SavedQueriesService.getSaveQuery).mockResolvedValue({
      language: 'sv',
      id: '999',
      savedQuery: { tableId: 'T3', language: 'sv', selection: { selection: [] } },
      links: [],
    } as SavedQueryResponse);

    const res = await savedQueryRouteLoader(makeArgs('999'));
    expect(res.headers.get('Location')).toBe('/sv/table/T3?sq=999');
  });

  it('throws 404 with not found message when API returns 404', async () => {
    vi.mocked(getConfig).mockReturnValue({
      apiUrl: 'https://api.example',
      language: { defaultLanguage: 'en', showDefaultLanguageInPath: true },
    } as unknown as AppConfig);
    vi.mocked(SavedQueriesService.getSaveQuery).mockRejectedValue({ status: 404 });

    await expect(
      savedQueryRouteLoader(makeArgs('missing')),
    ).rejects.toMatchObject({ status: 404 });

    await savedQueryRouteLoader(makeArgs('missing')).catch(
      (err: unknown) => {
        expect(err).toBeInstanceOf(Response);
        const response = err as Response;
        expect(response.status).toBe(404);
        return response.text().then((text: string) => {
          expect(text).toContain('Saved query not found');
        });
      },
    );
  });

  it('throws 500 with generic message for non-404 errors', async () => {
    vi.mocked(getConfig).mockReturnValue({
      apiUrl: 'https://api.example',
      language: { defaultLanguage: 'en', showDefaultLanguageInPath: true },
    } as unknown as AppConfig);
    vi.mocked(SavedQueriesService.getSaveQuery).mockRejectedValue(new Error('boom'));

    await expect(
      savedQueryRouteLoader(makeArgs('err')),
    ).rejects.toMatchObject({ status: 500 });

    await savedQueryRouteLoader(makeArgs('err')).catch(
      (err: unknown) => {
        expect(err).toBeInstanceOf(Response);
        const response = err as Response;
        expect(response.status).toBe(500);
        return response.text().then((text: string) => {
          expect(text).toContain('Failed to load saved query');
        });
      },
    );
  });
});
