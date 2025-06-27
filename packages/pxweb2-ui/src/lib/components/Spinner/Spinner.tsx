import cl from 'clsx';
import classes from './Spinner.module.scss';

export interface SpinnerProps {
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'default' | 'inverted';
  label?: string;
}

export function Spinner({
  size = 'medium',
  variant = 'default',
  label,
  ...rest
}: Readonly<SpinnerProps>) {
  let Eclipse = null;
  let Width = '';
  let Height = '';
  let Radius = '';
  let StrokeWidth = '';

  switch (size) {
    case 'xlarge':
      Width = '88px';
      Height = '88px';
      Radius = '22.5';
      StrokeWidth = '4.54';
      break;
    case 'large':
      Width = '64px';
      Height = '64px';
      Radius = '22.5';
      StrokeWidth = '5.47';
      break;
    case 'medium':
      Width = '44px';
      Height = '44px';
      Radius = '21.6';
      StrokeWidth = '5.68';
      break;
    case 'small':
      Width = '32px';
      Height = '32px';
      Radius = '21.5';
      StrokeWidth = '6.25';
      break;
    case 'xsmall':
      Width = '24px';
      Height = '24px';
      Radius = '21.05';
      StrokeWidth = '7.5';
      break;
  }

  Eclipse = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width={Width}
      height={Height}
      fill="none"
      className={cl(
        classes[`spinner`],
        classes[`spinner-${size}`],
        classes[`loading`],
      )}
    >
      <circle
        cx="25"
        cy="25"
        r={Radius}
        className={cl(classes[`path-stroke-background-${variant}`])}
        strokeWidth={StrokeWidth}
      ></circle>
      <circle
        cx="25"
        cy="25"
        r={Radius}
        className={cl(classes[`path-stroke-circle-${variant}`])}
        strokeWidth={StrokeWidth}
      ></circle>
    </svg>
  );

  return (
    <div
      className={cl(classes[`spinner`], classes[`spinner-${size}`], {
        [classes.withLabel]: label,
      })}
      {...rest}
    >
      <div className={cl(classes[`eclipse-${size}`])}>{Eclipse}</div>
      <label
        className={cl(
          classes[`label-medium`],
          { [classes[`text-color-default`]]: variant === 'default' },
          { [classes[`text-color-inverted`]]: variant === 'inverted' },
        )}
      >
        {label}{' '}
      </label>
    </div>
  );
}

export default Spinner;
