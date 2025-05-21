import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';

import './i18n/config';
import TableViewer from './app/pages/TableViewer/TableViewer';
import { validateConfig } from './app/util/validate';
import { AppProvider } from './app/context/AppProvider';
import StartPage from './app/pages/StartPage/StartPage';
import ErrorPage from './app/components/ErrorPage/ErrorPage';
import TopicIcons from './app/pages/TopicIcons/TopicIcons';
import { getConfig } from './app/util/config/getConfig';

const config = getConfig();
const showDefaultLanguageInPath = config.language.showDefaultLanguageInPath;

const supportedLangRoutes = config.language.supportedLanguages
  .map((lang) => {
    if (
      !showDefaultLanguageInPath &&
      lang.shorthand === config.language.defaultLanguage
    ) {
      return undefined;
    }

    return {
      path: `/${lang.shorthand}/`,
      children: [
        {
          index: true,
          element: <StartPage />,
          errorElement: <ErrorPage />,
        },
        {
          path: 'table/:tableId',
          element: <TableViewer />,
          errorElement: <ErrorPage />,
        },
        {
          path: '*',
          element: <div>404 table not found</div>,
        },
      ],
    };
  })
  .filter((route) => {
    return route !== undefined;
  });

const routingWithDefaultLanguageInURL = [
  {
    index: true,
    element: (
      <Navigate to={`/${config.language.defaultLanguage}/`} replace={true} />
    ),
  },
  ...supportedLangRoutes,
];
const routingWithoutDefaultLanguageInURL = [
  {
    index: true,
    element: <StartPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: 'table/:tableId',
    element: <TableViewer />,
    errorElement: <ErrorPage />,
  },
  ...supportedLangRoutes,
];

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <ErrorPage />,
    children: [
      ...(showDefaultLanguageInPath
        ? routingWithDefaultLanguageInURL
        : routingWithoutDefaultLanguageInURL),
      {
        path: '*',
        element: <div>404 Not found root. Unsupported language</div>,
      },
      {
        path: 'topicIcons',
        element: <TopicIcons />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

if (location.href.includes('localhost')) {
  validateConfig();
}

/**
 * TODO:
 * The routing works as expected when default language is in the URL
 * - changes correctly to new, supported language DONE
 * - shows language not supported when language part in URL does not match a supported language DONE
 * - REDIRECT to default language when no language in url, does not work
 *
 * The routing works as expected when default language is not in the URL
 * - correctly shows default language when it is NOT in the URL DONE
 * - correctly shows new, supported language when it is in the URL DONE
 * - shows language not supported when no language part in URL, or language part in URL does not match a supported language DONE
 */
console.log('router', router);

root.render(
  <StrictMode>
    <AppProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProvider>
  </StrictMode>,
);
