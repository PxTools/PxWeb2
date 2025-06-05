import { useEffect, useContext } from 'react';
import { Virtuoso } from 'react-virtuoso';
import cl from 'clsx';

import styles from './StartPage.module.scss';
import { useTranslation, Trans } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Search, TableCard, Spinner, Alert, Chips } from '@pxweb2/pxweb2-ui';
import { type Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { Header } from '../../components/Header/Header';
import { Information } from '../../components/Information/Information';
import { FilterSidebar } from '../../components/FilterSidebar/FilterSidebar';
import { ActionType } from './StartPageTypes';
import { getSubjectTree, sortFilterChips } from '../../util/startPageFilters';
import { useTopicIcons } from '../../util/hooks/useTopicIcons';
import useApp from '../../context/useApp';
import { FilterContext } from '../../context/FilterContext';
import { getAllTables } from '../../util/tableHandler';

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

const StartPage = () => {
  const { t, i18n } = useTranslation();
  const { isMobile, isTablet } = useApp();
  const isSmallScreen = isTablet === true || isMobile === true;
  const topicIconComponents = useTopicIcons();

  const { state, dispatch } = useContext(FilterContext);

  useEffect(() => {
    async function fetchTables() {
      console.log('Now Loading!');
      dispatch({ type: ActionType.SET_LOADING, payload: true });
      try {
        const tables = await getAllTables();
        console.log('Fetching Data!');
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

  function renderRemoveAllChips() {
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
      return (
        <div className={styles.tableListItem}>
          <TableCard
            title={`${table.label && removeTableNumber(table.label)}`}
            href={`/table/${table.id}`}
            updatedLabel={
              table.updated ? t('start_page.table.updated_label') : undefined
            }
            lastUpdated={
              table.updated
                ? new Date(table.updated).toLocaleDateString(i18n.language)
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

  return (
    <AccessibilityProvider>
      <Header />
      <Information />
      <div className={styles.startPage}>
        <div className={styles.searchArea}>
          <Search
            searchPlaceHolder={t('start_page.search_placeholder')}
            variant="default"
          />
        </div>
        <FilterSidebar />
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
                    }}
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
              itemContent={(_, table: Table) => renderTableCard(table, t)}
            />
          )}
        </div>
      </div>
    </AccessibilityProvider>
  );
};

export default StartPage;
