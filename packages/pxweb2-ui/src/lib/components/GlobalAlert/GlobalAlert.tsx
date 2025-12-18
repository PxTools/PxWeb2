import React, { useState } from 'react';
import cl from 'clsx';

import { useTranslation } from 'react-i18next';
import classes from './GlobalAlert.module.scss';
import BodyLong from '../Typography/BodyLong/BodyLong';
import Heading from '../Typography/Heading/Heading';
import { Icon, IconProps } from '../Icon/Icon';
import Button from '../Button/Button';
import BodyShort from '../Typography/BodyShort/BodyShort';

export interface GlobalAlertProps {
  readonly size?: 'small' | 'medium';
  readonly variant: 'info' | 'success' | 'warning' | 'error';
  readonly closeButton?: boolean;
  readonly heading?: string;
  readonly headingLevel?: '1' | '2' | '3' | '4' | '5' | '6';
  readonly onDismissed?: () => void;
  readonly className?: string;
  readonly children?: string | React.ReactNode;
  readonly alertAriaLabel?: string;
  readonly isRoleAlert?: boolean;
  ref?: React.Ref<HTMLDivElement>;
  id?: string;
}

export function GlobalAlert({
  size = 'medium',
  variant = 'info',
  closeButton = false,
  heading = '',
  headingLevel = '2',
  onDismissed,
  className = '',
  children,
  alertAriaLabel,
  isRoleAlert = true,
  ref,
  id,
}: Readonly<GlobalAlertProps>) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const handleClose = () => {
    setIsVisible(false);
    onDismissed?.();
  };
  if (!isVisible) {
    return null;
  }
  const hasheading = Boolean(heading);
  const iconClose = 'XMark';
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

  return (
    <div className={cl(classes[variant]) + cssClasses}>
      <div className={cl(classes[`container`], classes[variant]) + cssClasses}>
        <div
          id={id}
          aria-label={alertAriaLabel}
          className={
            cl(classes[`alert-${size}`], classes[variant]) + cssClasses
          }
          role={isRoleAlert ? 'alert' : undefined}
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
              <div className={cl(classes[`alert-heading`])} aria-atomic="true">
                <span className={classes['sr-only']}>
                  {t(`common.alert.${variant}`)}
                </span>
                <Heading size={headingSize} level={headingLevel}>
                  {heading}
                </Heading>
              </div>
            )}
            <div className={cl(classes[`alert-body-${size}`])}>
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
            className={cl(classes[`alert-section-right`], {
              [classes[`alert-xmark`]]: closeButton,
            })}
          >
            {closeButton && (
              <div className={cl(classes['alert-xmark-wrapper'])}>
                <Button
                  variant="tertiary"
                  size="small"
                  icon={iconClose}
                  onClick={handleClose}
                  aria-label={t('common.generic_buttons.close')}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalAlert;
