import styles from './Icon.module.scss';
import * as Icons from './Icons';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  iconName: keyof typeof Icons;
  className?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

const Icon: React.FC<IconProps> = ({
  iconName,
  className = '',
  ariaLabel,
  ariaHidden,
  ...rest
}) => {
  const icon = Icons[iconName];
  const cssClasses = className.length > 0 ? ' ' + className : '';

  if (!icon) {
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={styles['icon'] + cssClasses}
      fill="currentColor"
      {...(ariaLabel ? { 'aria-label': ariaLabel } : {})}
      {...(ariaHidden ? { 'aria-hidden': ariaHidden } : {})}
      {...rest}
    >
      {icon}
    </svg>
  );
};

export { Icon };
