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
import { useTranslation } from 'react-i18next';

interface ActionItemProps {
  ariaLabel?: string;
  iconName?: IconProps['iconName'];
  largeIconName?: ActionItemIconProps['largeIconName'];
  onClick?: () => void;
  description?: string;
  checked?: boolean;
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
  const { t } = useTranslation();

  return (
    <div
      className={cl(styles.actionItem)}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel || t('actionItem.ariaLabel')}
      onClick={onClick}
    >
      {size === 'medium' && (
        <div className={cl(styles[`iconWrapper-${size}`], styles.iconWrapper)}>
          <Icon iconName={iconName} className={styles.icon} />
        </div>
      )}
      {size === 'large' && (
        <div className={cl(styles[`iconWrapper-${size}`], styles.iconWrapper)}>
          <ActionItemIcon
            largeIconName={largeIconName}
            className={styles.icon}
          />
        </div>
      )}
      <div className={styles.labelBodyWrapper}>
        <Label
          size="medium"
          className={cl(styles[`label-${size}`], styles.label)}
        >
          {ariaLabel || t('actionItem.label')}
        </Label>
        {size === 'medium' && description && (
          <BodyShort className={styles.bodyShort}>{description}</BodyShort>
        )}
      </div>
    </div>
  );
}
