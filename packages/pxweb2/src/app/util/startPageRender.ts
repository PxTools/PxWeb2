import { type StartPageState } from '../pages/StartPage/StartPageTypes';

export function hasUrlParams(search: string): boolean {
  return new URLSearchParams(search).toString().length > 0;
}

// Determines whether the table list can be displayed.
// Ensures that tables are loaded, filters are applied (or not needed), and we are not in the middle of syncing filters from the URL.
export function tableListIsReadyToRender(
  state: StartPageState,
  hasUrlParams: boolean,
  hasEverHydrated: boolean,
): boolean {
  // Indicates whether filters have been applied either by user interaction, via URL parameters, or there are no filters to apply.
  // Prevents unnecessary loading state once filters are in sync.
  const hasHydratedFilters =
    state.activeFilters.length > 0 || !hasUrlParams || hasEverHydrated;

  // Determines if we're currently waiting for filters to be applied from the URL.
  // This is used to delay rendering until the URL-driven filter state is ready.
  const isHydratingFromUrl =
    hasUrlParams && state.availableTables.length > 0 && !hasHydratedFilters;

  return (
    !state.loading &&
    state.availableTables.length > 0 &&
    hasHydratedFilters &&
    !isHydratingFromUrl
  );
}
