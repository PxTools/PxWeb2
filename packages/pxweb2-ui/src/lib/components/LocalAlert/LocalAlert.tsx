import React, { useState } from 'react';
import cl from 'clsx';

import { useTranslation } from 'react-i18next';
import classes from './LocalAlert.module.scss';
import BodyLong from '../Typography/BodyLong/BodyLong';
import Heading from '../Typography/Heading/Heading';
import { Icon, IconProps } from '../Icon/Icon';
import Button from '../Button/Button';
import BodyShort from '../Typography/BodyShort/BodyShort';
import { getIconDirection } from '../../util/util';

export interface LocalAlertProps {
  readonly size?: 'small' | 'medium';
  readonly variant: 'info' | 'success' | 'warning' | 'error';
  readonly clickable?: boolean;
  readonly closeButton?: boolean;
  readonly heading?: string;
  readonly headingLevel?: '1' | '2' | '3' | '4' | '5' | '6';
  readonly onClick?: () => void;
  readonly onDismissed?: () => void;
  readonly languageDirection?: 'ltr' | 'rtl';
  readonly className?: string;
  readonly children?: string | React.ReactNode;
  readonly alertAriaLabel?: string;
  readonly ariaHasPopup?:
    | 'false'
    | 'true'
    | 'menu'
    | 'listbox'
    | 'tree'
    | 'grid'
    | 'dialog';
  readonly role?: React.AriaRole;
  ref?: React.Ref<HTMLDivElement>;
  id?: string;
}

export function LocalAlert({
  size = 'medium',
  variant = 'info',
  clickable = false,
  closeButton = false,
  heading = '',
  headingLevel = '2',
  onClick,
  onDismissed,
  languageDirection = 'ltr',
  className = '',
  children,
  alertAriaLabel,
  ariaHasPopup = 'false',
  role,
  ref,
  id,
}: Readonly<LocalAlertProps>) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const HandleClose = () => {
    setIsVisible(false);
    onDismissed?.();
  };
  if (!isVisible) {
    return null;
  }
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onClick && onClick();
    }
  };
  const hasheading = Boolean(heading);
  const iconArrow = getIconDirection(
    languageDirection,
    'ArrowRight',
    'ArrowLeft',
  );
  const iconClose = 'XMark';
  let variantIcon: IconProps['iconName'];
  let variantAriaLive: 'polite' | 'assertive';
  switch (variant) {
    case 'info':
      variantIcon = 'InformationCircleFilled';
      variantAriaLive = 'polite';
      break;
    case 'success':
      variantIcon = 'CheckMarkCircleFilled';
      variantAriaLive = 'polite';
      break;
    case 'warning':
      variantIcon = 'ExclamationMarkFilled';
      variantAriaLive = 'assertive';
      break;
    case 'error':
      variantIcon = 'XMarkCircleFilled';
      variantAriaLive = 'assertive';
      break;
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
  if (clickable) {
    closeButton = false;
  }

  return (
    <div
      id={id}
      aria-label={alertAriaLabel}
      tabIndex={clickable ? 0 : undefined}
      className={
        cl(classes[`alert-${size}`], classes[variant], {
          [classes[`${variant}-clickable`]]: clickable,
        }) + cssClasses
      }
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      style={{ cursor: clickable ? 'pointer' : 'default' }}
      aria-haspopup={ariaHasPopup}
      role={role}
      ref={ref}
    >
      <div className={cl(classes[`alert-section-left-${size}`])}>
        {!hasheading && (
          <span className={classes['sr-only']}>
            {t(`common.alert.${variant}`)}
          </span>
        )}
        <Icon
          iconName={variantIcon}
          className={classes[`alert-icon-${variant}`]}
        ></Icon>
      </div>
      <div className={cl(classes[`alert-section-middle-${size}`])}>
        {hasheading && (
          <div
            className={cl(classes[`alert-heading`])}
            aria-live={variantAriaLive}
            aria-atomic="true"
          >
            <span className={classes['sr-only']}>
              {t(`common.alert.${variant}`)}
            </span>
            <Heading size={headingSize} level={headingLevel}>
              {heading}
            </Heading>
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
            <BodyLong as="div" size={bodySize}>
              {children}
            </BodyLong>
          )}
        </div>
      </div>
      <div
        className={cl(
          classes[`alert-section-right`],
          {
            [classes[`alert-xmark`]]: closeButton,
          },
          {
            [classes[`alert-arrow-wrapper`]]: clickable,
          },
        )}
      >
        {closeButton && (
          <div className={cl(classes['alert-xmark-wrapper'])}>
            <Button
              variant="tertiary"
              size="small"
              icon={iconClose}
              onClick={HandleClose}
              aria-label={t('common.generic_buttons.close')}
            />
          </div>
        )}
        {clickable && (
          <div className={cl(classes['alert-arrow'])}>
            <Icon iconName={iconArrow} />
          </div>
        )}
      </div>
    </div>
  );
}

export default LocalAlert;
