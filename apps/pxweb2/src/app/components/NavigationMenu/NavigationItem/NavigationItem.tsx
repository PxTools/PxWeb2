import cl from 'clsx';
import { m } from 'framer-motion';

import {
  Icon,
  IconProps,
  Label,
  ColorSurfaceDefault,
  ColorSurfaceSubtle,
  ColorSurfaceActionSubtleActive,
  ColorSurfaceActionSubtleHover,
} from '@pxweb2/pxweb2-ui';
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
  onClick: () => void;
}
export const Item: React.FC<ItemProps> = ({
  label,
  parentName,
  selected,
  icon,
  onClick,
}) => {
  const btnId = 'px-' + parentName + '-' + label;
  const initialBaseBackgroundColor =
    parentName === 'navBar' ? ColorSurfaceSubtle : ColorSurfaceDefault;
  const initialBackgroundColor = selected
    ? ColorSurfaceActionSubtleActive
    : initialBaseBackgroundColor;
  const buttonVariants = {
    initial: {
      backgroundColor: initialBackgroundColor, // TODO: Fix bug, initial color flashes when clicking a selected button
      transition: springConfig,
    },
    hover: {
      backgroundColor: [initialBackgroundColor, ColorSurfaceActionSubtleHover],
      transition: springConfig,
    },
    pressed: {
      backgroundColor: [
        ColorSurfaceActionSubtleHover,
        ColorSurfaceActionSubtleActive,
      ],
      transition: springConfig,
    },
  };

  return (
    <m.button
      className={cl(
        { [styles.selected]: selected },
        styles.item,
        styles[`${parentName}Item`]
      )}
      onClick={onClick}
      type="button"
      id={btnId}
      // Framer Motion animations
      key={selected.toString()} // Needed by framer-motion to re-run the animation when the selected state changes, toString for type compatibility
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
  );
};
