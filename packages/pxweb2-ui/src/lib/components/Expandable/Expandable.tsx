import React, { type ReactNode, useState } from 'react';
import cl from 'clsx';
import styles from './Expandable.module.scss';
import { Icon } from '../Icon/Icon';

export interface ExpandableProps {
  header?: string;
  children?: ReactNode;
}

export const Expandable: React.FC<ExpandableProps> = ({ header, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cl(styles.expandable)}>
      <button
        className={cl(styles.expandableHeader)}
        aria-expanded={isOpen ? 'true' : 'false'}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={cl(styles.expandableTitle, styles['heading-small'])}>
          {header}
        </span>
        <div className={cl(styles.expandableIconWrapper)}>
          <Icon
            className={cl({
              [styles[`open`]]: isOpen,
            })}
            iconName="ChevronDown"
          />
        </div>
      </button>
      <div
        className={cl(
          styles.expandableContent,
          isOpen ? styles['open'] : styles['closed'],
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Expandable;
