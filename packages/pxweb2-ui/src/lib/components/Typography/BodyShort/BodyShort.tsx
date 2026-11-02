import cl from 'clsx';
import classes from './BodyShort.module.scss';

export interface BodyShortProps extends React.HTMLAttributes<HTMLParagraphElement> {
  readonly size?: 'medium' | 'small';
  readonly spacing?: boolean;
  readonly align?: 'start' | 'center' | 'end';
  readonly weight?: 'regular' | 'bold';
  readonly textcolor?: 'default' | 'subtle';
  readonly className?: string;
  readonly children?: React.ReactNode;
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
}: Readonly<BodyShortProps>) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const weightClassExtension = weight === 'regular' ? '' : '-' + weight;

  return (
    <p
      className={
        cl(
          classes.bodyShort,
          classes[`bodyshort-${size}${weightClassExtension}`],
          cl({ [classes[`spacing-${size}`]]: spacing }),
          cl({ [classes[`align-${align}`]]: align }),
          cl({ [classes[`textcolor-${textcolor}`]]: textcolor }),
        ) + cssClasses
      }
      {...rest}
    >
      {children}
    </p>
  );
}

export default BodyShort;
