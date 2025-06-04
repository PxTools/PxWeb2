import { useEffect, useReducer, useState } from 'react';
import cl from 'clsx';
import styles from './StartPage.module.scss';
import { useTranslation, Trans } from 'react-i18next';
import type { TFunction } from 'i18next';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Search,
  TableCard,
  Spinner,
  Alert,
  Chips,
  Button,
  Heading,
  Ingress,
} from '@pxweb2/pxweb2-ui';
import { type Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
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
import { getConfig } from '../../util/config/getConfig';

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

const springTransition = {
  type: 'spring',
  mass: 1,
  stiffness: 320,
  damping: 40,
};

const StartPage = () => {
  const { t, i18n } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isFilterOverlayOpen, setIsFilterOverlayOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const { isMobile, isTablet } = useApp();
  const isSmallScreen = isTablet === true || isMobile === true;
  const topicIconComponents = useTopicIcons();

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 15);
  };

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
    async function fetchTables() {
      handleSetLoading(true);
      try {
        const tables = await getFullTable();
        handleResetFilter(tables);
      } catch (error) {
        handleSetError((error as Error).message);
      } finally {
        handleSetLoading(false);
      }
    }
    fetchTables();
  }, []);

  function renderRemoveAllChips() {
    if (state.activeFilters.length >= 2) {
      return (
        <Chips.Removable
          filled
          onClick={() => {
            handleResetFilter(state.availableTables);
          }}
        >
          {t('start_page.filter.remove_all_filter')}
        </Chips.Removable>
      );
    }
  }

  function renderTableCard(table: Table, t: TFunction) {
    if (table) {
      const translationKey = `start_page.filter.frequency.${table.timeUnit?.toLowerCase()}`;
      const frequencyLabel = t(translationKey, {
        defaultValue: table.timeUnit ?? '',
      });

      const config = getConfig();      
      const language = i18n.language;
      const showLangInPath =
      config.language.showDefaultLanguageInPath|| language !== config.language.defaultLanguage
      const langPrefix = showLangInPath ? `/${language}` : '';

      return (
        <div className={styles.tableListItem}>
          <TableCard
            title={`${table.label && removeTableNumber(table.label)}`}
            href={`${langPrefix}/table/${table.id}`}
            updatedLabel={
              table.updated ? t('start_page.table.updated_label') : undefined
            }
            lastUpdated={
              table.updated
                ? new Date(table.updated).toLocaleDateString(language)
                : undefined
            }
            period={`${table.firstPeriod?.slice(0, 4)}–${table.lastPeriod?.slice(0, 4)}`}
            frequency={frequencyLabel}
            tableId={`${table.id}`}
            icon={renderTopicIcon(table)}
          />
        </div>
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

  function renderFilterOverlay() {
    return (
      <AnimatePresence>
        {isSmallScreen && isFilterOverlayOpen && (
          <motion.div
            key="filterOverlay"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={springTransition}
            className={styles.filterOverlay}
          >
            <div className={styles.filterOverlayHeader}>
              <Button
                variant="tertiary"
                icon="ArrowLeft"
                onClick={() => setIsFilterOverlayOpen(false)}
              />
              <Heading size="medium">{t('start_page.filter.header')}</Heading>
            </div>

            <div className={styles.filterOverlayContent}>
              <FilterSidebar
                state={state}
                handleAddFilter={handleAddFilter}
                handleRemoveFilter={handleRemoveFilter}
                handleResetFilter={() =>
                  handleResetFilter(state.availableTables)
                }
              />
            </div>

            <div className={styles.filterOverlayFooter}>
              {state.activeFilters.length >= 1 && (
                <Button
                  variant="secondary"
                  className={styles.removeFilterButton}
                  iconPosition="left"
                  icon="XMark"
                  onClick={() => handleResetFilter(state.availableTables)}
                >
                  {t('start_page.filter.remove_all_filter')}
                </Button>
              )}
              <Button
                variant="primary"
                className={styles.showResultsButton}
                onClick={() => setIsFilterOverlayOpen(false)}
              >
                {t('start_page.filter.show_results', {
                  count: state.filteredTables.length,
                })}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  function renderTableCardList() {
    return (
      <>
        {state.filteredTables.slice(0, visibleCount).map((table) => (
          <div key={table.id}>{renderTableCard(table, t)}</div>
        ))}

        {visibleCount < state.filteredTables.length && (
          <div className={styles.loadMoreWrapper}>
            <Button
              variant="primary"
              onClick={handleShowMore}
              className={styles.loadMoreButton}
            >
              {t('start_page.table.show_more')}
            </Button>
          </div>
        )}
      </>
    );
  }

  return (
    <AccessibilityProvider>
      <Header />
      <div className={styles.startPage}>
        <div className={styles.container}>
          <div className={styles.information}>
            <Heading size="large" level="1" className={styles.title}>
              {t('start_page.header')}
            </Heading>
            <Ingress>{t('start_page.ingress')}</Ingress>
          </div>
        </div>
        <div className={cl(styles.searchFilterResult)}>
          <div className={styles.container}>
            <div className={styles.searchAreaWrapper}>
              <div className={cl(styles.search)}>
                <Search
                  searchPlaceHolder={t('start_page.search_placeholder')}
                  variant="default"
                />
              </div>

              <Button
                variant="secondary"
                iconPosition="left"
                icon="Controls"
                className={styles.filterToggleButton}
                onClick={() => setIsFilterOverlayOpen(true)}
              >
                {t('start_page.filter.button')}
              </Button>
            </div>
          </div>

          <div className={cl(styles.filterAndListWrapper, styles.container)}>
            {!isSmallScreen && (
              <div>
                <Heading
                  className={cl(styles.filterHeading)}
                  size="medium"
                  level="2"
                >
                  {t('start_page.filter.header')}
                </Heading>
                <FilterSidebar
                  state={state}
                  handleAddFilter={handleAddFilter}
                  handleRemoveFilter={handleRemoveFilter}
                  handleResetFilter={() => {
                    handleResetFilter(state.availableTables);
                  }}
                />
              </div>
            )}

            {renderFilterOverlay()}

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
              <div
                className={cl(styles['bodyshort-medium'], styles.countLabel)}
              >
                {state.activeFilters.length ? (
                  <p>
                    <Trans
                      i18nKey="start_page.table.number_of_tables_found"
                      values={{ count: state.filteredTables.length }}
                      components={{
                        strong: <span className={cl(styles['label-medium'])} />,
                      }}
                    />
                  </p>
                ) : (
                  <p>
                    <Trans
                      i18nKey="start_page.table.number_of_tables"
                      values={{ count: state.filteredTables.length }}
                      components={{
                        strong: <span className={cl(styles['label-medium'])} />,
                      }}
                    />
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
                    Statistikkbanken kunne ikke vise listen over tabeller. Last
                    inn siden på nytt eller klikk her for å forsøke igjen.{' '}
                    <br />
                    Feilmelding: {state.error}
                  </Alert>
                </div>
              )}
              {state.loading ? (
                <div className={styles.loadingSpinner}>
                  <Spinner size="xlarge" />
                </div>
              ) : (
                renderTableCardList()
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </AccessibilityProvider>
  );
};

export default StartPage;
