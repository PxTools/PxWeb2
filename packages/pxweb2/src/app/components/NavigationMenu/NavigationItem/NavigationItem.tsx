import cl from 'clsx';
import { m } from 'motion/react';
import { forwardRef, MouseEvent } from 'react';

import { Icon, IconProps, Label } from '@pxweb2/pxweb2-ui';
import styles from './NavigationItem.module.scss';

// Framer Motion spring animation configuration
const springConfig = {
  type: 'spring',
  mass: 1,
  stiffness: 200,
  damping: 30,
};

interface ItemProps {
  label: string;
  parentName: 'navBar' | 'navRail';
  selected: boolean;
  icon: IconProps['iconName'];
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const Item = forwardRef<HTMLButtonElement, ItemProps>(
  ({ label, parentName, selected, icon, onClick }, ref) => {
    const btnId = 'px-' + parentName + '-' + label;
    const initialBaseBackgroundColor =
      parentName === 'navBar'
        ? 'var(--px-color-surface-subtle)'
        : 'var(--px-color-surface-default)';
    const initialBackgroundColor = selected
      ? 'var(--px-color-surface-action-subtle-active)'
      : initialBaseBackgroundColor;
    const buttonVariants = {
      initial: {
        backgroundColor: initialBackgroundColor, // TODO: Fix bug, initial color flashes when clicking a selected button
        transition: springConfig,
      },
      hover: {
        backgroundColor: [
          initialBackgroundColor,
          'var(--px-color-surface-action-subtle-hover)',
        ],
        transition: springConfig,
      },
      pressed: {
        backgroundColor: [
          'var(--px-color-surface-action-subtle-hover)',
          'var(--px-color-surface-action-subtle-active)',
        ],
        transition: springConfig,
      },
    };

    return (
      <li className={cl(styles.navigationBarListItem, styles.fadein)}>
        <m.button
          ref={ref}
          className={cl(
            { [styles.selected]: selected },
            styles.item,
            styles[`${parentName}Item`],
          )}
          onClick={(event) => onClick(event)}
          type="button"
          id={btnId}
          aria-expanded={selected}
          // Framer Motion animations
          key={selected.toString()} // Needed by motion to re-run the animation when the selected state changes, toString for type compatibility
          initial={'initial'}
          whileHover={'hover'}
          whileTap={'pressed'}
        >
          <m.div
            className={cl(styles.icon)}
            // Framer Motion animations
            variants={buttonVariants}
          >
            <Icon iconName={icon} />
          </m.div>
          <Label htmlFor={btnId}>{label}</Label>
        </m.button>
      </li>
    );
  },
);
