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
}: SpinnerProps) {
  let Eclipse = null;
  let Labelsize: 'small' | 'medium' = 'medium';
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
      Labelsize = 'medium';
      break;
    case 'large':
      Width = '64px';
      Height = '64px';
      Radius = '22.5';
      StrokeWidth = '5.47';
      Labelsize = 'medium';
      break;
    case 'medium':
      Width = '44px';
      Height = '44px';
      Radius = '21.6';
      StrokeWidth = '5.68';
      Labelsize = 'medium';
      break;
    case 'small':
      Width = '32px';
      Height = '32px';
      Radius = '21.5';
      StrokeWidth = '6.25';
      Labelsize = 'medium';
      break;
    case 'xsmall':
      Width = '20px';
      Height = '20px';
      Radius = '21.05';
      StrokeWidth = '7.5';
      Labelsize = 'small';
      break;
    default:
      Width = '44px';
      Height = '44px';
      Radius = '21.6';
      StrokeWidth = '5.68';
      Labelsize = 'medium';
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
        classes[`loading`]
      )}
    >
      <circle
        cx="25"
        cy="25"
        r={Radius}
        className={cl(classes[`path-stroke-background-${variant}`])}
        stroke-width={StrokeWidth}
      ></circle>
      <circle
        cx="25"
        cy="25"
        r={Radius}
        className={cl(classes[`path-stroke-circle-${variant}`])}
        stroke-width={StrokeWidth}
      ></circle>
    </svg>
  );

  return (
    <div className={cl(classes[`spinner`], classes[`spinner-${size}`])}>
      <div className={cl(classes[`eclipse-${size}`])}>{Eclipse}</div>
      <label
        className={cl(
          classes[`label-${Labelsize}`],
          { [classes[`text-color-default`]]: variant === 'default' },
          { [classes[`text-color-inverted`]]: variant === 'inverted' }
        )}
      >
        {label}{' '}
      </label>
    </div>
  );
}

export default Spinner;
