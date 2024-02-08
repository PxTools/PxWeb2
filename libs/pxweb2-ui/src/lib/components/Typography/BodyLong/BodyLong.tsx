import cl from 'clsx';
import classes from './BodyLong.module.scss';

export interface BodyLongProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'small' | 'medium';
  spacing?: boolean;
  children: React.ReactNode;
}

export function BodyLong({
  children,
  size = 'medium',
  spacing = false,
  ...rest
}: BodyLongProps) {
  return (
    <p
      className={cl(
        classes.bodylong,
        classes[size],
        cl({ [classes[`${size}-spacing`]]: spacing })
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

export default BodyLong;
