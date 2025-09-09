import { Navigate } from 'react-router';

import RootLayout from './components/RootLayout';
import ErrorPage from './pages/ErrorPage/ErrorPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import StartPage from './pages/StartPage/StartPage';
import TableViewer from './pages/TableViewer/TableViewer';
import TopicIcons from './pages/TopicIcons/TopicIcons';
import { getConfig } from './util/config/getConfig';

const config = getConfig();
const showDefaultLanguageInPath = config.language.showDefaultLanguageInPath;

const supportedLangRoutes = config.language.supportedLanguages.map((lang) => {
  // If the default language should not be shown in the path
  if (
    !showDefaultLanguageInPath &&
    lang.shorthand === config.language.defaultLanguage
  ) {
    return {
      // Show "page not found" when default language is in URL but shouldn't be
      path: `/${lang.shorthand}/`,
      children: [
        {
          index: true,
          element: <NotFoundPage />,
        },
        {
          path: '*',
          element: <NotFoundPage />,
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
        errorElement: <ErrorPage />,
      },
      {
        path: 'table/:tableId',
        element: <TableViewer />,
        errorElement: <ErrorPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  };
});

const routingWithDefaultLanguageInURL = [
  {
    index: true,
    element: <Navigate to={`/${config.language.defaultLanguage}/`} replace />,
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

export const routerConfig = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      ...(showDefaultLanguageInPath
        ? routingWithDefaultLanguageInURL
        : routingWithoutDefaultLanguageInURL),
      {
        path: 'topicIcons',
        element: <TopicIcons />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];
