import { Activity, type ReactNode, useState, useRef } from 'react';
import cl from 'clsx';

import styles from './FilterCategory.module.scss';
import { Icon } from '../Icon/Icon';
import { Heading } from '../Typography/Heading/Heading';
import { Badge } from '../Badge/Badge';

interface FilterCategoryProps {
  readonly header: string;
  readonly screenReaderTxt: string;
  readonly openByDefault?: boolean;
  readonly activeFiltersCount?: number;
  readonly children?: ReactNode;
}

export function FilterCategory({
  header,
  screenReaderTxt,
  openByDefault = false,
  activeFiltersCount = 0,
  children,
}: FilterCategoryProps) {
  const [isOpen, setIsOpen] = useState(openByDefault);
  const hasActiveFilters = activeFiltersCount > 0;

  const contentRef = useRef<HTMLDivElement>(null);
  const subjectId = header.replace(/\s+/g, '-').toLowerCase();

  // Unique ID for screen reader description, includes activeFiltersCount to ensure it updates when the count changes
  // (Safari needs this to properly announce changes in the number of active filters,
  // otherwise it is stuck on "1 active filter" even when the count changes)
  const subjectSRDescriptionId = `${subjectId}-description-id-${activeFiltersCount}`;
  const subjectHeadingId = `${subjectId}-heading-id`;

  return (
    <div className={cl(styles.filterCategory)}>
      <span
        id={subjectSRDescriptionId}
        className={styles['sr-only']}
        aria-hidden={true}
      >
        {hasActiveFilters ? screenReaderTxt : ''}
      </span>

      <div
        role="button"
        className={cl(styles.filterCategoryHeader)}
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-labelledby={subjectHeadingId} // Needed for proper screen reader announcement in Safari. Without this it also reads the number inside Badge.
        aria-describedby={subjectSRDescriptionId} // Associate the screen reader description with the header
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        tabIndex={0}
      >
        <Heading
          id={subjectHeadingId}
          size="small"
          level="3"
          className={styles.filterCategoryTitle}
        >
          {header}
        </Heading>

        <Activity
          mode={hasActiveFilters ? 'visible' : 'hidden'}
          aria-hidden="true"
        >
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
