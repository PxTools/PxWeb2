
import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Home } from './components/Pages/Home/Home';
import { TableView } from './components/Pages/TableView/TableView';
import { loader as tableLoader } from './routes/tableData';
import { VariablesProvider } from './context/VariablesProvider';
import { TableDataProvider } from './context/TableDataProvider';
import { RouterError } from './components/RouterError/RouterError';
import { ColorBackgroundDefault,Spinner } from '@pxweb2/pxweb2-ui';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <RouterError />,
  },
  {
    path: '/table/:tableId',
    element: <TableView />,
    loader: tableLoader,
    errorElement: <RouterError />,
  },
]);

export default function App() {
  return (
    <VariablesProvider>
      <TableDataProvider>
        <Suspense fallback={<Spinner />}>
          <RouterProvider router={router} />
        </Suspense>
      </TableDataProvider>
    </VariablesProvider>
  );
}
