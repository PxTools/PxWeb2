import cl from 'clsx';
import classes from './Ingress.module.scss';
import React from 'react';

export interface IngressProps extends React.HTMLAttributes<HTMLParagraphElement> {
  readonly children: React.ReactNode;
  readonly spacing?: boolean;
  readonly align?: 'start' | 'center' | 'end';
  readonly textcolor?: 'default' | 'subtle';
  readonly weight?: 'regular' | 'bold';
}

export function Ingress({
  spacing = false,
  align = 'start',
  textcolor = 'default',
  weight = 'regular',
  children,
  className = '',
  ...rest
}: Readonly<IngressProps>) {
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
