import cl from 'clsx';
import classes from './Ingress.module.scss';
import React from 'react';

export interface IngressProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  spacing?: boolean;
  align?: 'start' | 'center' | 'end';
  textcolor?: 'default' | 'subtle';
  weight?: 'regular' | 'bold';
}

export function Ingress({
  spacing = false,
  align = 'start',
  textcolor = 'default',
  weight = 'regular',
  children,
  className = '',
  ...rest
}: IngressProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  return (
    <p
      className={
        cl(
          classes.ingress,
          classes[`align-${align}`],
          spacing ? classes.spacing : '',
          cl({ [classes[`text-color-${textcolor}`]]: textcolor }),
          cl({ [classes[`weight-${weight}`]]: weight }),
        ) + cssClasses
      }
      {...rest}
    >
      {children}
    </p>
  );
}

export default Ingress;
