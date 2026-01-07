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
const basePath = normalizeBaseApplicationPath(config.baseApplicationPath);

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
    path: `${basePath}${lang.shorthand}/`,
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
    path: basePath,
    element: <RootLayout />,
    errorElement: <ErrorPageWithLocalization />,
    children: [
      ...(showDefaultLanguageInPath
        ? [
            {
              index: true,
              element: (
                <Navigate
                  to={`${basePath}${config.language.defaultLanguage}/`}
                  replace
                />
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
        loader: savedQueryRouteLoader,
      },
    ],
  },
];
