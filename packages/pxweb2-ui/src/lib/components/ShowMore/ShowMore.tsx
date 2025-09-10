import React, { type ReactNode, useState, useRef } from 'react';
import cl from 'clsx';

import styles from './ShowMore.module.scss';
import { Icon } from '../Icon/Icon';
import { Label } from '../Typography/Label/Label';

export interface ShowMoreProps {
  header: string;
  children?: ReactNode;
  openByDefault?: boolean;
}

export const ShowMore: React.FC<ShowMoreProps> = ({
  header,
  children,
  openByDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(openByDefault);

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cl(styles.showMore)}>
      <button
        className={cl(styles.header)}
        aria-expanded={isOpen ? 'true' : 'false'}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <Label size="medium">{header}</Label>
        <div className={cl(styles.iconWrapper)}>
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
          styles.content,
          isOpen ? styles['open'] : styles['closed'],
        )}
        inert={!isOpen}
        ref={contentRef}
      >
        {children}
      </div>
    </div>
  );
};

export default ShowMore;
