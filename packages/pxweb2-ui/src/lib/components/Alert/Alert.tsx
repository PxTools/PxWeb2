import React, { useState } from 'react';
import cl from 'clsx';

import { useTranslation } from 'react-i18next';
import classes from './Alert.module.scss';
import BodyLong from '../Typography/BodyLong/BodyLong';
import Heading from '../Typography/Heading/Heading';
import { Icon, IconProps } from '../Icon/Icon';
import Button from '../Button/Button';
import BodyShort from '../Typography/BodyShort/BodyShort';
import List, { ListProps } from '../List/List';

export interface AlertProps {
  readonly size?: 'small' | 'medium';
  readonly variant: 'info' | 'success' | 'warning' | 'error';
  readonly clickable?: boolean;
  readonly closeButton?: boolean;
  readonly heading?: string;
  readonly headingLevel?: '1' | '2' | '3' | '4' | '5' | '6';
  readonly onClick?: () => void;
  readonly className?: string;
  readonly children?: string | React.ReactNode;
  readonly alertAriaLabel?: string;
  readonly ariaLive?: 'off' | 'polite' | 'assertive';
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

export function Alert({
  size = 'medium',
  variant = 'info',
  clickable = false,
  closeButton = false,
  heading = '',
  headingLevel = '2',
  onClick,
  className = '',
  children,
  alertAriaLabel,
  ariaHasPopup = 'false',
  ariaLive = 'off',
  role,
  ref,
  id,
}: Readonly<AlertProps>) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const HandleClose = () => {
    setIsVisible(false);
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
  const iconRight = 'ArrowRight';
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
  if (clickable) {
    closeButton = false;
  }

  const childIsList = (node: React.ReactNode): boolean => {
    if (React.isValidElement(node)) {
      if (node.type === List) {
        return true;
      }
    }
    return false;
  };

  const extractTextFromChildren = (children: React.ReactNode): string => {
    let textContent = '';

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child)) {
        // If the child is a valid React element, check its children recursively
        if (React.isValidElement(child) && child.type === List) {
          textContent += ' ' + (child.props as ListProps)?.subHeading + ': ';
        }
        if (
          typeof child.props === 'object' &&
          child.props !== null &&
          'children' in child.props
        ) {
          textContent += extractTextFromChildren(
            child.props.children as React.ReactNode,
          );
        }
      } else if (typeof child === 'string' || typeof child === 'number') {
        // If the child is a string or number, add it to the text content
        textContent += ' ' + child.toString();
      }
    });

    return textContent;
  };

  if (childIsList(children) && clickable) {
    let extractedText = '';
    if (React.isValidElement(children) && children.type === List) {
      const listProps = children.props as ListProps;
      extractedText = extractTextFromChildren(listProps.children);
    }
    children = extractedText;
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
      <div className={classes[`alert-section-left-${size}`]}>
        <Icon
          iconName={variantIcon}
          className={classes[`alert-icon-${variant}`]}
        ></Icon>
      </div>
      <div className={cl(classes[`alert-section-middle-${size}`])}>
        {hasheading && (
          <div className={cl(classes[`alert-heading`])} aria-live={ariaLive}>
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
            <Icon iconName={iconRight} />
          </div>
        )}
      </div>
    </div>
  );
}

export default Alert;
