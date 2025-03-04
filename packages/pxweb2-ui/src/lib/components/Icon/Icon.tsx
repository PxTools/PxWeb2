import styles from './Icon.module.scss';
import * as Icons from './Icons';

export interface IconProps {
  iconName: keyof typeof Icons;
  className?: string;
  ariaLabel?: string;
}

const Icon: React.FC<IconProps> = ({ iconName, className, ariaLabel }) => {
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
    >
      {icon}
    </svg>
  );
};

export { Icon };
