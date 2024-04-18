import React, { useState } from 'react';
import cl from 'clsx';

import classes from './Alert.module.scss';
import BodyLong from '../Typography/BodyLong/BodyLong';
import Heading from '../Typography/Heading/Heading';
import { Icon, IconProps } from '../Icon/Icon';
import Button from '../Button/Button';
import BodyShort from '../Typography/BodyShort/BodyShort';

/* eslint-disable-next-line */
export interface AlertProps {
  size?: 'small' | 'medium';
  variant: 'info' | 'success' | 'warning' | 'error';
  // state: 'default|hover';
  clickable?: boolean;
  closeButton?: boolean;
  description: string;
  hasheading: boolean;
  heading?: string;
  onClick?: () => void;
  children?: string | React.ReactNode;
}

export function Alert({
  size = 'medium',
  variant = 'info',
  // state,
  clickable = false,
  closeButton = false,
  description,
  hasheading = false,
  heading = '',
  onClick,
  children,
}: AlertProps) {
  //let iconInfo:IconProps['iconName'];
  const [isVisible, setIsVisible] = useState(true);
  const HandleClose = () => {
    setIsVisible(false);
  };
  if (!isVisible) return null;

  const iconRight = 'ArrowRight';
  const iconClose = 'XMark';
  // variant='warning';
  let variantIcon: IconProps['iconName'];
  switch (variant) {
    case 'info':
      variantIcon = 'InformationCircleFilled';
      break;
    case 'success':
      variantIcon = 'CheckMarkCircle';
      break;
    case 'warning':
      variantIcon = 'ExclamationMarkFilled';
      break;
    case 'error':
      variantIcon = 'XMarkCircle';
      break;

    default:
      variantIcon = 'XMarkCircle';
  }
  let headingSize: 'small' | 'xsmall';
  const bodySize = 'medium';

  switch (size) {
    case 'small':
      headingSize = 'xsmall';
      break;
    case 'medium':
      headingSize = 'small';
      break;
    default:
      headingSize = 'small';
  }
  //const iconInfo:IconProps['iconName']=variantIcon;
  //closeButton = true;
  //clickable = true;
  if (clickable) {
    closeButton = false;
  }
  return (
    <div
      className={cl(classes.alert, classes[variant], {
        [classes[`${variant}-clickable`]]: clickable,
      })}
      onClick={clickable ? onClick : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className={classes[`alert-section-left`]}>
        <Icon
          iconName={variantIcon}
          className={classes[`alert-icon-${variant}`]}
        ></Icon>
      </div>
      <div>
        <div className={classes[`alert-heading`]}>
          {hasheading && <Heading size={headingSize}>{heading}</Heading>}
        </div>
        <div
          className={cl(
            classes[`alert-body-${size}`],
            classes[`truncate-text`]
          )}
        >
          {size === 'small' ? (
            <BodyShort size={bodySize}>{children}</BodyShort>
          ) : (
            <BodyLong size={bodySize}>{children}</BodyLong>
          )}
        </div>
      </div>
      <div
        className={cl(
          classes[`alert-section-right`],
          {
            [classes[`alert-section-right-close`]]: closeButton,
          },
          {
            [classes[`alert-section-right-continue`]]: clickable,
          }
        )}
      >
        {/* {closeButton && <Icon iconName={iconClose} className=""></Icon>} */}
        {closeButton && (
          <Button
            variant="tertiary"
            size="small"
            icon={iconClose}
            onClick={HandleClose}
          />
        )}
        {clickable && <Icon iconName={iconRight} className=""></Icon>}
      </div>
    </div>
  );
}

export default Alert;
