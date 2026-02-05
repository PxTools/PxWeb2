import React from 'react';
import cl from 'clsx';

import styles from './CheckCircle.module.scss';
import { CheckCircleIcon } from './CheckCircleIcon';

export interface CheckCircleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange'
> {
  checked: boolean;
  label: string;
  onChange?: (nextChecked: boolean) => void;
  ref?: React.Ref<HTMLButtonElement>;
}
export const CheckCircleToggle = ({
  checked,
  label,
  onChange,
  onClick,
  ref,
  ...rest
}: Readonly<CheckCircleProps>) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) {
      return;
    }
    onChange?.(!checked);
  };

  return (
    <button
      ref={ref}
      className={cl(styles.checkCircle, {
        [styles.checked]: checked,
      })}
      role="switch"
      type="button"
      aria-checked={checked}
      onClick={handleClick}
      {...rest}
    >
      <CheckCircleIcon checked={checked} />
      <div className={styles.labelWrapper}>
        <span className={styles['bodyshort-medium']}>{label}</span>
      </div>
    </button>
  );
};
