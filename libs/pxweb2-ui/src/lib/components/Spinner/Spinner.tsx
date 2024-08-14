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

  switch (size) {
    case 'xlarge':
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          width="88px"
          height="88px"
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
            r="22.5"
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="4.54"
          ></circle>
          <circle
            cx="25"
            cy="25"
            r="22.5"
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="4.54"
          ></circle>
        </svg>
      );
      Labelsize = 'medium';
      break;
    case 'large':
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          width="64px"
          height="64px"
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
            r="22.5"
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="5.47"
          ></circle>
          <circle
            cx="25"
            cy="25"
            r="22.5"
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="5.47"
          ></circle>
        </svg>
      );
      Labelsize = 'medium';
      break;
    case 'medium':
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          width="44px"
          height="44px"
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
            r="21.6"
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="5.68"
          ></circle>
          <circle
            cx="25"
            cy="25"
            r="21.6"
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="5.68"
          ></circle>
        </svg>
      );
      Labelsize = 'medium';
      break;
    case 'small':
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          width="32px"
          height="32px"
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
            r="21.5"
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="6.25"
          ></circle>
          <circle
            cx="25"
            cy="25"
            r="21.5"
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="6.25"
          ></circle>
        </svg>
      );
      Labelsize = 'medium';
      break;
    case 'xsmall':
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          width="20px"
          height="20px"
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
            r="21.05"
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="7.5"
          ></circle>
          <circle
            cx="25"
            cy="25"
            r="21.05"
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="7.5"
          ></circle>
        </svg>
      );
      Labelsize = 'small';
      break;
    default:
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          width="44px"
          height="44px"
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
            r="21.6"
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="5.68"
          ></circle>
          <circle
            cx="25"
            cy="25"
            r="21.6"
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="5.68"
          ></circle>
        </svg>
      );
      Labelsize = 'medium';
  }

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
