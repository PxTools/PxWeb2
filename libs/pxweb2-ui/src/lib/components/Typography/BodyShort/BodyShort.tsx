import cl from 'clsx';
import classes from './BodyShort.module.scss';

export interface BodyShortProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'medium' | 'small';
  spacing?: boolean;
  align?: 'start' | 'center' | 'end';
  weight?: 'regular' | 'bold';
  textcolor?: 'default' | 'subtle';
  children?: React.ReactNode;
}

export function BodyShort({
  size = 'medium', 
  spacing = false,
  align = 'start',
  weight = 'regular',
  textcolor = 'default',
  children,
  ...rest
}: BodyShortProps) {
 
  return (
    <p 
      className={cl(
        classes.bodyShort,
        classes[size],
        cl({[classes[`spacing-${size}`]]: spacing}),
        cl({[classes[`align-${align}`]]: align}),
        cl({[classes[`weight-${weight}`]]: weight}),
        cl({[classes[`textcolor-${textcolor}`]]: textcolor})
        )}
        {...rest}
        >
        {children}
    </p>
  );
}

export default BodyShort;
