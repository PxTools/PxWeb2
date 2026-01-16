import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import cl from 'clsx';

import { type Table } from '@pxweb2/pxweb2-api-client';
import styles from './FilterSidebar.module.scss';
import { SearchSelect, type Option } from '@pxweb2/pxweb2-ui';
import { FilterContext } from '../../context/FilterContext';
import { ActionType } from '../../pages/StartPage/StartPageTypes';
import {
  getYearLabels,
  getYearRangeLabelValue,
} from '../../util/startPageFilters';

function generateYearOptions(start: number, end: number): Option[] {
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const year = (start + i).toString();
    return { label: year, value: year };
  });
}

function buildYearOption(value?: string): Option | undefined {
  return value ? { label: value, value } : undefined;
}

function useYearLabels(t: ReturnType<typeof useTranslation>['t']) {
  const { fromLabel, toLabel } = getYearLabels(t);
  const fromYearLabel = (year: string) =>
    t('start_page.filter.year.from_year', { year });
  const toYearLabel = (year: string) =>
    t('start_page.filter.year.to_year', { year });

  return { fromLabel, toLabel, fromYearLabel, toYearLabel };
}

function parseYearRange(
  filter?: { value: string; label: string },
  fromLabelText?: string,
  toLabelText?: string,
): { from?: string; to?: string } {
  if (!filter) {
    return {};
  }

  if (filter.value.includes('-')) {
    const [from, to] = filter.value.split('-');
    return { from, to };
  }

  const expectedFromLabel = `${fromLabelText ?? ''} ${filter.value}`;
  const expectedToLabel = `${toLabelText ?? ''} ${filter.value}`;

  if (filter.label === expectedFromLabel) {
    return { from: filter.value };
  }

  if (filter.label === expectedToLabel) {
    return { to: filter.value };
  }

  return { from: filter.value };
}

function getYearRangeForMatchingTables(
  tables: Table[],
  from?: number,
  to?: number,
) {
  const matching = tables.filter((table) => {
    const first = parseInt(table.firstPeriod ?? '', 10);

    let last = parseInt(table.lastPeriod ?? '', 10);
    if (
      table.timeUnit &&
      table.timeUnit.toLowerCase() === 'other' &&
      table.lastPeriod?.slice(4, 5) === '-'
    ) {
      last = parseInt(table.lastPeriod?.slice(5, 9) ?? '', 10);
    }

    if (!Number.isFinite(first) || !Number.isFinite(last)) {
      return false;
    }
    if (from !== undefined && to === undefined) {
      return from >= first && from <= last;
    }
    if (to !== undefined && from === undefined) {
      return to >= first && to <= last;
    }
    return true;
  });

  const years = matching.flatMap((table) => {
    const first = parseInt(table.firstPeriod ?? '', 10);
    let last = parseInt(table.lastPeriod ?? '', 10);
    if (
      table.timeUnit &&
      table.timeUnit.toLowerCase() === 'other' &&
      table.lastPeriod?.slice(4, 5) === '-'
    ) {
      last = parseInt(table.lastPeriod?.slice(5, 9) ?? '', 10);
    }

    return Number.isFinite(first) && Number.isFinite(last) ? [first, last] : [];
  });

  const min = Math.min(...years);
  const max = Math.max(...years);
  return { min, max };
}

export const YearRangeFilter: React.FC<{ onFilterChange?: () => void }> = ({
  onFilterChange,
}) => {
  const { state, dispatch } = useContext(FilterContext);
  const { t } = useTranslation();
  const { fromLabel, toLabel, fromYearLabel, toYearLabel } = useYearLabels(t);

  const yearRangeFilter = state.activeFilters.find(
    (f) => f.type === 'yearRange',
  );
  const { from: fromYear, to: toYear } = parseYearRange(
    yearRangeFilter,
    fromLabel,
    toLabel,
  );

  const { min: dynamicMin, max: dynamicMax } = getYearRangeForMatchingTables(
    state.filteredTables,
    fromYear ? parseInt(fromYear, 10) : undefined,
    toYear ? parseInt(toYear, 10) : undefined,
  );

  const fromOptions = generateYearOptions(
    dynamicMin,
    toYear ? parseInt(toYear, 10) : dynamicMax,
  );

  const toOptions = generateYearOptions(
    fromYear ? parseInt(fromYear, 10) : dynamicMin,
    dynamicMax,
  ).reverse();

  const clearSelectionText = t('start_page.filter.year.clear_selection');
  const noOptionsText = t('start_page.filter.year.no_option');

  function handleSelect(item: Option | undefined, type: 'from' | 'to') {
    const { from: prevFrom, to: prevTo } = parseYearRange(
      yearRangeFilter,
      fromLabel,
      toLabel,
    );

    const newFrom = type === 'from' ? item?.value : prevFrom;
    const newTo = type === 'to' ? item?.value : prevTo;

    if (newFrom !== prevFrom || newTo !== prevTo) {
      if (newFrom || newTo) {
        const { label, value } = getYearRangeLabelValue(
          newFrom,
          newTo,
          fromLabel,
          toLabel,
        );
        dispatch({
          type: ActionType.ADD_FILTER,
          payload: [{ type: 'yearRange', value, label, index: 0 }],
        });
        onFilterChange?.();
      } else if (yearRangeFilter) {
        dispatch({
          type: ActionType.REMOVE_FILTER,
          payload: { value: yearRangeFilter.value, type: 'yearRange' },
        });
        onFilterChange?.();
      }
    }
  }

  return (
    <div className={cl(styles.filterItem, styles.yearRange)}>
      <SearchSelect
        id="year-from"
        label={fromYearLabel(fromYear ?? '')}
        options={fromOptions}
        selectedOption={buildYearOption(fromYear)}
        noOptionsText={noOptionsText}
        onSelect={(item) => handleSelect(item, 'from')}
        inputMode="numeric"
        optionListStyle={{ maxHeight: '250px' }}
        clearSelectionText={clearSelectionText}
      />
      <SearchSelect
        id="year-to"
        label={toYearLabel(toYear ?? '')}
        options={toOptions}
        selectedOption={buildYearOption(toYear)}
        noOptionsText={noOptionsText}
        onSelect={(item) => handleSelect(item, 'to')}
        inputMode="numeric"
        optionListStyle={{ maxHeight: '250px' }}
        clearSelectionText={clearSelectionText}
      />
    </div>
  );
};
