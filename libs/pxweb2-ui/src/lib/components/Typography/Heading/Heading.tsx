import React from 'react';
import cl from 'clsx';

import classes from './Heading.module.scss';

/* eslint-disable-next-line */
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
  level?: '1' | '2' | '3' | '4' | '5' | '6';
  align?: 'start' | 'center' | 'end';
  textcolor?: 'default' | 'subtle';
  spacing?: boolean;
  children: string;
  as?: React.ElementType;
}

export function Heading({
  size = 'medium',
  level = '1',
  align = 'start',
  textcolor = 'default',
  children,
  spacing = false,
  as,
  ...rest
}: HeadingProps) {
  const Component = as ?? (`h${level}` as React.ElementType);
  return (
    <Component
      className={cl(
        classes.heading,
        classes[size],
        { [classes.spacing]: spacing },
        classes[`align-${align}`],
        classes[`text-color-${textcolor}`]
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Heading;
