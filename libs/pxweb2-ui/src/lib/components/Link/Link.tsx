import React from 'react';
import classes from './Link.module.scss';
import { Icon, IconProps } from '../Icon/Icon';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: IconProps['iconName'];
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  href: string;
}
export function Link({
  children,
  href,
  icon,
  iconPosition,
  ...rest
}: LinkProps) {
  return (
    <a href={href} className={classes.link}>
      {icon && iconPosition === 'left' && (
        <Icon iconName={icon} className=""></Icon>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <Icon iconName={icon} className=""></Icon>
      )}
    </a>
  );
}

// export const Link: React.FC<LinkProps> = ({ children, href }) => {
//   return (
//     <a href={href} className={styles.link}>
//       {children}
//     </a>
//   );
// };

export default Link;
