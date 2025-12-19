import { Navigate, redirect, type LoaderFunctionArgs } from 'react-router';

import RootLayout from './components/RootLayout';
import { ErrorPageWithLocalization } from './pages/ErrorPage/ErrorPage';
import StartPage from './pages/StartPage/StartPage';
import TableViewer from './pages/TableViewer/TableViewer';
import TopicIcons from './pages/TopicIcons/TopicIcons';
import { getConfig } from './util/config/getConfig';
import {
  ApiError,
  OpenAPI,
  SavedQueriesService,
  type SavedQueryResponse,
} from '@pxweb2/pxweb2-api-client';
import i18n from '../i18n/config';

const config = getConfig();
const showDefaultLanguageInPath = config.language.showDefaultLanguageInPath;

const supportedLangRoutes = config.language.supportedLanguages.map((lang) => {
  // the normal error handling will show "page not found",
  //  when the default language is in the URL but shouldn't be,
  //  or when an unsupported language is in the URL
  if (
    !showDefaultLanguageInPath &&
    lang.shorthand === config.language.defaultLanguage
  ) {
    return {
      path: `/`,
      children: [
        {
          index: true,
          element: <StartPage />,
        },
        {
          path: 'table/:tableId',
          element: <TableViewer />,
        },
      ],
    };
  }

  // If the default language should be shown in the path
  return {
    path: `/${lang.shorthand}/`,
    children: [
      {
        index: true,
        element: <StartPage />,
      },
      {
        path: 'table/:tableId',
        element: <TableViewer />,
      },
    ],
  };
});

export const routerConfig = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPageWithLocalization />,
    children: [
      ...(showDefaultLanguageInPath
        ? [
            {
              index: true,
              element: (
                <Navigate to={`/${config.language.defaultLanguage}/`} replace />
              ),
            },
          ]
        : []),
      ...supportedLangRoutes,
      {
        path: 'topicIcons',
        element: <TopicIcons />,
      },
      {
        path: 'sq/:sqId',
        //element: <SavedQueryReroute />,
        loader: async ({ params }: LoaderFunctionArgs) => {
          const { sqId } = params as { sqId?: string };
          if (!sqId) {
            throw new Response('Missing saved query id', { status: 400 });
          }

          // Ensure API base is set for server-side/data-router calls
          OpenAPI.BASE = config.apiUrl;

          try {
            const res = (await SavedQueriesService.getSaveQuery(
              sqId,
            )) as SavedQueryResponse;

            const lang = res.language || res.savedQuery.language;
            const defaultLang = config.language.defaultLanguage;
            const showDefaultLanguageInPath =
              config.language.showDefaultLanguageInPath;

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
            // Map API errors to router errors to trigger ErrorPage
            const err = e as Partial<ApiError> & { status?: number };
            const status = err?.status ?? 500;
            const message =
              status === 404
                ? 'Saved query not found'
                : 'Failed to load saved query';
            throw new Response(message, { status });
          }
        },
      },
    ],
  },
];
