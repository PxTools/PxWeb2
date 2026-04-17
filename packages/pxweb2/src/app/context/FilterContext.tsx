import {
  ActionDispatch,
  createContext,
  ReactNode,
  useMemo,
  useReducer,
} from 'react';

import {
  ActionType,
  FilterType,
  ReducerActionTypes,
  StartPageState,
  Filter,
} from '../pages/StartPage/StartPageTypes';
import {
  getFilters,
  getTimeUnits,
  getVariables,
  updateSubjectTreeCounts,
  flattenSubjectTreeToList,
  getYearRanges,
  recomputeAvailableFilters,
  getStatus,
} from '../util/startPageFilters';
import {
  buildCompiledMatcher,
  shouldTableBeIncludedWithMatcher,
} from '../util/tableHandler';
import { wrapWithLocalizedQuotemarks } from '../util/utils';
import { Table } from 'packages/pxweb2-api-client/src';

const initialState: StartPageState = Object.freeze({
  availableTables: [],
  availableTablesWhenQueryApplied: [],
  filteredTables: [],
  availableFilters: getFilters([]),
  activeFilters: [],
  loading: false,
  error: '',
  originalSubjectTree: [],
  subjectOrderList: [],
  lastUsedYearRange: null,
});

export const FilterContext = createContext<{
  state: StartPageState;
  dispatch: ActionDispatch<[action: ReducerActionTypes]>;
}>({
  state: initialState,
  dispatch: () => null,
});

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({
  children,
}: FilterProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const memoizedState = useMemo(() => {
    return { state, dispatch };
  }, [state]);

  return (
    <FilterContext.Provider value={memoizedState}>
      {children}
    </FilterContext.Provider>
  );
};

// Returns the table set that should be used as the filter base.
// When a query is active, all non-query filters are applied on top of that subset.
function getAvailableTables(state: StartPageState): Table[] {
  if (state.availableTablesWhenQueryApplied?.length > 0) {
    return state.availableTablesWhenQueryApplied;
  } else {
    return state.availableTables;
  }
}

