import cl from 'clsx';
import classes from './Heading.module.scss';
import React from 'react';

/* eslint-disable-next-line */
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement>{
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'
  level?: "1" | "2" | "3" | "4" | "5" | "6";
  spacing?: boolean;
  children: string;
  as?: React.ElementType;
}

export function Heading({
  size = 'medium',
  level = '1',
  children,
  spacing = true,
  as,
  ...rest
}: HeadingProps) {
   const Component = as ?? (`h${level}` as React.ElementType);
   return (
    <Component 
    className={cl(
      classes.heading,
      classes[size],
      {[classes.spacing]: spacing}
    )}
    {...rest}
    >
      {children}
    </Component>
  );
}

export default Heading;
