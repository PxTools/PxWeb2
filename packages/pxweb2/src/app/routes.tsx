import { Navigate } from 'react-router';

import RootLayout from './components/RootLayout';
import ErrorPage from './pages/ErrorPage/ErrorPage';
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
    return {
      // Show "page not found" when default language is in URL but shouldn't be
      // path: `/${lang.shorthand}/`,
      // children: [
      //   {
      //     index: true,
      //     //element: <NotFoundPage />,
      //     element: <div />, // Should never render, since loader throws 404 instantly
      //     loader: () => {
      //       throw new Response('Not Found', { status: 404 });
      //     },
      //   },
      // {
      //   path: '*',
      //   element: <NotFoundPage />,
      // },
      // ],
    };
  }

  // If the default language should be shown in the path
  return {
    path: `/${lang.shorthand}/`,
    children: [
      {
        index: true,
        element: <StartPage />,
        //errorElement: <ErrorPage />,
      },
      {
        path: 'table/:tableId',
        element: <TableViewer />,
        // errorElement: <ErrorPageTableViewer />,
      },
      // {
      //   path: '*',
      //   element: <NotFoundPage />,
      // },
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
    //errorElement: <ErrorPage />,
  },
  {
    path: 'table/:tableId',
    element: <TableViewer />,
    // errorElement: <ErrorPageTableViewer />,
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
      // {
      //   path: '*',
      //   element: <NotFoundPage />,
      // },
    ],
  },
];
