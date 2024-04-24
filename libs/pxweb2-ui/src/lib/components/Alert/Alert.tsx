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
  //description: string;
  // hasheading: boolean;
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
  //description,
  // hasheading = false,
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      onClick && onClick();
    }
  };
  let hasheading: boolean;
  heading ? (hasheading = true) : (hasheading = false);
  const iconRight = 'ArrowRight';
  const iconClose = 'XMark';
  // variant='warning';
  let variantIcon: IconProps['iconName'];
  switch (variant) {
    case 'info':
      variantIcon = 'InformationCircleFilled';
      break;
    case 'success':
      variantIcon = 'CheckMarkCircleFilled';
      break;
    case 'warning':
      variantIcon = 'ExclamationMarkFilled';
      break;
    case 'error':
      variantIcon = 'XMarkCircleFilled';
      break;

    default:
      variantIcon = 'XMarkCircleFilled';
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
      onKeyDown={clickable ? handleKeyDown : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={cl(classes[`alert-${size}`], classes[variant], {
        [classes[`${variant}-clickable`]]: clickable,
      })}
      onClick={clickable ? onClick : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
    >
      <div className={classes[`alert-section-left-${size}`]}>
        <Icon
          iconName={variantIcon}
          className={classes[`alert-icon-${variant}`]}
        ></Icon>
      </div>
      <div className={cl(classes[`alert-section-middle-${size}`])}>
        {hasheading && (
          <div className={classes[`alert-heading`]}>
            <Heading size={headingSize}>{heading}</Heading>
          </div>
        )}
        <div
          className={cl(classes[`alert-body-${size}`], {
            [classes[`truncate-text-${size}`]]: clickable,
          })}
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
            [classes[`alert-section-right-close-${size}`]]: closeButton,
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
        {clickable && (
          <div className={cl(classes['alert-icon-wrapper'])}>
            {' '}
            <Icon iconName={iconRight} className=""></Icon>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alert;
