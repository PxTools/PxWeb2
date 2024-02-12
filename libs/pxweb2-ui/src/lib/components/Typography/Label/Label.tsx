import cl from 'clsx';
import classes from './Label.module.scss';

export interface LabelProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'medium' | 'small';
  align?: 'start' | 'center' | 'end';
  textcolor?: 'default' | 'subtle';
  visuallyHidden?: boolean;
  children?: React.ReactNode;
}

export function Label({
  size = 'medium', 
  align = 'start',
  textcolor = 'default',
  visuallyHidden = false,
  children,
  ...rest
}: LabelProps) {
  return (
    <p 
      className={cl(
        classes.label,
        classes[size],
        cl({[classes[`align-${align}`]]: align}),
        cl({[classes[`textcolor-${textcolor}`]]: textcolor}),
        cl({[classes['visually-hidden']]: visuallyHidden})
        )}
        {...rest}
        >
        {children}
    </p>
  );
}

export default Label;
