// This file defines a reusable React hook that handles standalone chart data fetching state.
// In short: this file is the shared “fetch + reload + error/loading state” hook so each standalone chart component can focus on rendering only.
import { useEffect, useState } from 'react';

import type { PxTable } from '../../../../shared-types/pxTable';
import {
  getLoadPxTableDataErrorMessage,
  loadPxTableData,
} from './loadPxTableData';

export interface UseStandalonePxTableDataOptions {
  readonly dataUrl: string;
  readonly strictBaseMatch?: boolean;
  readonly reloadEventName?: string;
}

export interface UseStandalonePxTableDataResult {
  readonly pxTable: PxTable | null;
  readonly error: string | null;
  readonly isLoading: boolean;
}

export function useStandalonePxTableData({
  dataUrl,
  strictBaseMatch = true,
  reloadEventName,
}: UseStandalonePxTableDataOptions): UseStandalonePxTableDataResult {
  const [pxTable, setPxTable] = useState<PxTable | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    if (!globalThis.window || !reloadEventName) {
      return;
    }

    const handleReloadRequested = () => {
      setReloadVersion((version) => version + 1);
    };

    globalThis.window.addEventListener(reloadEventName, handleReloadRequested);

    return () => {
      globalThis.window.removeEventListener(
        reloadEventName,
        handleReloadRequested,
      );
    };
  }, [reloadEventName]);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const mappedPxTable = await loadPxTableData({
          dataUrl,
          strictBaseMatch,
        });

        if (!isCancelled) {
          setPxTable(mappedPxTable);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setPxTable(null);
          setError(getLoadPxTableDataErrorMessage(loadError));
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [dataUrl, strictBaseMatch, reloadVersion]);

  return {
    pxTable,
    error,
    isLoading,
  };
}
