import { Navigate } from 'react-router';

import TableViewer from './pages/TableViewer/TableViewer';
import StartPage from './pages/StartPage/StartPage';
import ErrorPage from './components/ErrorPage/ErrorPage';
import TopicIcons from './pages/TopicIcons/TopicIcons';
import { getConfig } from './util/config/getConfig';
import { NotFound } from './pages/NotFound/NotFound';

const config = getConfig();
const showDefaultLanguageInPath = config.language.showDefaultLanguageInPath;

const supportedLangRoutes = config.language.supportedLanguages.map((lang) => {
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
          element: <NotFound type="page_not_found" />,
        },
        {
          path: '*',
          element: <NotFound type="page_not_found" />,
        },
      ],
    };
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
        element: <NotFound type="page_not_found" />,
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
        element: <NotFound type="unsupported_language" />,
      },
    ],
  },
];
