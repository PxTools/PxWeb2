import cl from 'clsx';

import styles from './ActionItem.module.scss';
import {
  ActionItemIcon,
  ActionItemIconProps,
  BodyShort,
  CheckCircleIcon,
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
  readonly size: 'medium' | 'large';
  readonly isLoading: boolean;
  readonly iconName: IconProps['iconName'];
  readonly largeIconName: ActionItemIconProps['largeIconName'];
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
  toggleState?: boolean;
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
  toggleState,
  ...rest
}: Readonly<ActionItemProps>) {
  const hasToggleState = toggleState === true || toggleState === false;
  const ariaLabelText = ariaLabel + (description ? `. ${description}` : '');

  return (
    <button
      className={cl(
        styles['action-item'],
        styles[`action-item-${size}`],
        hasToggleState && styles['toggleable'],
      )}
      role={hasToggleState ? 'switch' : undefined}
      onClick={onClick}
      aria-label={ariaLabelText}
      aria-disabled={isLoading || rest.disabled}
      aria-busy={isLoading || rest.disabled}
      aria-checked={toggleState}
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
      {hasToggleState && (
        <div
          className={cl(
            styles['toggle-wrapper'],
            styles[`toggle-wrapper-${size}`],
          )}
        >
          <CheckCircleIcon checked={toggleState} />
        </div>
      )}
    </button>
  );
}