function reducer(
  state: StartPageState,
  action: ReducerActionTypes,
): StartPageState {
  switch (action.type) {
    case ActionType.RESET_FILTERS: {
      const fullRange = getYearRanges(action.payload.tables);
      const subjectOrder = flattenSubjectTreeToList(action.payload.subjects);
      return {
        ...initialState,
        availableTables: action.payload.tables,
        availableTablesWhenQueryApplied: [],
        filteredTables: action.payload.tables,
        originalSubjectTree: action.payload.subjects,
        subjectOrderList: subjectOrder,
        availableFilters: {
          subjectTree: updateSubjectTreeCounts(
            action.payload.subjects,
            action.payload.tables,
          ),
          timeUnits: getTimeUnits(action.payload.tables),
          yearRange: fullRange,
          variables: getVariables(action.payload.tables),
          status: getStatus(action.payload.tables),
        },
        lastUsedYearRange: fullRange,
      };
    }
    case ActionType.ADD_FILTER: {
      const incoming = action.payload;
      const incomingTypes = new Set(incoming.map((f) => f.type));
      // Year range behaves as a single-value filter, so old year range entries
      // are replaced when a new year range is added.
      const clearedFilters = state.activeFilters.filter((f) =>
        incoming[0]?.type === 'yearRange' ? f.type !== 'yearRange' : true,
      );
      const newFilters = [...clearedFilters, ...incoming];
      const matcher = buildCompiledMatcher(newFilters);
      const filteredTables = getAvailableTables(state).filter((table) =>
        shouldTableBeIncludedWithMatcher(table, matcher),
      );
      const addType = action.payload[0]?.type as FilterType | undefined;
      // lastUsedYearRange tracks the non-year constrained range and should only
      // be recalculated when yearRange itself was not the newly added filter.
      const updatedLastUsedYearRange = incomingTypes.has('yearRange')
        ? state.lastUsedYearRange
        : getYearRanges(filteredTables);

      const recomputed = recomputeAvailableFilters(
        addType,
        newFilters,
        getAvailableTables(state),
        state.originalSubjectTree,
      );

      return {
        ...state,
        activeFilters: newFilters,
        filteredTables,
        availableFilters: {
          subjectTree:
            recomputed.subjectTree ?? state.availableFilters.subjectTree,
          timeUnits: recomputed.timeUnits ?? state.availableFilters.timeUnits,
          yearRange: recomputed.yearRange ?? state.availableFilters.yearRange,
          variables: getVariables(filteredTables),
          status: recomputed.status ?? state.availableFilters.status,
        },
        lastUsedYearRange: updatedLastUsedYearRange,
      };
    }
    // Note: The ActionType ADD_SEARCH has been replaced by ADD_QUERY_FILTER.
    // In the same way the FilterType 'search' has been replaced by 'query'.
    // It is kept here for possible future use. One scenario could be that the API query fails,
    // then we can fall back to client-side search filtering.
    case ActionType.ADD_SEARCH_FILTER: {
      let newFilters: Filter[];

      const newSearch: Filter = {
        type: 'search',
        label: wrapWithLocalizedQuotemarks(
          action.payload.text,
          action.payload.language,
        ),
        value: action.payload.text,
        index: 1,
      };

      const existingSearch = state.activeFilters.findIndex(
        (filter) => filter.type == 'search',
      );

      // We remove the search filter if the string is empty (field cleared)
      // Otherwise, update if it already exists, or if not add it.
      // Ensures we only ever have one filter of type search
      if (action.payload.text == '') {
        newFilters = state.activeFilters.filter((filter) => {
          return filter.type != 'search';
        });
      } else {
        newFilters =
          existingSearch >= 0
            ? state.activeFilters.with(existingSearch, newSearch)
            : [...state.activeFilters, newSearch];
      }

      const matcher = buildCompiledMatcher(newFilters);
      const newTables = state.availableTables.filter((table) =>
        shouldTableBeIncludedWithMatcher(table, matcher),
      );

      return {
        ...state,
        activeFilters: newFilters,
        filteredTables: newTables,
        availableFilters: {
          subjectTree: updateSubjectTreeCounts(
            state.originalSubjectTree,
            newTables,
          ),
          timeUnits: getTimeUnits(newTables),
          yearRange: getYearRanges(newTables),
          variables: getVariables(newTables),
          status: getStatus(newTables),
        },
      };
    }
    case ActionType.ADD_QUERY_FILTER: {
      let newFilters: Filter[];

      const newQuery: Filter = {
        type: 'query',
        label: action.payload.query,
        value: action.payload.tableIds.join(','),
        index: 1,
      };

      const existingQuery = state.activeFilters.findIndex(
        (filter) => filter.type == 'query',
      );

      // We remove the query filter if the query is empty (field cleared)
      // Otherwise, update if it already exists, or if not add it.
      // Ensures we only ever have one filter of type query
      if (action.payload.query == '') {
        newFilters = state.activeFilters.filter((filter) => {
          return filter.type != 'query';
        });
      } else {
        newFilters =
          existingQuery >= 0
            ? state.activeFilters.with(existingQuery, newQuery)
            : [...state.activeFilters, newQuery];
      }

      let newTables: Table[] = [];
      let queryTables: Table[] = [];

      if (action.payload.query == '') {
        // No query: reset to full table set and apply remaining filters.
        const matcher = buildCompiledMatcher(newFilters);
        newTables = state.availableTables.filter((table) =>
          shouldTableBeIncludedWithMatcher(table, matcher),
        );
      } else {
        // Query present: first narrow to API-returned table IDs, then apply
        // all other active filters on that subset.
        queryTables = state.availableTables.filter((table) =>
          action.payload.tableIds.includes(table.id),
        );

        const matcher = buildCompiledMatcher(newFilters);
        newTables = queryTables.filter((table) =>
          shouldTableBeIncludedWithMatcher(table, matcher),
        );
      }

      return {
        ...state,
        availableTablesWhenQueryApplied: queryTables,
        activeFilters: newFilters,
        filteredTables: newTables,
        availableFilters: {
          subjectTree: updateSubjectTreeCounts(
            state.originalSubjectTree,
            newTables,
          ),
          timeUnits: getTimeUnits(newTables),
          yearRange: getYearRanges(newTables),
          variables: getVariables(newTables),
          status: getStatus(newTables),
        },
      };
    }
    // Single and batch remove actions share one implementation to keep removal
    // semantics consistent for UI events that clear one or many filters.
    case ActionType.REMOVE_FILTER:
      return applyRemoveFilters(state, [action.payload]);

    case ActionType.REMOVE_FILTERS:
      return applyRemoveFilters(state, action.payload);

    case ActionType.SET_ERROR:
      return { ...state, error: action.payload };

    case ActionType.SET_LOADING:
      return { ...state, loading: action.payload };

    default:
      return state;
  }
}

