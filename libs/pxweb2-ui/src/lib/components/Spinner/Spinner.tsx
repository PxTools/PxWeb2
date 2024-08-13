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
  let Labelsize: 'small' | 'medium' = 'medium';
  let LabelExist = false;
  if (label!==undefined)
    {
      if (label.length > 0)
        {
          LabelExist =true;
        }
    }

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
          viewBox="0 0 50 50"
          width="88px"
          height="88px"
          fill="none"
          className={cl(classes[`spinner`], classes[`spinner-${size}`],classes[`loading`])}
        >
            {/* <path
           d="M4 44C4 33.3913 8.21428 23.2172 15.7157 15.7157C23.2172 8.21427 33.3913 4 44 4C54.6087 4 64.7828 8.21428 72.2843 15.7157C79.7857 23.2172 84 33.3913 84 44C84 54.6087 79.7857 64.7828 72.2843 72.2843C64.7828 79.7857 54.6087 84 44 84C33.3913 84 23.2172 79.7857 15.7157 72.2843C8.21427 64.7828 4 54.6087 4 44L4 44Z"           
            className={cl(classes[`path-stroke-background-${variant}`])}
            // stroke={PathStrokeSubtle}
            stroke-width="8px"/> 
          <path
            d="M6.04602 31.3709C8.54382 23.8643 13.2115 17.2669 19.4588 12.4132C25.7061 7.55936 33.2524 4.6671 41.1434 4.10213C49.0345 3.53715 56.9159 5.32484 63.7909 9.23911C70.666 13.1534 76.2259 19.0184 79.7677 26.0926C83.3094 33.1668 84.6739 41.1324 83.6885 48.982C82.7032 56.8317 79.4123 64.2128 74.232 70.1921C69.0516 76.1715 62.2146 80.4804 54.5854 82.574C46.9562 84.6675 38.8775 84.4518 31.3709 81.954"
            className={cl(classes[`path-stroke-circle-${variant}`])}
            // stroke={PathStrokeSubtle}
            stroke-width="8px"/> */}

          <circle cx='25' cy='25' r='22.5'
            className={cl(classes[`path-stroke-background-${variant}`])}
            // stroke={PathStrokeSubtle}
            stroke-width="4.54"></circle>
         <circle cx='25' cy='25' r='22.5'
            className={cl(classes[`path-stroke-circle-${variant}`])}
            // stroke={PathStrokeAction}
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
          className={cl(classes[`spinner`], classes[`spinner-${size}`],classes[`loading`])}
        >
            <circle cx='25' cy='25' r='22.5'
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="5.47">

          </circle>
          <circle cx='25' cy='25' r='22.5'
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="5.47">
        </circle>
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
          className={cl(classes[`spinner`], classes[`spinner-${size}`],classes[`loading`])}
        >
            <circle cx='25' cy='25' r='21.6'
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="5.68">

          </circle>
          <circle cx='25' cy='25' r='21.6'
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="5.68">
        </circle>
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
          className={cl(classes[`spinner`], classes[`spinner-${size}`],classes[`loading`])}
        >
            <circle cx='25' cy='25' r='21.5'
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="6.25">

          </circle>
          <circle cx='25' cy='25' r='21.5'
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="6.25">
        </circle>
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
          className={cl(classes[`spinner`], classes[`spinner-${size}`],classes[`loading`])}
        >
            <circle cx='25' cy='25' r='21.05'
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="7.5">

          </circle>
          <circle cx='25' cy='25' r='21.05'
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="7.5">
        </circle>
        </svg>
      );
      Labelsize = 'small';
      break;
    default:
      Eclipse = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 50 50"
          width="54px"
          height="54px"
          fill="none"
          className={cl(classes[`spinner`], classes[`spinner-${size}`],classes[`loading`])}
        >
            <circle cx='25' cy='25' r='20'
            className={cl(classes[`path-stroke-background-${variant}`])}
            stroke-width="4.6">

          </circle>
          <circle cx='25' cy='25' r='20'
            className={cl(classes[`path-stroke-circle-${variant}`])}
            stroke-width="4.6">
        </circle>
        </svg>
      );
      Labelsize = 'medium';
  }

  return (

    <div className={cl(classes[`spinner`], classes[`spinner-${size}`])}>
      {/* <div className={cl(classes[`eclipse-${size}`],classes[`loading`])}>{Eclipse}</div> */}
      <div className={cl(classes[`eclipse-${size}`])}>{Eclipse}</div>
      <label className={cl(classes[`label-${Labelsize}`],{[classes[`text-color-default`]]:variant==='default'},{[classes[`text-color-inverted`]]:variant==='inverted'})}>{label} </label>
    </div>

  );
}

export default Spinner;
