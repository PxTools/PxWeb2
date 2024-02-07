import cl from 'clsx';
import classes from './BodyShort.module.scss';

/* eslint-disable-next-line */
export interface BodyShortProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'small' | 'medium';
  children?: React.ReactNode;
  spacing?: boolean;
}

export function BodyShort({
  size = 'medium', 
  spacing = false,
  children,
  ...rest
}: BodyShortProps) {
 
  return (
    <p 
      className={cl(
        classes.bodyShort,
        classes[size],
        cl({[classes[`spacing-${size}`]]: spacing})
        )}
        {...rest}
        >
        {children}
    </p>
  );
}

export default BodyShort;
