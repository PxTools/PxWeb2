import cl from 'clsx';
import classes from './BodyLong.module.scss';

/* eslint-disable-next-line */
export interface BodyLongProps extends React.HTMLAttributes<HTMLParagraphElement>  {
  size?:"small"|"medium"
  children:string
}

export function BodyLong({children,size="medium",...rest}: BodyLongProps) {
  return (
    <p className={cl(classes.bodylong,classes[size])}{...rest}>  
     {children}
    </p>
  );
}

export default BodyLong;
