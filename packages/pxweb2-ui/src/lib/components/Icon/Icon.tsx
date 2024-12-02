import styles from './Icon.module.scss';
import * as Icons from './Icons';

/* eslint-disable-next-line */
export interface IconProps {
  iconName: keyof typeof Icons;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ iconName, className }) => {
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
    >
      {icon}
    </svg>
  );
};

export { Icon };
