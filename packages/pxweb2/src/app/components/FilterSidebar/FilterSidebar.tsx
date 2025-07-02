import cl from 'clsx';

import { ActionType } from '../../pages/StartPage/StartPageTypes';
import styles from './FilterSidebar.module.scss';
import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  FilterCategory,
  Button,
  SearchSelect,
  type Option,
} from '@pxweb2/pxweb2-ui';
import {
  PathItem,
  findParent,
  parseYearRange,
  getYearRangeLabelValue,
} from '../../util/startPageFilters';
import { FilterContext } from '../../context/FilterContext';
import { ReactNode, useContext, useEffect, useState } from 'react';

interface CollapsibleProps {
  subject: PathItem;
  index: number;
  count: number;
  isActive: boolean;
  children: ReactNode;
  onFilterChange?: () => void;
}
interface FilterSidebarProps {
  onFilterChange?: () => void;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  subject,
  index,
  count,
  isActive,
  children,
  onFilterChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch } = useContext(FilterContext);

  return (
    <>
      <div className={styles.collapsibleElement}>
        {subject.children && subject.children.length > 0 ? (
          <Button
            variant="tertiary"
            icon={isOpen ? 'ChevronUp' : 'ChevronRight'}
            aria-expanded={isOpen}
            aria-controls={`collapsible-children-${subject.id}-${index}`}
            className={styles.collapsibleChevron}
            onClick={() => setIsOpen(!isOpen)}
          ></Button>
        ) : (
          <span className={styles.collapsibleChevron} />
        )}
        <span className={styles.filterLabel}>
          <Checkbox
            id={subject.id + index}
            text={`${subject.label} (${count})`}
            value={isActive}
            subtle={!isActive && count === 0}
            onChange={(value) => {
              setIsOpen(true);
              if (value) {
                const parent = findParent(
                  state.availableFilters.subjectTree,
                  subject.id,
                );

                // Remove parent from activeFilters
                state.activeFilters
                  .filter((f) => f.type === 'subject' && f.value === parent?.id)
                  .forEach((f) => {
                    dispatch({
                      type: ActionType.REMOVE_FILTER,
                      payload: f.value,
                    });
                  });

                dispatch({
                  type: ActionType.ADD_FILTER,
                  payload: [
                    {
                      type: 'subject',
                      value: subject.id,
                      label: subject.label,
                      index: index,
                    },
                  ],
                });
              } else {
                dispatch({
                  type: ActionType.REMOVE_FILTER,
                  payload: subject.id,
                });
              }
              onFilterChange?.();
            }}
          />
        </span>
      </div>
      <div className={!isOpen ? styles.hiddenChildren : ''}>{children}</div>
    </>
  );
};

const RenderSubjects: React.FC<{
  firstLevel: boolean;
  subjects: PathItem[];
  onFilterChange?: () => void;
}> = ({ firstLevel, subjects, onFilterChange }) => {
  const { state } = useContext(FilterContext);

  return subjects.map((subject, index) => {
    const isActive = state.activeFilters.some(
      (filter) => filter.type === 'subject' && filter.value === subject.id,
    );
    const count = subject.count ?? 0;

    return (
      <div key={subject.id} className={cl(!firstLevel && styles.toggleIndent)}>
        <Collapsible
          subject={subject}
          index={index}
          count={count}
          isActive={isActive}
          onFilterChange={onFilterChange}
        >
          {subject.children && (
            <RenderSubjects
              firstLevel={false}
              subjects={subject.children}
              onFilterChange={onFilterChange}
            />
          )}
        </Collapsible>
      </div>
    );
  });
};

const RenderTimeUnitFilters: React.FC<{ onFilterChange?: () => void }> = ({
  onFilterChange,
}) => {
  const { state, dispatch } = useContext(FilterContext);
  const { t } = useTranslation();

  const allTimeUnits = new Set(
    state.availableTables.map((table) => table.timeUnit ?? ''),
  );

  return Array.from(allTimeUnits).map((key, i) => {
    const count = state.availableFilters.timeUnits.get(key) ?? 0;
    const isActive = state.activeFilters.some(
      (filter) => filter.type === 'timeUnit' && filter.value === key,
    );
    const translationKey = `start_page.filter.frequency.${key.toLowerCase()}`;
    const label = t(translationKey, { defaultValue: key });

    return (
      <li key={key} className={styles.filterItem}>
        <Checkbox
          id={key}
          text={`${label} (${count})`}
          value={isActive}
          subtle={!isActive && count === 0}
          onChange={(value) => {
            value
              ? dispatch({
                  type: ActionType.ADD_FILTER,
                  payload: [{ type: 'timeUnit', value: key, label, index: i }],
                })
              : dispatch({
                  type: ActionType.REMOVE_FILTER,
                  payload: key,
                });
            onFilterChange?.();
          }}
        />
      </li>
    );
  });
};

