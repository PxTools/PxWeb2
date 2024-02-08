import cl from 'clsx';
import classes from './BodyShort.module.scss';

/* eslint-disable-next-line */
export interface BodyShortProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'medium' | 'small';
  children?: React.ReactNode;
  spacing?: boolean;
  align?: 'left' | 'center' | 'right';
}

export function BodyShort({
  size = 'medium', 
  spacing = false,
  align = 'left',
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
