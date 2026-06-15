export type ViewMode = 'table' | 'linechart';

export function getViewMode(
  searchParams: URLSearchParams,
  chartEnabled: boolean,
): ViewMode {
  if (!chartEnabled) {
    return 'table';
  }

  return searchParams.get('view') === 'linechart' ? 'linechart' : 'table';
}

export function getSearchParamsWithViewMode(
  searchParams: URLSearchParams,
  viewMode: ViewMode,
): URLSearchParams {
  const nextSearchParams = new URLSearchParams(searchParams);
  nextSearchParams.set('view', viewMode);
  return nextSearchParams;
}
