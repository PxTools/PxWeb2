import cl from 'clsx';
import classes from './BodyShort.module.scss';

export interface BodyShortProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'medium' | 'small';
  spacing?: boolean;
  align?: 'start' | 'center' | 'end';
  children?: React.ReactNode;
}

export function BodyShort({
  size = 'medium', 
  spacing = false,
  align = 'start',
  children,
  ...rest
}: BodyShortProps) {
 
  return (
    <p 
      className={cl(
        classes.bodyShort,
        classes[size],
        cl({[classes[`spacing-${size}`]]: spacing}),
        cl({[classes[`align-${align}`]]: align})
        )}
        {...rest}
        >
        {children}
    </p>
  );
}

export default BodyShort;
