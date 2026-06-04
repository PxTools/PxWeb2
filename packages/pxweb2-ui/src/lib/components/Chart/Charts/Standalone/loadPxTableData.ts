//This file is the shared data-loading utility for standalone chart components.
//It centralizes all non-UI work needed to get chart-ready data from a table URL.
import {
  OpenAPI,
  OutputFormatType,
  TablesService,
  type ApiError,
  type Dataset,
} from '@pxweb2/pxweb2-api-client';

import { parseTableDataUrl } from './parseTableDataUrl';
import { mapJsonStat2DatasetToPxTable } from './mapJsonStat2DatasetToPxTable';
import type { PxTable } from '../../../../shared-types/pxTable';

export interface LoadPxTableDataOptions {
  readonly dataUrl: string;
  readonly strictBaseMatch?: boolean;
}

export function getBaseOrigin(): string {
  if (!OpenAPI.BASE) {
    return '';
  }

  try {
    const fallbackOrigin =
      globalThis.window?.location.origin ?? 'http://localhost';
    return new URL(OpenAPI.BASE, fallbackOrigin).origin;
  } catch {
    return '';
  }
}

export function getLoadPxTableDataErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  ) {
    const apiError = error as ApiError;
    return `Request failed (${apiError.status}): ${apiError.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error while loading chart data.';
}

export async function loadPxTableData({
  dataUrl,
  strictBaseMatch = true,
}: LoadPxTableDataOptions): Promise<PxTable> {
  const parsedUrl = parseTableDataUrl(dataUrl);

  const baseOrigin = getBaseOrigin();
  if (!baseOrigin) {
    throw new Error(
      'OpenAPI.BASE is not configured. Configure OpenAPI.BASE before rendering StandaloneLineChart.',
    );
  }

  if (strictBaseMatch && parsedUrl.origin !== baseOrigin) {
    throw new Error(
      `dataUrl origin (${parsedUrl.origin}) does not match OpenAPI.BASE origin (${baseOrigin}).`,
    );
  }

  const response = await TablesService.getTableData(
    parsedUrl.tableId,
    parsedUrl.lang,
    parsedUrl.valuecodes,
    parsedUrl.codelist,
    OutputFormatType.JSON_STAT2,
    parsedUrl.outputFormatParams,
    parsedUrl.heading?.length ? parsedUrl.heading : undefined,
    parsedUrl.stub?.length ? parsedUrl.stub : undefined,
  );

  const dataset = response as unknown as Dataset;
  return mapJsonStat2DatasetToPxTable(dataset);
}
