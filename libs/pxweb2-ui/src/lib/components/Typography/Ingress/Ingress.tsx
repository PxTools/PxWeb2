import cl from 'clsx';
import classes from './Ingress.module.scss';
import React from 'react';

export interface IngressProps 
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;  
  spacing?: boolean;
  align?: 'start' | 'center' | 'end';
  textcolor?: 'default' | 'subtle';  
}

export function Ingress({
  spacing = false,
  align = 'start',
  textcolor = 'default',
  children,
  ...rest
}: IngressProps) { return (
  <p
    className={cl(
      classes[`align-${align}`],      
      cl({[classes[`text-color-${textcolor}`]]: textcolor})      
    )}
    {...rest}
  >
    {children}
  </p>
);
}

export default Ingress;