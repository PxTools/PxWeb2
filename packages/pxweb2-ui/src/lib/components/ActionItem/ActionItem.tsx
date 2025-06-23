import cl from 'clsx';
import styles from './ActionItem.module.scss';
import {
  BodyShort,
  Icon,
  IconProps,
  ActionItemIcon,
  ActionItemIconProps,
  Label,
} from '@pxweb2/pxweb2-ui';

interface ActionItemProps {
  ariaLabel?: string;
  iconName?: IconProps['iconName'];
  largeIconName?: ActionItemIconProps['largeIconName'];
  onClick?: () => void;
  description?: string;
  control?: boolean;
  size?: 'medium' | 'large';
}

export function ActionItem({
  ariaLabel = '',
  iconName = 'BarChart',
  largeIconName = 'Table',
  onClick,
  size = 'medium',
  description,
}: Readonly<ActionItemProps>) {
  return (
    <button
      className={cl(styles.actionItem)}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      {size === 'medium' && (
        <>
          <div
            className={cl(styles[`iconWrapper-${size}`], styles.iconWrapper)}
          >
            <Icon iconName={iconName} />
          </div>
          <div className={styles.labelDescriptionWrapper}>
            <Label size="medium" className={cl(styles.labelHover)}>
              {ariaLabel}
            </Label>
            {description && <BodyShort>{description}</BodyShort>}
          </div>
        </>
      )}

      {size === 'large' && (
        <div className={cl(styles[`iconLabelWrapper-${size}`])}>
          <div
            className={cl(styles[`iconWrapper-${size}`], styles.iconWrapper)}
          >
            <ActionItemIcon largeIconName={largeIconName} />
          </div>
          <div className={styles.labelBodyWrapper}>
            <Label size="medium" className={cl(styles.labelHover)}>
              {ariaLabel}
            </Label>
          </div>
        </div>
      )}
    </button>
  );
}
