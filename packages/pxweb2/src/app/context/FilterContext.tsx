import {
  ActionDispatch,
  createContext,
  ReactNode,
  useMemo,
  useReducer,
} from 'react';

import { Filter } from '../pages/StartPage/StartPageTypes';

import {
  ActionType,
  ReducerActionTypes,
  StartPageState,
} from '../pages/StartPage/StartPageTypes';
import {
  getFilters,
  getTimeUnits,
  updateSubjectTreeCounts,
} from '../util/startPageFilters';
import { shouldTableBeIncluded } from '../util/tableHandler';

// Want to ensure this is never changed
const initialState: StartPageState = Object.freeze({
  availableTables: [],
  filteredTables: [],
  availableFilters: getFilters([]),
  activeFilters: [],
  loading: false,
  error: '',
  originalSubjectTree: [],
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

function reducer(
  state: StartPageState,
  action: ReducerActionTypes,
): StartPageState {
  switch (action.type) {
    case ActionType.RESET_FILTERS:
      return {
        ...initialState,
        availableTables: action.payload.tables,
        filteredTables: action.payload.tables,
        originalSubjectTree: action.payload.subjects,
        availableFilters: {
          subjectTree: action.payload.subjects,
          timeUnits: getTimeUnits(action.payload.tables),
        },
      };
    case ActionType.ADD_FILTER: {
      const newFilters = [...state.activeFilters, ...action.payload];
      const filteredTables = state.availableTables.filter((table) =>
        shouldTableBeIncluded(table, newFilters),
      );
      const addType = action.payload[0]?.type;
      return {
        ...state,
        activeFilters: newFilters,
        filteredTables,
        availableFilters: {
          subjectTree:
            addType !== 'subject'
              ? updateSubjectTreeCounts(
                  state.originalSubjectTree,
                  filteredTables,
                )
              : state.availableFilters.subjectTree,
          timeUnits:
            addType !== 'timeUnit'
              ? getTimeUnits(filteredTables)
              : state.availableFilters.timeUnits,
        },
      };
    }

    case ActionType.ADD_SEARCH_FILTER: {
      if (action.payload == '') {
        return {
          ...state,
          activeFilters: state.activeFilters.filter((filter) => {
            return filter.type != 'search';
          }),
        };
      }

      const existingSearch = state.activeFilters.findIndex(
        (filter) => filter.type == 'search',
      );
      console.log(existingSearch);
      const newSearch: Filter = {
        type: 'search',
        label: `Search: ${action.payload}`,
        value: action.payload,
        index: 1,
      };

      const newFilters =
        existingSearch >= 0
          ? state.activeFilters.with(existingSearch, newSearch)
          : [...state.activeFilters, newSearch];

      return { ...state, activeFilters: newFilters };
    }

    case ActionType.REMOVE_FILTER: {
      const removedType = action.payload.type;
      const currentFilters =
        removedType == 'subject' && action.payload.uniqueId
          ? state.activeFilters.filter(
              (filter) => filter.uniqueId !== action.payload.uniqueId,
            )
          : state.activeFilters.filter(
              (filter) => filter.value !== action.payload.value,
            );
      if (currentFilters.length === 0) {
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
          },
        };
      }
      const filteredTables = state.availableTables.filter((table) =>
        shouldTableBeIncluded(table, currentFilters),
      );
      return {
        ...state,
        activeFilters: currentFilters,
        filteredTables,
        availableFilters: {
          subjectTree:
            removedType !== 'subject'
              ? updateSubjectTreeCounts(
                  state.originalSubjectTree,
                  filteredTables,
                )
              : state.availableFilters.subjectTree,
          timeUnits: getTimeUnits(filteredTables),
        },
      };
    }
    case ActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case ActionType.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}
