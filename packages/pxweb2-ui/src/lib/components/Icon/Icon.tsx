import styles from './Icon.module.scss';
import * as Icons from './Icons';

export interface IconProps {
  iconName: keyof typeof Icons;
  className?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

const Icon: React.FC<IconProps> = ({
  iconName,
  className,
  ariaLabel,
  ariaHidden,
}) => {
  const icon = Icons[iconName];

  if (!icon) {
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className + ' ' + styles['icon']}
      fill="currentColor"
      {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
      {...(ariaHidden ? { 'aria-hidden': ariaHidden } : {})}
    >
      {icon}
    </svg>
  );
};

export { Icon };
