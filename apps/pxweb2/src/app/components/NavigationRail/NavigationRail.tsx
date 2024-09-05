import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { LazyMotion, m, MotionConfig } from 'framer-motion';

import styles from './NavigationRail.module.scss';
import {
  Icon,
  IconProps,
  Label,
  ColorSurfaceDefault,
  ColorSurfaceActionSubtleActive,
  ColorSurfaceActionSubtleHover,
} from '@pxweb2/pxweb2-ui';
import { NavigationItem } from '../../app';

const loadFeatures = () =>
  import('./../../util/animationFeatures').then((res) => res.default);

const springConfig = {
  type: 'spring',
  mass: 1,
  stiffness: 200,
  damping: 30,
};

interface ItemProps {
  label: string;
  parentName: string;
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
  const initialBackgroundColor = selected
    ? ColorSurfaceActionSubtleActive
    : ColorSurfaceDefault;
  const buttonVariants = {
    initial: {
      backgroundColor: initialBackgroundColor,
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
    <LazyMotion features={loadFeatures}>
      <MotionConfig reducedMotion="user">
        <m.button
          className={cl({ [styles.selected]: selected }, styles.item)}
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
      </MotionConfig>
    </LazyMotion>
    // <button
    //   className={cl(styles.item)}
    //   onClick={onClick}
    //   type="button"
    //   id={btnId}
    // >
    //   <div className={cl({ [styles.selected]: selected }, styles.icon)}>
    //     <Icon iconName={icon} />
    //   </div>
    //   <Label htmlFor={btnId}>{label}</Label>
    // </button>
  );
};

interface NavigationRailProps {
  selected: NavigationItem;
  onChange: (newSelected: NavigationItem) => void;
}
export const NavigationRail: React.FC<NavigationRailProps> = ({
  onChange,
  selected,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.navigationRail}>
      <Item
        parentName="navRail"
        label={t('presentation_page.sidemenu.selection.title')}
        selected={selected === 'filter'}
        icon={'Controls'}
        onClick={() => {
          onChange('filter');
        }}
      />
      <Item
        parentName="navRail"
        label={t('presentation_page.sidemenu.view.title')}
        selected={selected === 'view'}
        icon={'BarChart'}
        onClick={() => {
          onChange('view');
        }}
      />
      <Item
        parentName="navRail"
        label={t('presentation_page.sidemenu.edit.title')}
        selected={selected === 'edit'}
        icon={'ArrowsUpDown'}
        onClick={() => {
          onChange('edit');
        }}
      />
      <Item
        parentName="navRail"
        label={t('presentation_page.sidemenu.save.title')}
        selected={selected === 'save'}
        icon={'FloppyDisk'}
        onClick={() => {
          onChange('save');
        }}
      />
      <Item
        parentName="navRail"
        label={t('presentation_page.sidemenu.help.title')}
        selected={selected === 'help'}
        icon={'QuestionMarkCircle'}
        onClick={() => {
          onChange('help');
        }}
      />
    </div>
  );
};

export default NavigationRail;