const RenderYearsFilters: React.FC<{
  onFilterChange?: () => void;
}> = () => {
  const { state, dispatch } = useContext(FilterContext);
  const { t } = useTranslation();
  const [resetKey, setResetKey] = useState(0);
  const fromLabel = t('start_page.filter.year.from_label');
  const toLabel = t('start_page.filter.year.to_label');

  useEffect(() => {
    setResetKey(state.resetYearFilterInput);
  }, [state.resetYearFilterInput]);

  const yearRangeFilter = state.activeFilters.find(
    (f) => f.type === 'yearRange',
  );
  const { from: fromYear, to: toYear } = parseYearRange(
    yearRangeFilter,
    fromLabel,
    toLabel,
  );

  const rangeMin = state.lastUsedYearRange.min;
  const rangeMax = state.lastUsedYearRange.max;
  const generateYearOptions = (start: number, end: number): Option[] =>
    Array.from({ length: end - start + 1 }, (_, i) => {
      const year = (start + i).toString();
      return { label: year, value: year };
    });

  const fromYearOptions = generateYearOptions(rangeMin, rangeMax);
  const toYearOptions = [...fromYearOptions].reverse();

  function selectedOptionChanged(
    selectedItem: Option | undefined,
    selectVariant: 'from' | 'to',
  ) {
    const yearRangeFilter = state.activeFilters.find(
      (f) => f.type === 'yearRange',
    );

    const { from: fromYear, to: toYear } = parseYearRange(
      yearRangeFilter,
      fromLabel,
      toLabel,
    );

    const newFrom = selectVariant === 'from' ? selectedItem?.value : fromYear;
    const newTo = selectVariant === 'to' ? selectedItem?.value : toYear;

    const hasFrom = !!newFrom;
    const hasTo = !!newTo;

    if (hasFrom || hasTo) {
      const { label, value } = getYearRangeLabelValue(
        newFrom,
        newTo,
        t('start_page.filter.year.from_label'),
        t('start_page.filter.year.to_label'),
      );

      dispatch({
        type: ActionType.ADD_FILTER,
        payload: [
          {
            type: 'yearRange',
            value,
            label,
            index: 0,
          },
        ],
      });
    }

    if (!selectedItem && selectVariant === 'from') {
      if (yearRangeFilter) {
        dispatch({
          type: ActionType.REMOVE_FILTER,
          payload: yearRangeFilter.value,
        });
      }
    }

    if (!selectedItem && selectVariant === 'to') {
      if (fromYear) {
        dispatch({
          type: ActionType.ADD_FILTER,
          payload: [
            {
              type: 'yearRange',
              value: fromYear,
              label: t('start_page.filter.year.from_year', {
                year: fromYear ?? '',
              }),
              index: 0,
            },
          ],
        });
      } else if (yearRangeFilter) {
        dispatch({
          type: ActionType.REMOVE_FILTER,
          payload: yearRangeFilter.value,
        });
      }
    }
  }

  return (
    <div className={cl(styles.filterItem, styles.yearRange)}>
      <SearchSelect
        key={`from-${resetKey}`}
        id="year-from"
        label={t('start_page.filter.year.from_year')}
        options={fromYearOptions}
        selectedOption={
          fromYear ? { label: fromYear, value: fromYear } : undefined
        }
        onSelect={(item) => selectedOptionChanged(item, 'from')}
        inputMode="numeric"
        optionListStyle={{ maxHeight: '250px' }}
      ></SearchSelect>
      <SearchSelect
        key={`to-${resetKey}`}
        id="year-to"
        label={t('start_page.filter.year.to_year')}
        options={toYearOptions}
        selectedOption={toYear ? { label: toYear, value: toYear } : undefined}
        onSelect={(item) => selectedOptionChanged(item, 'to')}
        inputMode="numeric"
        optionListStyle={{ maxHeight: '250px' }}
      ></SearchSelect>
    </div>
  );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onFilterChange,
}) => {
  const { state } = useContext(FilterContext);
  const { t } = useTranslation();

  return (
    <div className={styles.sideBar}>
      <div className={styles.sideBarWrapper}>
        <FilterCategory header={t('start_page.filter.subject')}>
          <ul className={styles.filterList}>
            <RenderSubjects
              firstLevel={true}
              subjects={state.availableFilters.subjectTree}
              onFilterChange={onFilterChange}
            />
          </ul>
        </FilterCategory>
        <FilterCategory header={t('start_page.filter.timeUnit')}>
          <ul className={styles.filterList}>
            <RenderTimeUnitFilters onFilterChange={onFilterChange} />
          </ul>
        </FilterCategory>
        <FilterCategory header={t('start_page.filter.year.title')}>
          <ul className={styles.filterList}>
            <RenderYearsFilters onFilterChange={onFilterChange} />
          </ul>
        </FilterCategory>
      </div>
      <p>
        <a href="/en/table/tab638">Go to table viewer</a>
      </p>
    </div>
  );
};
