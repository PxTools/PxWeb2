import cl from 'clsx';

import { ActionType } from '../../pages/StartPage/StartPageTypes';
import styles from './FilterSidebar.module.scss';
import { useTranslation } from 'react-i18next';
import { Checkbox, FilterCategory, Button } from '@pxweb2/pxweb2-ui';
import { PathItem, findParent } from '../../util/startPageFilters';
import { FilterContext } from '../../context/FilterContext';
import { ReactNode, useContext, useState } from 'react';

interface CollapsibleProps {
  subject: PathItem;
  index: number;
  count: number;
  isActive: boolean;
  children: ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  subject,
  index,
  count,
  isActive,
  children,
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

                // TODO: Mark parent as indeterminate in UI if needed

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
}> = ({ firstLevel, subjects }) => {
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
        >
          {subject.children && (
            <RenderSubjects firstLevel={false} subjects={subject.children} />
          )}
        </Collapsible>
      </div>
    );
  });
};

const RenderTimeUnitFilters: React.FC = () => {
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
          }}
        />
      </li>
    );
  });
};

export const FilterSidebar: React.FC = () => {
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
            />
          </ul>
        </FilterCategory>
        <FilterCategory header={t('start_page.filter.timeUnit')}>
          <ul className={styles.filterList}>
            <RenderTimeUnitFilters />
          </ul>
        </FilterCategory>
      </div>
      <p>
        <a href="/en/table/tab638">Go to table viewer</a>
      </p>
    </div>
  );
};
