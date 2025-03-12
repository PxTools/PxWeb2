import { AppProvider } from '../context/AppProvider';
import { AccessibilityProvider } from '../context/AccessibilityProvider';
import { VariablesProvider } from '../context/VariablesProvider';
import { TableDataProvider } from '../context/TableDataProvider';
import TableViewContent from './TableViewContent';

export function TableView() {
  return (
    <AppProvider>
      <AccessibilityProvider>
        <VariablesProvider>
          <TableDataProvider>
            <TableViewContent />
          </TableDataProvider>
        </VariablesProvider>
      </AccessibilityProvider>
    </AppProvider>
  );
}

export default TableView;
