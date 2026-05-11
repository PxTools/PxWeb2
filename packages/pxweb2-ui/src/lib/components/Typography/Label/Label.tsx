import cl from 'clsx';

import classes from './Label.module.scss';

export interface LabelProps
  extends
    React.LabelHTMLAttributes<HTMLLabelElement | HTMLLegendElement>,
    React.HTMLAttributes<HTMLLabelElement | HTMLLegendElement> {
  size?: 'medium' | 'small';
  textcolor?: 'default' | 'subtle' | 'inherit';
  visuallyHidden?: boolean;
  children?: React.ReactNode;
  className?: string;
  forID?: string;
  as?: React.ElementType;
}

export function Label({
  size = 'medium',
  textcolor = 'default',
  visuallyHidden = false,
  children,
  className = '',
  forID = '',
  as = 'label',
  ...rest
}: LabelProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const Component = as ?? ('label' as React.ElementType);

  return (
    <Component
      className={
        cl(
          classes.label,
          classes[`label-${size}`],
          cl({ [classes[`textcolor-${textcolor}`]]: textcolor }),
          cl({ [classes['visually-hidden']]: visuallyHidden }),
        ) + cssClasses
      }
      {...(forID.length > 0 && as === 'label' ? { htmlFor: forID } : {})}
      {...rest}
    >
      {children}
    </Component>
  );
}

export default Label;
