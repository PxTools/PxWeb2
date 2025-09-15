import { Navigate } from 'react-router';

import RootLayout from './components/RootLayout';
import { ErrorPageWithLocalization } from './pages/ErrorPage/ErrorPage';
import StartPage from './pages/StartPage/StartPage';
import TableViewer from './pages/TableViewer/TableViewer';
import TopicIcons from './pages/TopicIcons/TopicIcons';
import { getConfig } from './util/config/getConfig';

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
    return {};
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
  },
  {
    path: 'table/:tableId',
    element: <TableViewer />,
  },
  ...supportedLangRoutes,
];

export const routerConfig = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPageWithLocalization />,
    children: [
      ...(showDefaultLanguageInPath
        ? routingWithDefaultLanguageInURL
        : routingWithoutDefaultLanguageInURL),
      {
        path: 'topicIcons',
        element: <TopicIcons />,
      },
    ],
  },
];
