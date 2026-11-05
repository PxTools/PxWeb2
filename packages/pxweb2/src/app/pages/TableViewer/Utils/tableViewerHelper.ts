import { DataViewModeType } from '../../../context/DataViewModeType';

export type ViewMode = 'table' | 'linechart' | 'barchart' | 'horizontalbarchart';

export function getViewMode(
  searchParams: URLSearchParams,
  chartEnabled: boolean,
): ViewMode {
  if (!chartEnabled) {
    return 'table';
  }

  const view = searchParams.get('view');
  if (view === 'linechart' || view === 'barchart' || view === 'horizontalbarchart') {
    return view;
  }
  return 'table';
}

export function getSearchParamsWithViewMode(
  searchParams: URLSearchParams,
  viewMode: ViewMode,
): URLSearchParams {
  const nextSearchParams = new URLSearchParams(searchParams);
  nextSearchParams.set('view', viewMode);
  return nextSearchParams;
}

export function getDataViewMode(
  viewMode: ViewMode,
  isMobile: boolean,
): DataViewModeType {
  if (viewMode === 'linechart' || viewMode === 'barchart' || viewMode === 'horizontalbarchart') {
    return DataViewModeType.Chart;
  }

  return isMobile
    ? DataViewModeType.MobileTable
    : DataViewModeType.DesktopTable;
}
