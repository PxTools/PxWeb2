import { Navigate } from 'react-router';

import RootLayout from './components/RootLayout';
import { ErrorPageWithLocalization } from './pages/ErrorPage/ErrorPage';
import StartPage from './pages/StartPage/StartPage';
import TableViewer from './pages/TableViewer/TableViewer';
import TopicIcons from './pages/TopicIcons/TopicIcons';
import { getConfig } from './util/config/getConfig';
import { savedQueryRouteLoader } from './savedQueryRouteLoader';
import { normalizeBaseApplicationPath } from './util/pathUtil';

const config = getConfig();
const showDefaultLanguageInPath = config.language.showDefaultLanguageInPath;
const langPositionInPath = config.language.positionInPath ?? 'after';
const basePath = normalizeBaseApplicationPath(config.baseApplicationPath);
const getLanguageBasePath = (lang: string) => {
  if (langPositionInPath === 'before') {
    // basePath already ends with '/'
    return `/${lang}${basePath}`;
  }
  return `${basePath}${lang}/`;
};
const defaultLanguagePath = getLanguageBasePath(
  config.language.defaultLanguage,
);
const routerRootPath = langPositionInPath === 'before' ? '/' : basePath;
const topicIconsRoutePath =
  routerRootPath === '/' ? `${basePath}topicIcons` : 'topicIcons';

const supportedLangRoutes = config.language.supportedLanguages.map((lang) => {
  // the normal error handling will show "page not found",
  //  when the default language is in the URL but shouldn't be,
  //  or when an unsupported language is in the URL
  if (
    !showDefaultLanguageInPath &&
    lang.shorthand === config.language.defaultLanguage
  ) {
    return {
      path: basePath,
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
    path: getLanguageBasePath(lang.shorthand),
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
    path: routerRootPath,
    element: <RootLayout />,
    errorElement: <ErrorPageWithLocalization />,
    children: [
      ...(showDefaultLanguageInPath
        ? [
            // Redirect from the router root to the default language path
            {
              index: true,
              element: <Navigate to={defaultLanguagePath} replace />,
            },
            // When language comes before basePath, also redirect from basePath (no language)
            ...(langPositionInPath === 'before'
              ? [
                  {
                    path: basePath,
                    children: [
                      {
                        index: true,
                        element: <Navigate to={defaultLanguagePath} replace />,
                      },
                    ],
                  },
                ]
              : []),
          ]
        : []),
      ...supportedLangRoutes,
      {
        path: topicIconsRoutePath,
        element: <TopicIcons />,
      },
      {
        path: `${basePath}sq/:sqId`,
        loader: savedQueryRouteLoader,
        // Provide a minimal element to avoid React Router warning for leaf routes
        element: <div>Redirecting…</div>,
        HydrateFallback: () => <div />,
      },
    ],
  },
];
