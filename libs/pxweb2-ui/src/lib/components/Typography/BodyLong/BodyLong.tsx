import cl from 'clsx';
import classes from './BodyLong.module.scss';

export interface BodyLongProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'medium' | 'small';
  spacing?: boolean;
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
}

export function BodyLong({
  children,
  size = 'medium',
  align = 'start',
  spacing = false,
  ...rest
}: BodyLongProps) {
  return (
    <p
      className={cl(
        classes.bodylong,
        classes[size],
        classes[`align-${align}`],
        cl({ [classes[`${size}-spacing`]]: spacing })
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

export default BodyLong;
