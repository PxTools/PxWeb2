import styles from './ActionItemIcon.module.scss';
import * as ActionItemIcons from './ActionItemIcons';

export interface ActionItemIconProps {
  largeIconName: keyof typeof ActionItemIcons;
  className?: string;
  ariaLabel?: string;
}

const ActionItemIcon: React.FC<ActionItemIconProps> = ({
  largeIconName,
  className,
  ariaLabel,
}) => {
  const actionItemIcon = ActionItemIcons[largeIconName];

  if (!actionItemIcon) {
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 44 44"
      className={className + ' ' + styles['actionItemIcon']}
      fill="currentColor"
      {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
    >
      {actionItemIcon}
    </svg>
  );
};

export { ActionItemIcon };
