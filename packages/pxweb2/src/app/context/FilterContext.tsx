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
import { shouldTableBeIncluded } from '../util/tableHandler';
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
      const clearedFilters = state.activeFilters.filter((f) =>
        incoming[0]?.type === 'yearRange' ? f.type !== 'yearRange' : true,
      );
      const newFilters = [...clearedFilters, ...incoming];
      const filteredTables = getAvailableTables(state).filter((table) =>
        shouldTableBeIncluded(table, newFilters),
      );
      const addType = action.payload[0]?.type as FilterType | undefined;
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

      const newTables = state.availableTables.filter((table) =>
        shouldTableBeIncluded(table, newFilters),
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
        // No query => filter from all available tables
        newTables = state.availableTables.filter((table) =>
          shouldTableBeIncluded(table, newFilters),
        );
      } else {
        // query present => filter from tables matching the query
        queryTables = state.availableTables.filter((table) =>
          action.payload.tableIds.includes(table.id),
        );

        newTables = queryTables.filter((table) =>
          shouldTableBeIncluded(table, newFilters),
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
    case ActionType.REMOVE_FILTER: {
      const removedType = action.payload.type;

      const currentFilters =
        removedType === 'subject' && action.payload.uniqueId
          ? state.activeFilters.filter(
              (filter) => filter.uniqueId !== action.payload.uniqueId,
            )
          : state.activeFilters.filter(
              (filter) => filter.value !== action.payload.value,
            );

      if (currentFilters.length === 0) {
        const fullRange = getYearRanges(state.availableTables);
        return {
          ...state,
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

      let filteredTables: Table[] = [];
      if (removedType === 'query') {
        state.availableTablesWhenQueryApplied = [];
        filteredTables = state.availableTables.filter((table) =>
          shouldTableBeIncluded(table, currentFilters),
        );
      } else {
        filteredTables = getAvailableTables(state).filter((table) =>
          shouldTableBeIncluded(table, currentFilters),
        );
      }

      const yearRangeStillActive = currentFilters.some(
        (f) => f.type === 'yearRange',
      );
      const updatedLastUsedYearRange = yearRangeStillActive
        ? state.lastUsedYearRange
        : getYearRanges(filteredTables);

      const recomputed = recomputeAvailableFilters(
        removedType,
        currentFilters,
        getAvailableTables(state),
        state.originalSubjectTree,
      );

      return {
        ...state,
        activeFilters: currentFilters,
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

    case ActionType.SET_ERROR:
      return { ...state, error: action.payload };

    case ActionType.SET_LOADING:
      return { ...state, loading: action.payload };

    default:
      return state;
  }
}
