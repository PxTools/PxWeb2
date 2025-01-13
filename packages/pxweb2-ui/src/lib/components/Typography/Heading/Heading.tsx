import React from 'react';
import cl from 'clsx';

import classes from './Heading.module.scss';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
  level?: '1' | '2' | '3' | '4' | '5' | '6';
  align?: 'start' | 'center' | 'end';
  textcolor?: 'default' | 'subtle';
  spacing?: boolean;
  children: string | React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

export function Heading({
  size = 'medium',
  level = '1',
  align = 'start',
  textcolor = 'default',
  children,
  spacing = false,
  className = '',
  as,
  ...rest
}: HeadingProps) {
  const Component = as ?? (`h${level}` as React.ElementType);
  const cssClasses = className.length > 0 ? ' ' + className : '';

  return (
    <Component
      className={
        cl(
          classes.heading,
          classes[size],
          classes[`heading-${size}`],
          { [classes.spacing]: spacing },
          classes[`align-${align}`],
          classes[`text-color-${textcolor}`],
        ) + cssClasses
      }
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Heading;
