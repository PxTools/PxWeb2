import cl from 'clsx';
import React from 'react';
import styles from './LinkCard.module.scss';
import BodyLong from '../Typography/BodyLong/BodyLong';
import BodyShort from '../Typography/BodyShort/BodyShort';
import { getIconDirection } from '../../util/util';

import { Heading, Icon, IconProps } from '@pxweb2/pxweb2-ui';

export interface LinkCardProps {
  icon?: IconProps['iconName'];
  headingText: string;
  description?: string;
  href: string;
  newTab?: boolean;
  headingType?: 'span' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'small' | 'medium';
  readonly languageDirection?: 'ltr' | 'rtl';
}

export function LinkCard({
  icon,
  headingText,
  description,
  href,
  newTab = true,
  headingType = 'span',
  size = 'medium',
  languageDirection = 'ltr',
}: LinkCardProps) {
  // if (headingText.length < 1) {
  //   throw new Error('heading must be at least 1 character');
  // }

  const iconArrow = getIconDirection(
    languageDirection,
    'ArrowRight',
    'ArrowLeft',
  );

  let headingLevel: '2' | '3' | '4' | '5' | '6' | undefined;
  switch (headingType) {
    case 'h2':
      headingLevel = '2';
      break;
    case 'h3':
      headingLevel = '3';
      break;
    case 'h4':
      headingLevel = '4';
      break;
    case 'h5':
      headingLevel = '5';
      break;
    case 'h6':
      headingLevel = '6';
      break;
    default:
      headingLevel = undefined;
  }

  const headingSize = size === 'small' ? 'xsmall' : 'small';

  const handleClick = () => {
    const link = document.createElement('a');
    link.href = href;
    link.rel = 'noopener noreferrer';
    if (newTab) {
      link.target = '_blank';
    }
    link.click();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={cl(styles[`link-card-${size}`])}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-labelledby={`${headingText}${description ? ` ${description}` : ''}`}
      role="link"
    >
      {icon && (
        <div className={cl(styles['icon-wrapper'])}>
          <Icon iconName={icon} />
        </div>
      )}
      <div className={styles['content-wrapper']}>
        {headingText &&
          (headingType === 'span' ? (
            <span
              className={cl(styles['heading-wrapper'], [
                styles[`heading-${headingSize}`],
              ])}
            >
              {/* <a
                href={href}
                target={newTab ? '_blank' : undefined}
                rel={newTab ? 'noopener noreferrer' : undefined}
                className={cl([styles[`heading-${headingSize}`]])}
              >
                {headingText}
              </a> */}
              {headingText}
            </span>
          ) : (
            <Heading
              size={headingSize}
              level={headingLevel}
              className={cl(styles['heading-wrapper'])}
            >
              {/* <a
                href={href}
                target={newTab ? '_blank' : undefined}
                rel={newTab ? 'noopener noreferrer' : undefined}
                className={cl(styles[`heading-${headingSize}`])}
              >
                {headingText}
              </a> */}
              {headingText}
            </Heading>
          ))}
        {description && (
          <div className={styles['child-wrapper']}>
            {size === 'medium' && (
              <BodyLong size="medium">{description}</BodyLong>
            )}
            {size === 'small' && (
              <BodyShort size="medium">{description}</BodyShort>
            )}
          </div>
        )}
      </div>
      <div className={cl(styles['arrow-wrapper'])}>
        <Icon iconName={iconArrow} />
      </div>
    </div>
  );
}
