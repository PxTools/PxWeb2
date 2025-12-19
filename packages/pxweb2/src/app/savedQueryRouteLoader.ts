import { redirect, type LoaderFunctionArgs } from 'react-router';
import {
  ApiError,
  OpenAPI,
  SavedQueriesService,
  type SavedQueryResponse,
} from '@pxweb2/pxweb2-api-client';
import { getConfig } from './util/config/getConfig';
import i18n from '../i18n/config';

export async function savedQueryRouteLoader({ params }: LoaderFunctionArgs) {
  const config = getConfig();
  const { sqId } = params as { sqId?: string };
  if (!sqId) {
    throw new Response('Missing saved query id', { status: 400 });
  }

  OpenAPI.BASE = config.apiUrl;

  try {
    const res = (await SavedQueriesService.getSaveQuery(
      sqId,
    )) as SavedQueryResponse;

    const lang = res.language || res.savedQuery.language;
    const defaultLang = config.language.defaultLanguage;
    const showDefaultLanguageInPath = config.language.showDefaultLanguageInPath;

    // TODO: Use GetLanguagePath util function?
    const path = showDefaultLanguageInPath
      ? `/${lang}/table/${res.savedQuery.tableId}`
      : lang === defaultLang
        ? `/table/${res.savedQuery.tableId}`
        : `/${lang}/table/${res.savedQuery.tableId}`;

    const search = `?${new URLSearchParams({ sq: sqId }).toString()}`;

    // Ensure i18next language matches the target route language
    if (lang && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }

    return redirect(`${path}${search}`);
  } catch (e: unknown) {
    const err = e as Partial<ApiError> & { status?: number };
    const status = err?.status ?? 500;
    const message =
      status === 404 ? 'Saved query not found' : 'Failed to load saved query';
    throw new Response(message, { status });
  }
}
