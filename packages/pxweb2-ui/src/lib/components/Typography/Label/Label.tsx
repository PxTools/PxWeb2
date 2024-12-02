import cl from 'clsx';

import classes from './Label.module.scss';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement | HTMLLegendElement>,
    React.HTMLAttributes<HTMLLabelElement | HTMLLegendElement> {
  size?: 'medium' | 'small';
  textcolor?: 'default' | 'subtle';
  visuallyHidden?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function Label({
  size = 'medium',
  textcolor = 'default',
  visuallyHidden = false,
  children,
  className = '',
  ...rest
}: LabelProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  return (
    <label
      className={cl(
        classes.label,
        classes[`label-${size}`],
        cl({ [classes[`textcolor-${textcolor}`]]: textcolor }),
        cl({ [classes['visually-hidden']]: visuallyHidden })
      ) + cssClasses}
      {...rest}
    >
      {children}
    </label>
  );
}

export default Label;
