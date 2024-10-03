import { defer, LoaderFunctionArgs } from 'react-router-dom';

import { Dataset, TableService } from '@pxweb2/pxweb2-api-client';
import { PxTable, PxTableMetadata } from '@pxweb2/pxweb2-ui';
import { mapJsonStat2Response } from '../../mappers/JsonStat2ResponseMapper';
import { mapTableMetadataResponse } from '../../mappers/TableMetadataResponseMapper';
import { mapTableSelectionResponse } from '../../mappers/TableSelectionResponseMapper';
import { getConfig } from '../util/config/getConfig';

// Loader function for fetching table data and metadata
export async function loader({ params }: LoaderFunctionArgs) {
  if (!params.tableId) {
    throw new Error('TableDataLoader: Expected tableId to be defined');
  }

  const tabId = params.tableId;
  const config = getConfig();

  if (!config) {
    throw new Error('TableDataLoader: Expected app config to be defined');
  }

  const hasLanguage =
    config.language.defaultLanguage && config.language.defaultLanguage !== '';
  const hasFallbackLanguage =
    config.language.fallbackLanguage && config.language.fallbackLanguage !== '';

  let lang = ''; // TODO: Get chosen language, needs language persistence to be implemented in the app

  if (!hasLanguage && hasFallbackLanguage) {
    lang = config.language.fallbackLanguage;
  }

  if (hasLanguage) {
    lang = config.language.defaultLanguage;
  }

  const tableMetaDataFromLoaderPromise = fetchTableMetaData(tabId, lang);
  const tableDefaultSelectionFromLoaderPromise = fetchTableDefaultSelection(
    tabId,
    lang
  );
  const tableDataFromLoaderPromise = fetchTableData(tabId, lang);

  // Check for errors
  if (!tableMetaDataFromLoaderPromise) {
    throw new Error(
      'TableDataLoader: Failed to load table metadata for table' + tabId
    );
  }
  if (!tableDefaultSelectionFromLoaderPromise) {
    throw new Error(
      'TableDataLoader: Failed to load table default selection for table' +
        tabId
    );
  }
  if (!tableDataFromLoaderPromise) {
    throw new Error(
      'TableDataLoader: Failed to load table data for table' + tabId
    );
  }

  // Wait for all promises to resolve
  return defer({
    tableMetaDataFromLoader: await tableMetaDataFromLoaderPromise,
    tableDefaultSelectionFromLoader:
      await tableDefaultSelectionFromLoaderPromise,
    tableDataFromLoader: await tableDataFromLoaderPromise,
  });
}

async function fetchTableData(tableId: string, lang: string) {
  const res = await TableService.getTableDataByPost(
    tableId,
    lang,
    'json-stat2'
  );

  // Map response to json-stat2 Dataset
  const pxDataobj: unknown = res;
  const pxTabData = pxDataobj as Dataset;
  const pxTable: PxTable = mapJsonStat2Response(pxTabData);

  return pxTable;
}

async function fetchTableMetaData(tableId: string, lang: string) {
  const metaData = TableService.getMetadataById(tableId, lang)
    .then((tableMetadataResponse) => {
      const pxTabMetadata: PxTableMetadata = mapTableMetadataResponse(
        tableMetadataResponse
      );

      return pxTabMetadata;
    })
    .catch((error) => {
      throw new Error('Error getting metadata: ' + tableId);
    });

  return metaData;
}

async function fetchTableDefaultSelection(tableId: string, lang: string) {
  const defaultSelection = TableService.getDefaultSelection(tableId, lang)
    .then((selectionResponse) => {
      const defaultSelection = mapTableSelectionResponse(
        selectionResponse
      ).filter(
        (variable) =>
          variable.values.length > 0 || variable.selectedCodeList !== undefined
      );

      return defaultSelection;
    })
    .catch((error) => {
      throw new Error('Error getting default selection: ' + tableId);
    });

  return defaultSelection;
}
