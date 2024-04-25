//import React from 'react';
import cl from 'clsx';

import styles from './Radio.module.scss';
import { Icon } from '../Icon/Icon';


import React, { forwardRef } from "react";
import Label from '../Typography/Label/Label';
import { text } from 'stream/consumers';
// import { BodyShort } from "../../typography";
// import { omit } from "../../util";
// import { useId } from "../../util/hooks";
//import { RadioProps } from "./types";
// import { useRadio } from "./useRadio";

export interface RadioProps
  //extends   React.InputHTMLAttributes<HTMLInputElement> {
    extends React.InputHTMLAttributes<HTMLInputElement>
  {
  id: string;
  text: string;
  children: React.ReactNode;
  value: any;
  description?: string;
}

export function Radio({
 // const { inputProps, size, hasError, readOnly } = useRadio(props);
    id,
    text,
    value,
    children,
    description,
    ...props
}: RadioProps) {
   const ref = React.useRef<HTMLInputElement>(null);

//   const labelId = useId();
//   const descriptionId = useId();

  return (
    <div      
    >
      <input
        type='radio'                
        ref={ref}
      />
<Label size='medium'id={id}>{props.checked}</Label>

{/* 
      <label htmlFor={inputProps.id} className="navds-radio__label">
        <span className="navds-radio__content">
          <BodyShort as="span" id={labelId} size={size} aria-hidden>
            {props.children}
          </BodyShort>
          {props.description && (
            <BodyShort
              as="span"
              id={descriptionId}
              size={size}
              className="navds-form-field__subdescription navds-radio__description"
              aria-hidden
            >
              {props.description}
            </BodyShort>
          )}
        </span>
      </label> */}


    </div>
  );
}

export default Radio;