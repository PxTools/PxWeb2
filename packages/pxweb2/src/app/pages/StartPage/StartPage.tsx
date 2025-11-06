import { useEffect, useContext, useState, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useNavigate } from 'react-router';
import type { TFunction } from 'i18next';
import { motion, AnimatePresence } from 'framer-motion';
import cl from 'clsx';
import { debounce } from 'lodash';
import { useLocation } from 'react-router';

import styles from './StartPage.module.scss';
import {
  Search,
  TableCard,
  Spinner,
  Chips,
  Button,
  Heading,
  Ingress,
  BodyShort,
  BodyLong,
  SearchHandle,
  Breadcrumbs,
  DetailsSection,
  List,
  ListItem,
} from '@pxweb2/pxweb2-ui';
import { type Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { FilterSidebar } from '../../components/FilterSidebar/FilterSidebar';
import { ActionType } from './StartPageTypes';
import {
  getSubjectTree,
  sortAndDeduplicateFilterChips,
  sortTablesByUpdated,
} from '../../util/startPageFilters';
import { useTopicIcons } from '../../util/hooks/useTopicIcons';
import useApp from '../../context/useApp';
import { getConfig } from '../../util/config/getConfig';
import { FilterContext, FilterProvider } from '../../context/FilterContext';
import { getAllTables } from '../../util/tableHandler';
import { tableListIsReadyToRender } from '../../util/startPageRender';
import useFilterUrlSync from '../../util/hooks/useFilterUrlSync';
import StartpageDetails from '../../components/StartPageDetails/StartPageDetails';
import { useLocaleContent } from '../../util/hooks/useLocaleContent';
import type {
  LocaleContent,
  BreadCrumb as BreadCrumbType,
  DetailsSection as DetailsSectionType,
} from '../../util/config/localeContentTypes';
import { createBreadcrumbItems } from '../../util/createBreadcrumbItems';

const StartPage = () => {
  const { t, i18n } = useTranslation();
  const { isMobile, isTablet } = useApp();
  const { state, dispatch } = useContext(FilterContext);
  useFilterUrlSync(state, dispatch, t);

  const paginationCount = 15;
  const isSmallScreen = isTablet === true || isMobile === true;
  const topicIconComponents = useTopicIcons();
  const hasUrlParams =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).toString().length > 0;

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
  const hasFetchedRef = useRef(false);
  const hasEverHydratedRef = useRef(false);
  const previousLanguage = useRef('');

  const navigate = useNavigate();

  const isReadyToRender = tableListIsReadyToRender(
    state,
    hasUrlParams,
    hasEverHydratedRef.current,
  );

  const localeContent: LocaleContent | null = useLocaleContent(i18n.language);
  const detailsSectionContent: DetailsSectionType | undefined =
    localeContent?.startPage?.detailsSection;
  const noResultSearchHelpContent =
    localeContent?.startPage?.noResultSearchHelp;
  const showBreadCrumb = getConfig().showBreadCrumbOnStartPage;
  const location = useLocation();

  // Run once when initially loading the page, then again if language changes
  // We want to try fetching tables in the selected language if possible
  useEffect(() => {
    if (hasFetchedRef.current && previousLanguage.current == i18n.language) {
      return;
    }
    hasFetchedRef.current = true;
    previousLanguage.current = i18n.language;

    async function fetchTables() {
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      try {
        const tables = await getAllTables(i18n.language);
        const sortedTables = sortTablesByUpdated(tables);
        dispatch({
          type: ActionType.RESET_FILTERS,
          payload: {
            tables: sortedTables,
            subjects: getSubjectTree(sortedTables),
          },
        });
      } catch (error) {
        // Only set error state for 404 errors (no tables found)
        if ((error as Error).message.includes('404')) {
          dispatch({
            type: ActionType.SET_ERROR,
            payload: (error as Error).message,
          });
        } else {
          // For any other errors, we re-throw to be caught by the ErrorBoundary in RootLayout
          throw new Error((error as Error).message);
        }
      } finally {
        dispatch({ type: ActionType.SET_LOADING, payload: false });
      }
    }
    fetchTables();
  }, [dispatch, i18n.language]);

  useEffect(() => {
    if (state.activeFilters.length > 0) {
      hasEverHydratedRef.current = true;
    }
  }, [state.activeFilters.length]);

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

  const breadcrumbItems = createBreadcrumbItems(
    location.pathname,
    t,
    i18n.language,
    [],
    '',
  );

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
    const topicId = table.subjectCode;
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
    setTimeout(() => setIsFadingTableList(false), 500);
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
      const discontinued = table.discontinued;

      let cardRef: React.RefObject<HTMLDivElement | null> | undefined;
      if (isFirstNew) {
        cardRef = firstNewCardRef;
      } else if (isLastVisible) {
        cardRef = lastVisibleCardRef;
      }

      return (
        <TableCard
          key={table.id}
          title={`${table.label}`}
          href={() => navigate(`${langPrefix}/table/${table.id}`)}
          updatedLabel={
            table.updated ? t('start_page.table.updated_label') : undefined
          }
          lastUpdated={
            table.updated
              ? t('date.simple_date', {
                  value: new Date(table.updated),
                })
              : undefined
          }
          period={`${table.firstPeriod?.slice(0, 4)}–${table.lastPeriod?.slice(
            0,
            4,
          )}`}
          frequency={frequencyLabel}
          tableId={`${table.id}`}
          icon={getTopicIcon(table)}
          ref={cardRef}
          tabIndex={tabIndex}
          ariaLabel={t('start_page.table.card_description', {
            title: table.label,
            updatedDate: table.updated
              ? t('date.simple_date', {
                  value: new Date(table.updated),
                })
              : undefined,
            yearFrom: table.firstPeriod?.slice(0, 4),
            yearTo: table.lastPeriod?.slice(0, 4),
            frequency: frequencyLabel,
            tableNumber: table.id,
          })}
          status={discontinued ? 'closed' : 'active'}
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

  const renderNoResult = () => {
    const helpTexts = noResultSearchHelpContent?.helpText;
    const searchHelpItems = Array.isArray(helpTexts)
      ? helpTexts.map((s) => String(s).trim()).filter(Boolean)
      : [];

    const hasSearchHelp =
      Boolean(noResultSearchHelpContent?.enabled) && searchHelpItems.length > 0;

    return (
      <section className={styles.noResults}>
        <Heading level="2" size="medium" className={styles.noResultsTitle}>
          {t('start_page.no_result_header')}
        </Heading>

        <BodyLong className={styles.noResultsText}>
          {t('start_page.no_result_description')}
        </BodyLong>

        {hasSearchHelp && (
          <div className={styles.noResultsDetails}>
            <DetailsSection header={t('start_page.no_result_search_help')}>
              <List listType="ul">
                {searchHelpItems.map((text, index) => (
                  <ListItem key={`${text}-${index}`}>{text}</ListItem>
                ))}
              </List>
            </DetailsSection>
          </div>
        )}
      </section>
    );
  };

  const renderTableCardList = () => (
    <>
      {renderNumberofTablesScreenReader()}
      {renderTableCount()}

      {state.filteredTables.length === 0 ? (
        renderNoResult()
      ) : (
        <>
          <div
            className={cl(styles.tableCardList, {
              [styles.fadeList]: isFadingTableList,
            })}
          >
            {renderCards()}
          </div>
          {renderPagination()}
        </>
      )}
    </>
  );

  // Debounce the dispatch for search filter, so it waits a few moments for typing to finish
  const debouncedDispatch = useRef(
    debounce((value: string) => {
      dispatch({
        type: ActionType.ADD_SEARCH_FILTER,
        payload: { text: value, language: i18n.language },
      });
      handleFilterChange();
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
                  iconPosition="start"
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

  const renderBreadCrumb = () => {
    if (showBreadCrumb) {
      return (
        <Breadcrumbs
          className={styles.breadcrumbStartpage}
          variant="default"
          breadcrumbItems={breadcrumbItems}
        />
      );
    }
  };

  return (
    <div className={styles.startPageLayout}>
      <Header stroke={true} />
      <main className={styles.startPage}>
        <div className={cl(styles.startPageHeader)}>
          <div
            className={cl(styles.contentTop, styles.container, {
              [styles.hasBreadcrumb]: showBreadCrumb,
            })}
          >
            {showBreadCrumb && renderBreadCrumb()}
            <div className={styles.information}>
              <Heading size="large" level="1" className={styles.title}>
                {t('start_page.header')}
              </Heading>
              <Ingress>{t('start_page.ingress')}</Ingress>
              <div className={styles.showDetailsSection}>
                {detailsSectionContent && (
                  <StartpageDetails detailsSection={detailsSectionContent} />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={cl(styles.searchFilterResult, styles.container)}>
          <div className={styles.searchAreaWrapper}>
            <div className={cl(styles.search)} role="search">
              <Search
                searchPlaceHolder={t('start_page.search_placeholder')}
                variant="default"
                ref={searchFieldRef}
                showLabel
                labelText={t('start_page.search_label')}
                onChange={(value: string) => {
                  debouncedDispatch(value);
                }}
              />
            </div>

            <Button
              variant="secondary"
              iconPosition="start"
              icon="Controls"
              className={styles.filterToggleButton}
              onClick={() => setIsFilterOverlayOpen(true)}
              ref={filterToggleRef}
              aria-expanded={isFilterOverlayOpen}
              aria-live="polite"
            >
              {t('start_page.filter.button')}
            </Button>
          </div>

          <div className={cl(styles.filterAndListWrapper)}>
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
              <Heading level="2" className={styles['sr-only']}>
                {t('start_page.result_hidden_header')}
              </Heading>
              {state.activeFilters.length >= 1 && (
                <div className={styles.filterPillContainer}>
                  <Chips aria-label={t('start_page.filter.list_filters_aria')}>
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
                          value: filter.label,
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
                <div className={styles.errorContainer}>
                  <ErrorMessage
                    action="button"
                    align="center"
                    size="small"
                    illustration="GenericError"
                    backgroundShape="wavy"
                    headingLevel="2"
                    title={t('common.errors.no_tables_loaded.title')}
                    description={t(
                      'common.errors.no_tables_loaded.description',
                    )}
                    actionText={t('common.errors.no_tables_loaded.action_text')}
                  />
                </div>
              )}
              {!state.error && !isReadyToRender ? (
                <div className={styles.loadingSpinner}>
                  <Spinner size="xlarge" />
                </div>
              ) : (
                !state.error && renderTableCardList()
              )}
            </div>
          </div>
        </div>
        {renderTableListSEO()}
      </main>
      <div className={cl(styles.footerContent)}>
        <div className={cl(styles.container)}>
          <Footer enableWindowScroll />
        </div>
      </div>
    </div>
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
