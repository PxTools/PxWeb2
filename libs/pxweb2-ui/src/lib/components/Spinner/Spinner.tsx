import cl from 'clsx';
import classes from './Spinner.module.scss';

export interface SpinnerProps {
  size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'default' | 'inverted';
  label?: string;
  children?: string | React.ReactNode;
}

export function Spinner({
  size = 'medium',
  variant = 'default',
  label,
  children,
}: SpinnerProps) {
  let PathStrokeSubtle= "";
  let PathStrokeAction= "";
  let Eclipse = null;
  let labelsize: 'small' | 'medium' = 'medium';

  switch (variant) {
    case 'default':
       PathStrokeSubtle= "var(--px-color-border-subtle)";
       PathStrokeAction= "var(--px-color-border-action)";
      break;

      case 'inverted':
        PathStrokeSubtle= "var(--px-color-border-subtle)";
       PathStrokeAction= "var(--px-color-border-on-inverted)";
      break;
      default:
        PathStrokeSubtle= "var(--px-color-border-subtle)";
        PathStrokeAction= "var(--px-color-border-action)";
  }
  switch (size) {
    case 'xlarge':
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 88 88"
          fill="none"
          className={cl(classes[`spinner`], classes[`spinner-${size}`])}
        >
          <path
            d="M4 44C4 33.3913 8.21428 23.2172 15.7157 15.7157C23.2172 8.21427 33.3913 4 44 4C54.6087 4 64.7828 8.21428 72.2843 15.7157C79.7857 23.2172 84 33.3913 84 44C84 54.6087 79.7857 64.7828 72.2843 72.2843C64.7828 79.7857 54.6087 84 44 84C33.3913 84 23.2172 79.7857 15.7157 72.2843C8.21427 64.7828 4 54.6087 4 44L4 44Z"
            stroke={PathStrokeSubtle}
            stroke-width="8"
          />
          <path
            d="M6.04602 31.3709C8.54382 23.8643 13.2115 17.2669 19.4588 12.4132C25.7061 7.55936 33.2524 4.6671 41.1434 4.10213C49.0345 3.53715 56.9159 5.32484 63.7909 9.23911C70.666 13.1534 76.2259 19.0184 79.7677 26.0926C83.3094 33.1668 84.6739 41.1324 83.6885 48.982C82.7032 56.8317 79.4123 64.2128 74.232 70.1921C69.0516 76.1715 62.2146 80.4804 54.5854 82.574C46.9562 84.6675 38.8775 84.4518 31.3709 81.954"
            stroke={PathStrokeAction}
            stroke-width="8"
          />
        </svg>
      );
      labelsize = 'medium';
      break;
    case 'large':
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 64 64"
          fill="none"
          className={cl(classes[`spinner`], classes[`spinner-${size}`])}
        >
          <path
            d="M3.5 32C3.5 24.4413 6.50267 17.1922 11.8475 11.8475C17.1922 6.50267 24.4413 3.5 32 3.5C39.5587 3.5 46.8078 6.50267 52.1525 11.8475C57.4973 17.1922 60.5 24.4413 60.5 32C60.5 39.5587 57.4973 46.8078 52.1525 52.1525C46.8078 57.4973 39.5587 60.5 32 60.5C24.4413 60.5 17.1922 57.4973 11.8475 52.1525C6.50267 46.8078 3.5 39.5587 3.5 32L3.5 32Z"
            stroke={PathStrokeSubtle}
            stroke-width="7"
          />
          <path
            d="M4.95779 23.0017C6.73747 17.6533 10.0632 12.9527 14.5144 9.49437C18.9656 6.03604 24.3423 3.97531 29.9647 3.57277C35.5871 3.17022 41.2026 4.44395 46.101 7.23287C50.9995 10.0218 54.961 14.2006 57.4845 19.241C60.008 24.2813 60.9801 29.9568 60.2781 35.5497C59.576 41.1426 57.2312 46.4016 53.5403 50.6619C49.8493 54.9222 44.9779 57.9923 39.5421 59.4839C34.1063 60.9756 28.3502 60.8219 23.0018 59.0422"
            stroke={PathStrokeAction}
            stroke-width="7"
          />
        </svg>
      );
      labelsize = 'medium';
      break;
    case 'medium':
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
        >
          <path
            d="M2.5 22C2.5 16.8283 4.55446 11.8684 8.21142 8.21142C11.8684 4.55446 16.8283 2.5 22 2.5C27.1717 2.5 32.1316 4.55446 35.7886 8.21142C39.4455 11.8684 41.5 16.8283 41.5 22C41.5 27.1717 39.4455 32.1316 35.7886 35.7886C32.1316 39.4455 27.1717 41.5 22 41.5C16.8283 41.5 11.8684 39.4455 8.21142 35.7886C4.55446 32.1316 2.5 27.1717 2.5 22L2.5 22Z"
            stroke={PathStrokeSubtle}
            stroke-width="5"
          />
          <path
            d="M3.49743 15.8433C4.71511 12.1838 6.99061 8.96764 10.0362 6.60141C13.0817 4.23519 16.7605 2.82521 20.6074 2.54979C24.4543 2.27436 28.2965 3.14586 31.6481 5.05407C34.9997 6.96227 37.7101 9.82149 39.4367 13.2702C41.1633 16.7188 41.8285 20.602 41.3482 24.4287C40.8678 28.2554 39.2635 31.8538 36.7381 34.7687C34.2127 37.6836 30.8796 39.7842 27.1604 40.8048C23.4411 41.8254 19.5028 41.7202 15.8433 40.5026"
            stroke={PathStrokeAction}
            stroke-width="5"
          />
        </svg>
      );
      labelsize = 'medium';
      break;
    case 'small':
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
        >
          <path
            d="M2 16C2 12.287 3.475 8.72601 6.10051 6.1005C8.72602 3.475 12.287 2 16 2C19.713 2 23.274 3.475 25.8995 6.10051C28.525 8.72602 30 12.287 30 16C30 19.713 28.525 23.274 25.8995 25.8995C23.274 28.525 19.713 30 16 30C12.287 30 8.72601 28.525 6.1005 25.8995C3.475 23.274 2 19.713 2 16L2 16Z"
            stroke={PathStrokeSubtle}
            stroke-width="4"
          />
          <path
            d="M2.71611 11.5798C3.59034 8.9525 5.22402 6.64343 7.41058 4.9446C9.59713 3.24578 12.2383 2.23349 15.0002 2.03575C17.7621 1.838 20.5206 2.46369 22.9268 3.83369C25.3331 5.20368 27.2791 7.25646 28.5187 9.73242C29.7583 12.2084 30.2359 14.9963 29.891 17.7437C29.5461 20.4911 28.3943 23.0745 26.5812 25.1673C24.7681 27.26 22.3751 28.7681 19.7049 29.5009C17.0347 30.2336 14.2071 30.1581 11.5798 29.2839"
            stroke={PathStrokeAction}
            stroke-width="4"
          />
        </svg>
      );
      labelsize = 'medium';
      break;
    case 'xsmall':
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M1.5 10C1.5 7.74566 2.39553 5.58365 3.98959 3.98959C5.58365 2.39553 7.74566 1.5 10 1.5C12.2543 1.5 14.4163 2.39553 16.0104 3.98959C17.6045 5.58365 18.5 7.74566 18.5 10C18.5 12.2543 17.6045 14.4163 16.0104 16.0104C14.4163 17.6045 12.2543 18.5 10 18.5C7.74566 18.5 5.58365 17.6045 3.98959 16.0104C2.39553 14.4163 1.5 12.2543 1.5 10L1.5 10Z"
            stroke={PathStrokeSubtle}
            stroke-width="3"
          />
          <path
            d="M1.93478 7.31631C2.46556 5.72116 3.45744 4.31923 4.78499 3.2878C6.11254 2.25636 7.71613 1.64176 9.39298 1.5217C11.0698 1.40165 12.7446 1.78153 14.2056 2.61331C15.6665 3.44509 16.848 4.69142 17.6006 6.19468C18.3532 7.69794 18.6432 9.39062 18.4338 11.0587C18.2244 12.7267 17.5251 14.2952 16.4243 15.5658C15.3235 16.8364 13.8706 17.7521 12.2494 18.197C10.6282 18.6419 8.91146 18.596 7.31631 18.0652"
            stroke={PathStrokeAction}
            stroke-width="3"
          />
        </svg>
      );
      labelsize = 'small';
      break;
    default:
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
        >
          <path
            d="M2.5 22C2.5 16.8283 4.55446 11.8684 8.21142 8.21142C11.8684 4.55446 16.8283 2.5 22 2.5C27.1717 2.5 32.1316 4.55446 35.7886 8.21142C39.4455 11.8684 41.5 16.8283 41.5 22C41.5 27.1717 39.4455 32.1316 35.7886 35.7886C32.1316 39.4455 27.1717 41.5 22 41.5C16.8283 41.5 11.8684 39.4455 8.21142 35.7886C4.55446 32.1316 2.5 27.1717 2.5 22L2.5 22Z"
            stroke={PathStrokeSubtle}
            stroke-width="5"
          />
          <path
            d="M3.49743 15.8433C4.71511 12.1838 6.99061 8.96764 10.0362 6.60141C13.0817 4.23519 16.7605 2.82521 20.6074 2.54979C24.4543 2.27436 28.2965 3.14586 31.6481 5.05407C34.9997 6.96227 37.7101 9.82149 39.4367 13.2702C41.1633 16.7188 41.8285 20.602 41.3482 24.4287C40.8678 28.2554 39.2635 31.8538 36.7381 34.7687C34.2127 37.6836 30.8796 39.7842 27.1604 40.8048C23.4411 41.8254 19.5028 41.7202 15.8433 40.5026"
            stroke={PathStrokeAction}
            stroke-width="5"
          />
        </svg>
      );
      labelsize = 'medium';
  }

  return (

    <div className={cl(classes[`spinner`], classes[`spinner-${size}`],{[classes[`inverted-bg`]]:variant==='inverted'})}>
      <div className={cl(classes[`eclipse-${size}`],classes[`loading`])}>{Eclipse}</div>
      <label className={cl(classes[`label-${labelsize}`],{[classes[`text-color-inverted`]]:variant==='inverted'})}>{label} </label>
    </div>

  );
}

export default Spinner;
