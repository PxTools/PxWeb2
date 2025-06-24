import cl from 'clsx';

import { ActionType } from '../../pages/StartPage/StartPageTypes';
import styles from './FilterSidebar.module.scss';
import { useTranslation } from 'react-i18next';
import { Checkbox, FilterCategory, Button } from '@pxweb2/pxweb2-ui';
import {
  PathItem,
  findAncestors,
  findChildren,
} from '../../util/startPageFilters';
import { FilterContext } from '../../context/FilterContext';
import { ReactNode, useContext, useState } from 'react';

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
  const subjectId = subject.id;
  const subjectLabel = subject.label;
  const subjectTree = state.availableFilters.subjectTree;

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
            id={subjectId + index}
            text={`${subjectLabel} (${count})`}
            value={isActive}
            subtle={!isActive && count === 0}
            onChange={(value) => {
              setIsOpen(true);
              const ancestors = findAncestors(subjectTree, subjectId);
              const children = findChildren(subjectTree, subjectId);

              if (value) {
                // If subject has children, add the subject itself
                dispatch({
                  type: ActionType.ADD_FILTER,
                  payload: [
                    {
                      type: 'subject',
                      value: subjectId,
                      label: subjectLabel,
                      index,
                    },
                  ],
                });

                // If the subject has children, we remove all ancestors from filter
                for (const ancestor of ancestors) {
                  const isAncestorInFilter = state.activeFilters.some(
                    (f) => f.type === 'subject' && f.value === ancestor.id,
                  );
                  if (isAncestorInFilter) {
                    dispatch({
                      type: ActionType.REMOVE_FILTER,
                      payload: ancestor.id,
                    });
                  }
                }
              } else {
                //Remove subject and all its descendants from filter
                const descendants = [subject, ...children];

                for (const d of descendants) {
                  dispatch({
                    type: ActionType.REMOVE_FILTER,
                    payload: d.id,
                  });
                }

                // If no children are selected, we add the closest ancestor that has remaining selected children
                for (let i = ancestors.length - 1; i >= 0; i--) {
                  const ancestor = ancestors[i];
                  const remainingSelectedChildren = findChildren(
                    subjectTree,
                    ancestor.id,
                  ).filter((child) =>
                    state.activeFilters.some(
                      (f) => f.type === 'subject' && f.value === child.id,
                    ),
                  );
                  if (remainingSelectedChildren.length > 0) {
                    dispatch({
                      type: ActionType.ADD_FILTER,
                      payload: [
                        {
                          type: 'subject',
                          value: ancestor.id,
                          label: ancestor.label,
                          index,
                        },
                      ],
                    });
                    break;
                  }
                }
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
    const descendants = findChildren(
      state.availableFilters.subjectTree,
      subject.id,
    );
    const isChecked =
      state.activeFilters.some(
        (f) => f.type === 'subject' && f.value === subject.id,
      ) ||
      descendants.some((d) =>
        state.activeFilters.some(
          (f) => f.type === 'subject' && f.value === d.id,
        ),
      );

    const count = subject.count ?? 0;

    return (
      <div key={subject.id} className={cl(!firstLevel && styles.toggleIndent)}>
        <Collapsible
          subject={subject}
          index={index}
          count={count}
          isActive={isChecked}
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

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onFilterChange,
}) => {
  const { state } = useContext(FilterContext);
  const { t } = useTranslation();

  return (
    <div className={styles.sideBar}>
      <div>
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
      </div>
      <p>
        <a href="/en/table/tab638">Go to table viewer</a>
      </p>
    </div>
  );
};
