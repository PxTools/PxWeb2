import clsx from 'clsx';

import classes from './Tag.module.scss';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'medium' | 'small' | 'xsmall';
  variant?: 'default' | 'border';
  color?:
    | 'subtle'
    | 'neutral'
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'error-subtle';
  children?: React.ReactNode;
}

export function Tag({
  size = 'medium',
  variant = 'default',
  color = 'neutral',
  children,
  className,
  ...rest
}: TagProps) {
  const textStyle = size === 'medium' ? 'label-medium' : 'label-small';

  return (
    <span
      className={clsx(
        classes.tag,
        classes[`size-${size}`],
        classes[`color-${color}`],
        classes[`variant-${variant}`],
        classes[textStyle],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export default Tag;
