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
    <div
      className={cl(styles.actionItem)}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <div className={styles.actionItem}>
        <div className={styles.iconLabelColumn}>
          <div className={styles.iconLabelRow}>
            <div
              className={cl(styles[`iconWrapper-${size}`], styles.iconWrapper)}
            >
              {size === 'medium' ? (
                <Icon iconName={iconName} className={styles.icon} />
              ) : (
                <ActionItemIcon
                  largeIconName={largeIconName}
                  className={styles.icon}
                />
              )}
            </div>
            <Label
              size="medium"
              className={cl(styles[`label-${size}`], styles.label)}
            >
              {ariaLabel}
            </Label>
          </div>
          {description && size === 'medium' && (
            <BodyShort className={styles.bodyShort}>{description}</BodyShort>
          )}
        </div>
      </div>
    </div>
  );
}
