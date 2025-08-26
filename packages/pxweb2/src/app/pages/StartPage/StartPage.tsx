import { useEffect, useContext, useState, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import type { TFunction } from 'i18next';
import { motion, AnimatePresence } from 'framer-motion';
import cl from 'clsx';
import { debounce } from 'lodash';

import styles from './StartPage.module.scss';
import {
  Search,
  TableCard,
  Spinner,
  Alert,
  Chips,
  Button,
  Heading,
  Ingress,
  BodyShort,
  SearchHandle,
} from '@pxweb2/pxweb2-ui';
import { type Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { FilterSidebar } from '../../components/FilterSidebar/FilterSidebar';
import { ActionType } from './StartPageTypes';
import {
  getSubjectTree,
  sortAndDeduplicateFilterChips,
} from '../../util/startPageFilters';
import { useTopicIcons } from '../../util/hooks/useTopicIcons';
import useApp from '../../context/useApp';
import { getConfig } from '../../util/config/getConfig';
import { FilterContext, FilterProvider } from '../../context/FilterContext';
import { getAllTables } from '../../util/tableHandler';

const StartPage = () => {
  const { t, i18n } = useTranslation();
  const { isMobile, isTablet } = useApp();
  const { state, dispatch } = useContext(FilterContext);

  const paginationCount = 15;
  const isSmallScreen = isTablet === true || isMobile === true;
  const topicIconComponents = useTopicIcons();

  const [isFilterOverlayOpen, setIsFilterOverlayOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(paginationCount);
  const [lastVisibleCount, setLastVisibleCount] = useState(paginationCount);
  const [isPaginating, setIsPaginating] = useState(false);
  const [paginationButtonWidth, setPaginationButtonWidth] = useState<number>();
  const [isFadingTableList, setIsFadingTableList] = useState(false);

  const filterBackButtonRef = useRef<HTMLButtonElement>(null);
  const filterToggleRef = useRef<HTMLButtonElement>(null);
  const hasOverlayBeenOpenedRef = useRef(false);
  const paginationButtonRef = useRef<HTMLButtonElement>(null);
  const firstNewCardRef = useRef<HTMLDivElement>(null);
  const lastVisibleCardRef = useRef<HTMLDivElement>(null);
  const searchFieldRef = useRef<SearchHandle>(null);

  useEffect(() => {
    async function fetchTables() {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      try {
        const tables = await getAllTables();
        dispatch({
          type: ActionType.RESET_FILTERS,
          payload: { tables: tables, subjects: getSubjectTree(tables) },
        });
      } catch (error) {
        dispatch({
          type: ActionType.SET_ERROR,
          payload: (error as Error).message,
        });
      } finally {
        dispatch({ type: ActionType.SET_LOADING, payload: false });
      }
    }
    fetchTables();
  }, [dispatch]);

  useEffect(() => {
    if (isFilterOverlayOpen) {
      hasOverlayBeenOpenedRef.current = true;
      if (filterBackButtonRef.current) {
        filterBackButtonRef.current.focus();
      }
    }
  }, [isFilterOverlayOpen]);

  useEffect(() => {
    if (!isFilterOverlayOpen && hasOverlayBeenOpenedRef.current) {
      if (filterToggleRef.current) {
        filterToggleRef.current.focus();
      }
    }
  }, [isFilterOverlayOpen]);

  useEffect(() => {
    if (isFilterOverlayOpen && isSmallScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFilterOverlayOpen, isSmallScreen]);

  useEffect(() => {
    if (visibleCount === lastVisibleCount && isPaginating) {
      setIsPaginating(false);
    }
  }, [visibleCount, lastVisibleCount, isPaginating]);

  useEffect(() => {
    if (!isPaginating && firstNewCardRef.current) {
      const delay = Math.min(1000, 200 + visibleCount * 10);
      const timeout = setTimeout(() => {
        firstNewCardRef.current?.focus();
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [isPaginating, visibleCount]);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(i18n.language).format(value);

  const showNumberOfTables = () => {
    return (
      <Trans
        i18nKey="start_page.table.show_number_of_tables"
        values={{
          countShown: formatNumber(
            Math.min(visibleCount, state.filteredTables.length),
          ),
          countTotal: formatNumber(state.filteredTables.length),
        }}
      />
    );
  };

  const getTopicIcon = (table: Table) => {
    const topicId = table.paths?.[0]?.[0]?.id;
    const size = isSmallScreen ? 'small' : 'medium';

    return topicId
      ? (topicIconComponents.find((icon) => icon.id === topicId)?.[size] ??
          null)
      : null;
  };

  const handleShowMore = () => {
    if (isPaginating) {
      return;
    }
    if (paginationButtonRef.current) {
      setPaginationButtonWidth(paginationButtonRef.current.offsetWidth);
    }
    setIsPaginating(true);
    const newCount = visibleCount + paginationCount;
    setLastVisibleCount(newCount);
    requestAnimationFrame(() => {
      setVisibleCount(newCount);
      triggerFade();
    });
  };

  const handleShowLess = () => {
    setVisibleCount(paginationCount);
    triggerFade();
    requestAnimationFrame(() => {
      if (lastVisibleCardRef.current) {
        lastVisibleCardRef.current.focus();
      }
    });
  };

  const triggerFade = () => {
    setIsFadingTableList(true);
    setTimeout(() => setIsFadingTableList(false), 500); // eller 400ms hvis du bruker kortere CSS
  };

  const handleFilterChange = () => {
    setVisibleCount(paginationCount);
    triggerFade();
  };

  const renderPaginationButton = (
    type: 'more' | 'less',
    onClick: () => void,
    label: string,
  ) => (
    <Button
      variant="primary"
      onClick={onClick}
      loading={isPaginating}
      ref={paginationButtonRef}
      style={
        paginationButtonWidth ? { minWidth: paginationButtonWidth } : undefined
      }
      tabIndex={0}
    >
      {label}
    </Button>
  );

  const renderRemoveAllChips = () => {
    if (state.activeFilters.length >= 2) {
      return (
        <Chips.Removable
          filled
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            dispatch({
              type: ActionType.RESET_FILTERS,
              payload: {
                tables: state.availableTables,
                subjects: getSubjectTree(state.availableTables),
              },
            });
            searchFieldRef.current?.clearInputField();
            handleFilterChange();
          }}
        >
          {t('start_page.filter.remove_all_filter')}
        </Chips.Removable>
      );
    }
  };

  const renderTableCard = (
    table: Table,
    t: TFunction,
    isFirstNew: boolean,
    isLastVisible: boolean,
    tabIndex?: number,
  ) => {
    if (table) {
      const translationKey = `start_page.filter.frequency.${table.timeUnit?.toLowerCase()}`;
      const frequencyLabel = t(translationKey, {
        defaultValue: table.timeUnit ?? '',
      });

      const config = getConfig();
      const language = i18n.language;
      const showLangInPath =
        config.language.showDefaultLanguageInPath ||
        language !== config.language.defaultLanguage;
      const langPrefix = showLangInPath ? `/${language}` : '';

      let cardRef: React.RefObject<HTMLDivElement | null> | undefined;
      if (isFirstNew) {
        cardRef = firstNewCardRef;
      } else if (isLastVisible) {
        cardRef = lastVisibleCardRef;
      }

      return (
        <TableCard
          title={`${table.label}`}
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
          icon={getTopicIcon(table)}
          ref={cardRef}
          tabIndex={tabIndex}
        />
      );
    }
  };

  const getVisibleTables = () => state.filteredTables.slice(0, visibleCount);

  const isFirstNewIndex = (index: number) =>
    visibleCount > paginationCount && index === visibleCount - paginationCount;

  const isLastVisibleIndex = (index: number) =>
    index === Math.min(visibleCount, state.filteredTables.length) - 1;

  const renderCards = () => {
    return getVisibleTables().map((table, index) => {
      const isFirstNew = isFirstNewIndex(index);
      const isLastVisible = isLastVisibleIndex(index);
      const tabIndex = isFirstNew ? -1 : undefined;

      return renderTableCard(table, t, isFirstNew, isLastVisible, tabIndex);
    });
  };

  const renderTableCardList = () => (
    <>
      {renderNumberofTablesScreenReader()}
      {renderTableCount()}
      <div
        className={cl(styles.tableCardList, {
          [styles.fadeList]: isFadingTableList,
        })}
      >
        {renderCards()}
      </div>
      {renderPagination()}
    </>
  );

  // Debounce the dispatch for search filter, so it waits a few moments for typing to finish
  const debouncedDispatch = useRef(
    debounce((value: string) => {
      dispatch({
        type: ActionType.ADD_SEARCH_FILTER,
        payload: { text: value, language: i18n.language },
      });
    }, 500),
  ).current;

  const renderPagination = () => {
    const shouldShowPagination =
      visibleCount < state.filteredTables.length ||
      (visibleCount >= state.filteredTables.length &&
        visibleCount > paginationCount);
    if (shouldShowPagination) {
      return (
        <div className={styles.paginationWrapper}>
          {visibleCount < state.filteredTables.length &&
            renderPaginationButton(
              'more',
              handleShowMore,
              t('start_page.table.show_more'),
            )}

          {visibleCount >= state.filteredTables.length &&
            visibleCount > paginationCount &&
            renderPaginationButton(
              'less',
              handleShowLess,
              t('start_page.table.show_less'),
            )}
          <BodyShort
            size="medium"
            className={styles.tableCount}
            aria-hidden="true"
          >
            {showNumberOfTables()}
          </BodyShort>
        </div>
      );
    }
  };

  const renderNumberofTablesScreenReader = () => {
    const formattedCount = formatNumber(state.filteredTables.length);
    return (
      <span className={styles['sr-only']} aria-live="polite" aria-atomic="true">
        <Trans
          i18nKey="start_page.table.show_number_of_tables_aria"
          values={{
            count: formattedCount,
            countShown: formatNumber(
              Math.min(visibleCount, state.filteredTables.length),
            ),
            countTotal: formatNumber(state.filteredTables.length),
          }}
        />
      </span>
    );
  };

  const renderTableCount = () => {
    const formattedCount = formatNumber(state.filteredTables.length);
    return (
      <div
        aria-hidden="true"
        className={cl(styles['bodyshort-medium'], styles.countLabel)}
      >
        <Trans
          i18nKey={
            state.activeFilters.length
              ? 'start_page.table.number_of_tables_found'
              : 'start_page.table.number_of_tables'
          }
          values={{ count: formattedCount }}
          components={{
            strong: <span className={cl(styles['label-medium'])} />,
          }}
        />
      </div>
    );
  };

  const renderFilterOverlay = () => {
    return (
      <AnimatePresence>
        {isSmallScreen && isFilterOverlayOpen && (
          <motion.div
            key="filterOverlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={styles.filterOverlay}
          >
            <div className={styles.filterOverlayHeader}>
              <Button
                variant="tertiary"
                icon="ArrowLeft"
                aria-label={t('start_page.filter.back')}
                onClick={() => setIsFilterOverlayOpen(false)}
                ref={filterBackButtonRef}
              />
              <Heading size="medium">{t('start_page.filter.header')}</Heading>
            </div>

            <div className={styles.filterOverlayContent}>
              <FilterSidebar onFilterChange={handleFilterChange} />
            </div>

            <div className={styles.filterOverlayFooter}>
              {state.activeFilters.length >= 1 && (
                <Button
                  variant="secondary"
                  className={styles.removeFilterButton}
                  iconPosition="left"
                  icon="XMark"
                  onClick={() => {
                    dispatch({
                      type: ActionType.RESET_FILTERS,
                      payload: {
                        tables: state.availableTables,
                        subjects: getSubjectTree(state.availableTables),
                      },
                    });
                  }}
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
                  value: formatNumber(state.filteredTables.length),
                })}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderTableListSEO = () => {
    return (
      <nav
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        <h2>TableList(SEO)</h2>
        <ul>
          {state.availableTables.map((table) => {
            const config = getConfig();
            const language = i18n.language;
            const showLangInPath =
              config.language.showDefaultLanguageInPath ||
              language !== config.language.defaultLanguage;
            const langPrefix = showLangInPath ? `/${language}` : '';
            return (
              <li key={table.id}>
                <a href={`${langPrefix}/table/${table.id}`} tabIndex={-1}>
                  {table.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  };

  return (
    <>
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
                  ref={searchFieldRef}
                  onChange={(value: string) => {
                    debouncedDispatch(value);
                  }}
                />
              </div>

              <Button
                variant="secondary"
                iconPosition="left"
                icon="Controls"
                className={styles.filterToggleButton}
                onClick={() => setIsFilterOverlayOpen(true)}
                ref={filterToggleRef}
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
                <FilterSidebar onFilterChange={handleFilterChange} />
              </div>
            )}

            {renderFilterOverlay()}

            <div className={styles.listTables}>
              {state.activeFilters.length >= 1 && (
                <div className={styles.filterPillContainer}>
                  <Chips>
                    {renderRemoveAllChips()}
                    {sortAndDeduplicateFilterChips(
                      state.activeFilters,
                      state.subjectOrderList,
                    ).map((filter) => (
                      <Chips.Removable
                        onClick={() => {
                          dispatch({
                            type: ActionType.REMOVE_FILTER,
                            payload: {
                              value: filter.value,
                              type: filter.type,
                            },
                          });
                          handleFilterChange();
                          if (filter.type == 'search') {
                            searchFieldRef.current?.clearInputField();
                          }
                        }}
                        aria-label={t('start_page.filter.remove_filter_aria', {
                          value: filter.value,
                        })}
                        key={filter.value}
                        truncate
                      >
                        {filter.label}
                      </Chips.Removable>
                    ))}
                  </Chips>
                </div>
              )}
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
      {renderTableListSEO()}
      <Footer />
    </>
  );
};

function Render() {
  return (
    <AccessibilityProvider>
      <FilterProvider>
        <StartPage />
      </FilterProvider>
    </AccessibilityProvider>
  );
}

export default Render;