type RemovePayload = { value: string; type: FilterType; uniqueId?: string };

// Removes one or many filters and recomputes derived table/filter state.
// Subject filters can be removed by uniqueId to avoid collisions where multiple
// nodes share the same subject id value.
function applyRemoveFilters(
  state: StartPageState,
  removals: RemovePayload[],
): StartPageState {
  // Precise removal key for subject tree nodes.
  const removalSetByUniqueId = new Set(
    removals
      .filter((r) => r.type === 'subject' && r.uniqueId)
      .map((r) => r.uniqueId as string),
  );
  // Generic key for non-subject filters, and subject fallback by type+value.
  const removalSetByTypeValue = new Set(
    removals.map((r) => `${r.type}|${r.value}`),
  );

  const currentFilters = state.activeFilters.filter((f) => {
    if (f.type === 'subject' && f.uniqueId && removalSetByUniqueId.size > 0) {
      if (removalSetByUniqueId.has(f.uniqueId)) {
        return false;
      }
    }
    return !removalSetByTypeValue.has(`${f.type}|${f.value}`);
  });

  if (currentFilters.length === 0) {
    const fullRange = getYearRanges(state.availableTables);
    return {
      ...state,
      availableTablesWhenQueryApplied: [],
      activeFilters: [],
      filteredTables: state.availableTables,
      availableFilters: {
        subjectTree: updateSubjectTreeCounts(
          state.originalSubjectTree,
          state.availableTables,
        ),
        timeUnits: getTimeUnits(state.availableTables),
        yearRange: fullRange,
        variables: getVariables(state.availableTables),
        status: getStatus(state.availableTables),
      },
      lastUsedYearRange: fullRange,
    };
  }

  // If query was removed, filtering must resume from the full dataset.
  // Otherwise, keep the currently query-scoped base table set.
  const removedQuery = removals.some((r) => r.type === 'query');
  const baseTables = removedQuery
    ? state.availableTables
    : getAvailableTables(state);
  const matcher = buildCompiledMatcher(currentFilters);

  const filteredTables = baseTables.filter((table) =>
    shouldTableBeIncludedWithMatcher(table, matcher),
  );

  const yearRangeStillActive = currentFilters.some(
    (f) => f.type === 'yearRange',
  );
  // Preserve previously remembered range while a year filter is still active.
  const updatedLastUsedYearRange = yearRangeStillActive
    ? state.lastUsedYearRange
    : getYearRanges(filteredTables);

  const removedTypeHint = removals[0]?.type as FilterType | undefined;

  const recomputed = recomputeAvailableFilters(
    removedTypeHint,
    currentFilters,
    baseTables,
    state.originalSubjectTree,
  );

  return {
    ...state,
    availableTablesWhenQueryApplied: removedQuery
      ? []
      : state.availableTablesWhenQueryApplied,
    activeFilters: currentFilters,
    filteredTables,
    availableFilters: {
      subjectTree: recomputed.subjectTree ?? state.availableFilters.subjectTree,
      timeUnits: recomputed.timeUnits ?? state.availableFilters.timeUnits,
      yearRange: recomputed.yearRange ?? state.availableFilters.yearRange,
      variables: getVariables(filteredTables),
      status: recomputed.status ?? state.availableFilters.status,
    },
    lastUsedYearRange: updatedLastUsedYearRange,
  };
}
