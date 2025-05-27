import { useEffect, useReducer } from 'react';
import { Virtuoso } from 'react-virtuoso';
import cl from 'clsx';

import styles from './StartPage.module.scss';
import { useTranslation } from 'react-i18next';
import { Search, TableCard, Spinner, Alert, Chips } from '@pxweb2/pxweb2-ui';
import { type Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { Header } from '../../components/Header/Header';
import { Information } from '../../components/Information/Information';
import { FilterSidebar } from '../../components/FilterSidebar/FilterSidebar';
import {
  type Filter,
  type ReducerActionTypes,
  type StartPageState,
  ActionType,
} from './StartPageTypes';
import { getFullTable, shouldTableBeIncluded } from '../../util/tableHandler';
import {
  getFilters,
  getSubjectTree,
  getTimeUnits,
  updateSubjectTreeCounts,
  sortFilterChips,
} from '../../util/startPageFilters';
import { useTopicIcons } from '../../util/hooks/useTopicIcons';
import useApp from '../../context/useApp';

// TODO: Remove this function. We can not consider norwegian special cases in our code!
function removeTableNumber(title: string): string {
  //Check if title starts with table number, like "01234: Some Statistic"
  const test = RegExp(/^\d{5}:*./, 'i');

  if (test.exec(title) == null) {
    return title;
  } else {
    return title.slice(6);
  }
}

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

const StartPage = () => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isMobile, isTablet } = useApp();
  const isSmallScreen = isTablet === true || isMobile === true;
  const topicIconComponents = useTopicIcons();

  function handleResetFilter(tables: Table[]) {
    dispatch({
      type: ActionType.RESET_FILTERS,
      payload: { tables: tables, subjects: getSubjectTree(tables) },
    });
  }

  function handleAddFilter(filter: Filter[]) {
    dispatch({ type: ActionType.ADD_FILTER, payload: filter });
  }

  async function handleRemoveFilter(filterId: string) {
    dispatch({
      type: ActionType.REMOVE_FILTER,
      payload: filterId,
    });
  }

  function handleSetError(error: string) {
    dispatch({ type: ActionType.SET_ERROR, payload: error });
  }

  function handleSetLoading(loadingState: boolean) {
    dispatch({ type: ActionType.SET_LOADING, payload: loadingState });
  }

  function reducer(
    state: StartPageState,
    action: ReducerActionTypes,
  ): StartPageState {
    switch (action.type) {
      case ActionType.RESET_FILTERS:
        // Reset from API or cache
        return {
          ...initialState,
          availableTables: action.payload.tables,
          filteredTables: action.payload.tables,
          originalSubjectTree: action.payload.subjects, // lagre full struktur én gang
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
      case ActionType.REMOVE_FILTER: {
        const currentFilters = state.activeFilters.filter(
          (filter) => filter.value !== action.payload,
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
        //TODO: Add type to handleRemoveFilter instead
        const removedFilter = state.activeFilters.find(
          (filter) => filter.value === action.payload,
        );
        const removedType = removedFilter?.type;
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

  useEffect(() => {
    handleSetLoading(true);
    getFullTable
      .then((tables: Table[]) => {
        handleResetFilter(tables);
      })
      .catch((error: Error) => {
        handleSetError(error.message);
      })
      .finally(() => {
        handleSetLoading(false);
      });
  }, []);

  function renderRemoveAllChips() {
    if (state.activeFilters.length >= 2) {
      return (
        <Chips.Removable
          filled
          onClick={() => {
            getFullTable.then((t) => handleResetFilter(t));
          }}
        >
          {t('start_page.filter.remove_all_filter')}
        </Chips.Removable>
      );
    }
  }

  function renderTopicIcon(table: Table) {
    const topicId = table.paths?.[0]?.[0]?.id;
    const size = isSmallScreen ? 'small' : 'medium';

    return topicId
      ? (topicIconComponents.find((icon) => icon.id === topicId)?.[size] ??
          null)
      : null;
  }

  return (
    <AccessibilityProvider>
      <Header />
      <Information />
      <div className={styles.startPage}>
        <div className={styles.searchArea}>
          <Search searchPlaceHolder="Search..." variant="default" />
        </div>
        <FilterSidebar
          state={state}
          handleAddFilter={handleAddFilter}
          handleRemoveFilter={handleRemoveFilter}
          handleResetFilter={() => {
            handleResetFilter(state.availableTables);
          }}
        />
        <div className={styles.listTables}>
          {state.activeFilters.length >= 1 && (
            <div className={styles.filterPillContainer}>
              <Chips>
                {renderRemoveAllChips()}
                {sortFilterChips(state.activeFilters).map((filter) => (
                  <Chips.Removable
                    onClick={() => handleRemoveFilter(filter.value)}
                    aria-label={t('start_page.filter.remove_filter_aria', {
                      value: filter.value,
                    })}
                    key={filter.value}
                  >
                    {filter.label}
                  </Chips.Removable>
                ))}
              </Chips>
            </div>
          )}
          <div className={cl(styles['bodyshort-medium'], styles.countLabel)}>
            {state.activeFilters.length ? (
              <p>
                Treff på{' '}
                <span className={cl(styles['label-medium'])}>
                  {state.filteredTables.length}
                </span>{' '}
                tabeller
              </p>
            ) : (
              <p>
                <span className={cl(styles['label-medium'])}>
                  {state.filteredTables.length}
                </span>{' '}
                tabeller
              </p>
            )}
          </div>

          {state.error && (
            <div className={styles.error}>
              <Alert
                heading="Feil i lasting av tabeller"
                onClick={() => {
                  location.reload();
                }}
                variant="error"
                clickable
              >
                Statistikkbanken kunne ikke vise listen over tabeller. Last inn
                siden på nytt eller klikk her for å forsøke igjen. <br />
                Feilmelding: {state.error}
              </Alert>
            </div>
          )}
          {state.loading ? (
            <div className={styles.loadingSpinner}>
              <Spinner size="xlarge" />
            </div>
          ) : (
            <Virtuoso
              style={{ height: '90%' }}
              data={state.filteredTables}
              itemContent={(_, table: Table) => (
                <div className={styles.tableListItem}>
                  <TableCard
                    title={`${table.label && removeTableNumber(table.label)}`}
                    href={`/table/${table.id}`}
                    updatedLabel={table.updated ? 'Sist oppdatert' : undefined}
                    lastUpdated={
                      table.updated
                        ? new Date(table.updated).toLocaleDateString('no') // We may want to get the locale from config!
                        : undefined
                    }
                    // We use slice here because we _only_ want 4digit year. Sometimes, month is appended in data set.
                    period={`${table.firstPeriod?.slice(0, 4)}–${table.lastPeriod?.slice(0, 4)}`}
                    frequency={`${table.timeUnit}`}
                    tableId={`${table.id}`}
                    icon={renderTopicIcon(table)}
                  />
                </div>
              )}
            />
          )}
        </div>
      </div>
    </AccessibilityProvider>
  );
};

export default StartPage;
