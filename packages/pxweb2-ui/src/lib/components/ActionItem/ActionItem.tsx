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

function IconWrapper({
  size,
  isLoading,
  iconName,
  largeIconName,
}: {
  size: 'medium' | 'large';
  isLoading: boolean;
  iconName: IconProps['iconName'];
  largeIconName: ActionItemIconProps['largeIconName'];
}) {
  if (isLoading && size === 'medium') {
    return <Spinner size="xsmall" aria-hidden="true" />;
  }

  return (
    <div className={cl(styles[`icon-wrapper-${size}`], styles['icon-wrapper'])}>
      {size === 'medium' ? (
        <Icon iconName={iconName} />
      ) : (
        <ActionItemIcon largeIconName={largeIconName} />
      )}
    </div>
  );
}

interface ActionItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  ariaLabel?: string;
  iconName?: IconProps['iconName'];
  largeIconName?: ActionItemIconProps['largeIconName'];
  onClick?: () => void;
  description?: string;
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
      className={cl(styles['action-item'])}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-disabled={isLoading || rest.disabled}
      aria-busy={isLoading || rest.disabled}
      {...rest}
    >
      <IconWrapper
        size={size}
        isLoading={isLoading}
        iconName={iconName}
        largeIconName={largeIconName}
      />
      <div
        className={cl(
          styles['label-description-wrapper'],
          styles[`icon-label-wrapper-${size}`],
        )}
      >
        <Label size="medium" className={cl(styles['label-hover'])}>
          {label}
        </Label>
        {size === 'medium' && description && (
          <BodyShort>{description}</BodyShort>
        )}
      </div>
    </button>
  );
}
