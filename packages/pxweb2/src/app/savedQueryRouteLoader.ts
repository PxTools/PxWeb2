import { redirect, type LoaderFunctionArgs } from 'react-router';
import {
  ApiError,
  OpenAPI,
  SavedQueriesService,
  type SavedQueryResponse,
} from '@pxweb2/pxweb2-api-client';
import { getConfig } from './util/config/getConfig';
import i18n from '../i18n/config';
import { getLanguagePath } from './util/language/getLanguagePath';

// Handles URL:s for saved queries containing only the saved query id and redirects to the proper table URL.
// Example: https://www.yourpxweb.com/sq/123456 -> https://www.yourpxweb.com/{lang}/table/{tableId}?sq=123456
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

    const path = getLanguagePath(
      `/table/${res.savedQuery.tableId}`,
      lang,
      config.language.supportedLanguages,
      config.language.defaultLanguage,
      config.language.showDefaultLanguageInPath,
      config.baseApplicationPath,
    );

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
