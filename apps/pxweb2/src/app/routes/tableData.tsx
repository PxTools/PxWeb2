import { LoaderFunctionArgs } from 'react-router-dom';

export async function loader({ params }: LoaderFunctionArgs) {


  // Load the inital table data
  if (!params.tableId) {
    throw new Error('TableDataLoader: Expected tableId to be defined');
  }

  const tabId = params.tableId;

  // Fetch
  const tableMetaDataFromLoader = await fetchTableMetaData(tabId);
  const tableDefaultSelectionFromLoader = await fetchTableDefaultSelection(tabId);
  const tableDataFromLoader = await fetchTableData(tabId);

  // Check for errors
  if (!tableMetaDataFromLoader) {
    throw new Error(
      'TableDataLoader: Failed to load table metadata for table' + tabId
    );
  }
  if (!tableDefaultSelectionFromLoader) {
    throw new Error('TableDataLoader: Failed to load table default selection for table' + tabId);
  }
  if (!tableDataFromLoader) {
    throw new Error('TableDataLoader: Failed to load table data for table' + tabId);
  }

  return { tableMetaDataFromLoader, tableDefaultSelectionFromLoader, tableDataFromLoader };
}

async function fetchTableData(tableId: string) {
  // TODO: Fetch table data from API

  return "Hello from fetchTableData inside tableData loader";
}

async function fetchTableMetaData(tableId: string) {
  // TODO: Fetch table metadata from API

  return "Hello from fetchTableMetaData inside tableMetaData loader";
}

async function fetchTableDefaultSelection(tableId: string) {
  // TODO: Fetch table default selection values from API

  return (
    "Hello from fetchTableDefaultSelection inside tableMetaData loader"
  );
}
