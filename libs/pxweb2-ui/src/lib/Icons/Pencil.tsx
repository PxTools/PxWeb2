import styles from './Pencil.module.scss';

/* eslint-disable-next-line */
export interface PencilProps {
  variant: 'primary' | 'secondary' | 'tertiary';
}

export function Pencil({ variant }: PencilProps) {
  let styling = styles['pencil'];

  if (variant) {
    styling += ' ' + styles[variant];
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={styling}
      viewBox="0 0 24 24"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M19.6379 4.41755C18.3691 3.13961 16.3034 3.1359 15.0301 4.40927L5.65166 13.7877C5.56154 13.8778 5.49587 13.9894 5.46085 14.112L4.04664 19.0617C3.9719 19.3233 4.04466 19.6048 4.23678 19.7974C4.4289 19.99 4.71024 20.0635 4.972 19.9894L9.91245 18.5913C10.0357 18.5564 10.148 18.4906 10.2386 18.4L19.6297 9.00888C20.8966 7.74195 20.9003 5.68901 19.6379 4.41755ZM16.0907 5.46993C16.7768 4.78384 17.8898 4.78584 18.5734 5.47439C19.2536 6.15946 19.2516 7.26559 18.569 7.94822L18.3396 8.17763L15.8613 5.69935L16.0907 5.46993ZM14.8007 6.76001L6.84975 14.7109L5.8587 18.1796L9.31604 17.2012L17.2789 9.23829L14.8007 6.76001Z"
      />
    </svg>
  );
}

export default Pencil;
