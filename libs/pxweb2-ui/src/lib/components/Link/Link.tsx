import React from 'react';
import classes from './Link.module.scss';
import cl from 'clsx';
import { Icon, IconProps } from '../Icon/Icon';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: IconProps['iconName'];
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  href: string;
  inline?:boolean;
  noUnderline?:boolean
}
export function Link({
  children,
  href,
  icon,
  iconPosition,
  inline=false,
  noUnderline=false,
  ...rest
}: LinkProps) {
  return (
    <a href={href} className={cl(classes.link, {
      [classes.no_underline]: noUnderline,[classes.inline]: inline
    })}   >
      {icon && iconPosition === 'left' && (
        <Icon iconName={icon} className={cl({[classes.link_inline_svg]:inline})}></Icon>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <Icon iconName={icon} className={cl({[classes.link_inline_svg]:inline})}></Icon>
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
