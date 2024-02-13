import cl from 'clsx';
import classes from './BodyLong.module.scss';

export interface BodyLongProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'medium' | 'small';
  spacing?: boolean;
  align?: 'start' | 'center' | 'end';
  textcolor?: 'default' | 'subtle';
  weight?: 'regular' | 'bold';
  children: React.ReactNode;
}

export function BodyLong({
  children,
  size = 'medium',
  align = 'start',
  textcolor = 'default',
  weight = 'regular',
  spacing = false,
  ...rest
}: BodyLongProps) {
  return (
    <p
      className={cl(
        classes.bodylong,
        classes[size],
        classes[`align-${align}`],
        classes[`text-color-${textcolor}`],
        classes[`font-weight-${weight}`],
        cl({ [classes[`${size}-spacing`]]: spacing })
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

export default BodyLong;
