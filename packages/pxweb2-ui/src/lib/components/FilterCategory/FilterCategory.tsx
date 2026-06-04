import { Activity, type ReactNode, useState, useRef } from 'react';
import cl from 'clsx';

import styles from './FilterCategory.module.scss';
import { Icon } from '../Icon/Icon';
import { Heading } from '../Typography/Heading/Heading';
import { Badge } from '../Badge/Badge';

interface FilterCategoryProps {
  readonly header: string;
  readonly openByDefault?: boolean;
  readonly activeFiltersCount?: number;
  readonly children?: ReactNode;
}

export function FilterCategory({
  header,
  openByDefault = false,
  activeFiltersCount = 0,
  children,
}: FilterCategoryProps) {
  const [isOpen, setIsOpen] = useState(openByDefault);
  const hasActiveFilters = activeFiltersCount > 0;

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cl(styles.filterCategory)}>
      <div
        role="button"
        className={cl(styles.filterCategoryHeader)}
        aria-expanded={isOpen ? 'true' : 'false'}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        tabIndex={0}
      >
        <Heading size="small" level="3" className={styles.filterCategoryTitle}>
          {header}
        </Heading>

        <Activity mode={hasActiveFilters ? 'visible' : 'hidden'}>
          <Badge
            label={activeFiltersCount.toString()}
            variant="subtle"
            color="info"
            size="medium"
          />
        </Activity>

        <span className={cl(styles.filterCategoryIconWrapper)}>
          <Icon
            className={cl({
              [styles[`open`]]: isOpen,
            })}
            iconName="ChevronDown"
          />
        </span>
      </div>
      <div
        className={cl(
          styles.filterCategoryContent,
          isOpen ? styles['open'] : styles['closed'],
        )}
        inert={!isOpen}
        ref={contentRef}
      >
        {children}
      </div>
    </div>
  );
}

export default FilterCategory;
