import { useEffect, useContext, useState, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import type { TFunction } from 'i18next';
import { motion, AnimatePresence } from 'framer-motion';
import cl from 'clsx';

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
} from '@pxweb2/pxweb2-ui';
import { type Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { FilterSidebar } from '../../components/FilterSidebar/FilterSidebar';
import { ActionType } from './StartPageTypes';
import { getSubjectTree, sortFilterChips } from '../../util/startPageFilters';
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

  const filterBackButtonRef = useRef<HTMLButtonElement>(null);
  const filterToggleRef = useRef<HTMLButtonElement>(null);
  const hasOverlayBeenOpenedRef = useRef(false);
  const paginationButtonRef = useRef<HTMLButtonElement>(null);
  const firstNewCardRef = useRef<HTMLDivElement>(null);

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
      firstNewCardRef.current.focus();
    }
  }, [isPaginating]);

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(i18n.language).format(value);

  const showNumberOfTables = () => {
    return (
      <Trans
        i18nKey="start_page.table.show_number_of_tables"
        values={{
          countShown: formatNumber(visibleCount),
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
    });
  };

  const handleShowLess = () => setVisibleCount(paginationCount);

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
    >
      {label}
    </Button>
  );

  const renderRemoveAllChips = () => {
    if (state.activeFilters.length >= 2) {
      return (
        <Chips.Removable
          filled
          onClick={() => {
            dispatch({
              type: ActionType.RESET_FILTERS,
              payload: {
                tables: state.availableTables,
                subjects: getSubjectTree(state.availableTables),
              },
            });
            setVisibleCount(paginationCount);
          }}
        >
          {t('start_page.filter.remove_all_filter')}
        </Chips.Removable>
      );
    }
  };

  const renderTableCard = (table: Table, t: TFunction) => {
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

      return (
        <div className={styles.tableListItem}>
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
          />
        </div>
      );
    }
  };

  const renderTableCardList = () => {
    return (
      <div>
        {renderNumberofTablesScreenReader()}
        <div className={styles.tableCardList}>
          {state.filteredTables.slice(0, visibleCount).map((table, index) => {
            const isFirstNew =
              index === visibleCount - paginationCount &&
              visibleCount > paginationCount;

            return (
              <div
                key={table.id}
                ref={isFirstNew ? firstNewCardRef : undefined}
                tabIndex={isFirstNew ? -1 : undefined}
              >
                {renderTableCard(table, t)}
              </div>
            );
          })}
        </div>

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
        </div>

        {renderNumberofTables()}
      </div>
    );
  };

  const renderNumberofTables = () => {
    if (visibleCount < state.filteredTables.length) {
      return (
        <BodyShort
          size="medium"
          className={styles.tableCount}
          aria-hidden="true"
        >
          {showNumberOfTables()}
        </BodyShort>
      );
    }
  };

  const renderNumberofTablesScreenReader = () => {
    if (visibleCount < state.filteredTables.length) {
      return (
        <span
          className={styles['sr-only']}
          aria-live="polite"
          aria-atomic="true"
        >
          {showNumberOfTables()}
        </span>
      );
    }
  };

  const renderTableCount = () => {
    const formattedCount = formatNumber(state.filteredTables.length);
    if (state.activeFilters.length) {
      return (
        <p>
          <Trans
            i18nKey="start_page.table.number_of_tables_found"
            values={{ count: formattedCount }}
            components={{
              strong: <span className={cl(styles['label-medium'])} />,
            }}
          />
        </p>
      );
    } else {
      return (
        <p>
          <Trans
            i18nKey="start_page.table.number_of_tables"
            values={{ count: formattedCount }}
            components={{
              strong: <span className={cl(styles['label-medium'])} />,
            }}
          />
        </p>
      );
    }
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
              <FilterSidebar
                onFilterChange={() => setVisibleCount(paginationCount)}
              />
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
                <FilterSidebar
                  onFilterChange={() => setVisibleCount(paginationCount)}
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
                        onClick={() => {
                          dispatch({
                            type: ActionType.REMOVE_FILTER,
                            payload: filter.value,
                          });
                          setVisibleCount(paginationCount);
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
              <div
                className={cl(styles['bodyshort-medium'], styles.countLabel)}
              >
                {renderTableCount()}
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
