import React, { useState, useRef } from 'react';
import cl from 'clsx';
import styles from './FilterCategory.module.scss';
import { Icon } from '../Icon/Icon';

export interface FilterCategoryProps {
  header?: string;
  children?: React.ReactNode;
  openByDefault?: boolean;
}

export const FilterCategory: React.FC<FilterCategoryProps> = ({
  header,
  children,
  openByDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(openByDefault);
  const contentRef = useRef<HTMLDivElement>(null);
  const [heightStyle, setHeightStyle] = useState<'0px' | string>(
    openByDefault ? 'auto' : '0px',
  );

  const toggleOpen = () => {
    if (!contentRef.current) {
      return;
    }

    if (isOpen) {
      const height = contentRef.current.scrollHeight;
      setHeightStyle(`${height}px`);
      requestAnimationFrame(() => {
        setHeightStyle('0px');
      });
    } else {
      setHeightStyle('0px');
      requestAnimationFrame(() => {
        const height = contentRef.current?.scrollHeight;
        setHeightStyle(`${height}px`);
      });
    }

    setIsOpen(!isOpen);
  };

  const handleTransitionEnd = () => {
    if (isOpen) {
      setHeightStyle('auto');
    }
  };

  return (
    <div className={styles.filterCategory}>
      <button
        className={styles.filterCategoryHeader}
        aria-expanded={isOpen}
        onClick={toggleOpen}
      >
        <span
          className={cl(styles.filterCategoryTitle, styles['heading-small'])}
        >
          {header}
        </span>
        <div className={styles.filterCategoryIconWrapper}>
          <Icon
            className={cl({ [styles.open]: isOpen })}
            iconName="ChevronDown"
          />
        </div>
      </button>
      <div
        ref={contentRef}
        className={cl(
          styles.filterCategoryContent,
          isOpen ? styles['open'] : styles['closed'],
        )}
        onTransitionEnd={handleTransitionEnd}
        style={{
          overflow: 'hidden',
          height: heightStyle,
          transition: heightStyle !== 'auto' ? 'height 0.3s ease' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default FilterCategory;
