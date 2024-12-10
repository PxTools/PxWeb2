import cl from 'clsx';
import classes from './BodyLong.module.scss';

export interface BodyLongProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: 'medium' | 'small';
  spacing?: boolean;
  align?: 'start' | 'center' | 'end';
  textcolor?: 'default' | 'subtle';
  weight?: 'regular' | 'bold';
  className?: string;
  children: React.ReactNode;
}

export function BodyLong({
  children,
  size = 'medium',
  align = 'start',
  textcolor = 'default',
  weight = 'regular',
  spacing = false,
  className = '',
  ...rest
}: BodyLongProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const weightClassExtension = weight === 'regular' ? '' : '-' + weight;
  return (
    <p
      className={
        cl(
          classes.bodylong,
          classes[`align-${align}`],
          classes[`text-color-${textcolor}`],
          classes[`bodylong-${size}${weightClassExtension}`],
          cl({ [classes[`${size}-spacing`]]: spacing }),
        ) + cssClasses
      }
      {...rest}
    >
      {children}
    </p>
  );
}

export default BodyLong;
