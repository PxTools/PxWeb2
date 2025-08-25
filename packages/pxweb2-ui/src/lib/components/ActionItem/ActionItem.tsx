import cl from 'clsx';

import styles from './ActionItem.module.scss';
import {
  ActionItemIcon,
  ActionItemIconProps,
  BodyShort,
  Icon,
  IconProps,
  Label,
  Spinner,
} from '@pxweb2/pxweb2-ui';

interface ActionItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  ariaLabel?: string;
  iconName?: IconProps['iconName'];
  largeIconName?: ActionItemIconProps['largeIconName'];
  onClick?: () => void;
  description?: string;
  control?: boolean;
  size?: 'medium' | 'large';
  isLoading?: boolean;
}

export function ActionItem({
  label = '',
  ariaLabel = label,
  iconName = 'BarChart',
  largeIconName = 'Table',
  onClick,
  size = 'medium',
  description,
  isLoading = false,
  ...rest
}: Readonly<ActionItemProps>) {
  return (
    <button
      className={cl(styles.actionItem)}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-disabled={isLoading || rest.disabled}
      aria-busy={isLoading || rest.disabled}
      {...rest}
    >
      {size === 'medium' && (
        <>
          {isLoading ? (
            <Spinner size="xsmall" aria-hidden="true" />
          ) : (
            <div
              className={cl(styles[`iconWrapper-${size}`], styles.iconWrapper)}
            >
              <Icon iconName={iconName} />
            </div>
          )}
          <div className={styles.labelDescriptionWrapper}>
            <Label size="medium" className={cl(styles.labelHover)}>
              {label}
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
              {label}
            </Label>
          </div>
        </div>
      )}
    </button>
  );
}
