import React, { type ReactNode, useState, useRef } from 'react';
import cl from 'clsx';

import styles from './DetailsSection.module.scss';
import { Icon } from '../Icon/Icon';

export interface DetailsSectionProps {
  header: string;
  children?: ReactNode;
  openByDefault?: boolean;
}

export const DetailsSection: React.FC<DetailsSectionProps> = ({
  header,
  children,
  openByDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(openByDefault);

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cl(styles.detailsSection)}>
      <button
        className={cl(styles.detailsButton)}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span className={cl(styles[`label-medium`], styles['title'])}>
          {header}
        </span>
        <Icon
          className={cl(styles.expandIcon, {
            [styles[`open`]]: isOpen,
          })}
          iconName="ChevronDown"
        />
      </button>
      <div
        className={cl(
          styles.detailsContent,
          isOpen ? styles['open'] : styles['closed'],
        )}
        inert={!isOpen || undefined}
        aria-hidden={!isOpen}
        ref={contentRef}
      >
        {children}
      </div>
    </div>
  );
};

export default DetailsSection;
