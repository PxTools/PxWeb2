import cl from 'clsx';
import classes from './BodyShort.module.scss';

export interface BodyShortProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'medium' | 'small';
  spacing?: boolean;
  align?: 'start' | 'center' | 'end';
  weight?: 'regular' | 'bold';
  textcolor?: 'default' | 'subtle';
  className?: string;
  children?: React.ReactNode;
}

export function BodyShort({
  size = 'medium', 
  spacing = false,
  align = 'start',
  weight = 'regular',
  textcolor = 'default',
  children,
  className = '',
  ...rest
}: BodyShortProps) {

  const cssClasses = className.length > 0 ? ' ' + className : '';

  return (
    <p 
      className={cl(
        classes.bodyShort,
        classes[size],
        cl({[classes[`spacing-${size}`]]: spacing}),
        cl({[classes[`align-${align}`]]: align}),
        cl({[classes[`weight-${weight}`]]: weight}),
        cl({[classes[`textcolor-${textcolor}`]]: textcolor})
        ) + cssClasses}
        {...rest}
        >
        {children}
    </p>
  );
}

export default BodyShort;
