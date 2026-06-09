import clsx from 'clsx';

import classes from './Badge.module.scss';

interface Badge {
  readonly variant?: 'default' | 'subtle';
  readonly color?: 'neutral' | 'info' | 'success' | 'warning' | 'error';
  readonly size?: 'medium' | 'large';
  readonly label?: string;
}

export function Badge({
  variant = 'default',
  color = 'neutral',
  size = 'medium',
  label,
}: Badge) {
  const withoutLabel = !label || label.trim() === '';

  return (
    <span
      className={clsx(
        classes['badge'],
        classes[`color-${color}`],
        classes[`size-${size}`],
        classes[`variant-${variant}`],
        { [classes['no-label']]: withoutLabel },
      )}
      inert
    >
      {label && <span className={classes['label-medium']}>{label}</span>}
    </span>
  );
}

export default Badge;
