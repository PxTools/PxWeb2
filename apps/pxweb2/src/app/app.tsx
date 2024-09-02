import { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Home } from './components/Pages/Home/Home';
import { TableView } from './components/Pages/TableView/TableView';
import { loader as tableLoader } from './routes/tableData';
import { VariablesProvider } from './context/VariablesProvider';
import { TableDataProvider } from './context/TableDataProvider';


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <div>Error: 404</div>,
  },
  {
    path: '/table/:tableId',
    element: <TableView />,
    loader: tableLoader,
    errorElement: <div>Could not find table: 404</div>,
  },
]);

export default function App() {
  return (
    <VariablesProvider>
      <TableDataProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </TableDataProvider>
    </VariablesProvider>
  );
}
