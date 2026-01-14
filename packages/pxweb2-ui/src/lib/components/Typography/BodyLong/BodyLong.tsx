import cl from 'clsx';
import classes from './BodyLong.module.scss';

export interface BodyLongProps extends React.HTMLAttributes<HTMLParagraphElement> {
  readonly size?: 'medium' | 'small';
  readonly spacing?: boolean;
  readonly align?: 'start' | 'center' | 'end';
  readonly textcolor?: 'default' | 'subtle';
  readonly weight?: 'regular' | 'bold';
  readonly className?: string;
  readonly as?: React.ElementType;
  readonly children: React.ReactNode;
}

export function BodyLong({
  children,
  size = 'medium',
  align = 'start',
  textcolor = 'default',
  weight = 'regular',
  spacing = false,
  className = '',
  as,
  ...rest
}: BodyLongProps) {
  const Component = as ?? (`p` as React.ElementType);
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const weightClassExtension = weight === 'regular' ? '' : '-' + weight;
  return (
    <Component
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
    </Component>
  );
}

export default BodyLong;
