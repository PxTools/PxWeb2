import { Navigate } from 'react-router';

import TableViewer from './pages/TableViewer/TableViewer';
import StartPage from './pages/StartPage/StartPage';
import ErrorPage from './components/ErrorPage/ErrorPage';
import TopicIcons from './pages/TopicIcons/TopicIcons';
import { getConfig } from './util/config/getConfig';
import { NotFound } from './pages/NotFound/NotFound';

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
          element: <NotFound type="table_not_found" />,
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
        path: '*',
        element: <NotFound type="unsupported_language" />,
      },
      {
        path: 'topicIcons',
        element: <TopicIcons />,
      },
    ],
  },
];
