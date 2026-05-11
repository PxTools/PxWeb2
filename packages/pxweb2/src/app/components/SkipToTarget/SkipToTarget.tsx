import React from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import classes from './SkipToTarget.module.scss';
import { Link } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../util/config/getConfig';
import { getLanguagePath } from '../../util/language/getLanguagePath';

type SkipTranslationKey = 'common.skip_to_main' | 'common.skip_to_toolsmenu';

export type SkipToTargetProps = React.HTMLAttributes<HTMLDivElement> & {
  targetId: string;
  translationKey?: SkipTranslationKey;
  label?: string;
  styleVariant?: 'main' | 'content';
};

export const SkipToTarget = React.forwardRef<HTMLDivElement, SkipToTargetProps>(
  (
    {
      targetId,
      translationKey,
      label,
      styleVariant = 'main',
      className = '',
      ...props
    },
    ref,
  ) => {
    const { t, i18n } = useTranslation();
    const config = getConfig();
    const location = useLocation().pathname;
    const [searchParams] = useSearchParams();

    const basePath = getLanguagePath(
      location,
      i18n.language,
      config.language.supportedLanguages,
      config.language.defaultLanguage,
      config.language.showDefaultLanguageInPath,
      config.baseApplicationPath,
      config.language.positionInPath,
    );

    // Build a single, URL-encoded query string from the search params.
    const paramsString = searchParams.toString();
    const params = paramsString ? `?${paramsString}` : '';
    const path = `${basePath}${params}#${targetId}`;
    const linkText = label ?? (translationKey ? t(translationKey) : '');

    return (
      <div
        ref={ref}
        className={cl(
          styleVariant === 'content'
            ? classes['skip-to-content']
            : classes['skip-to-main'],
          styleVariant === 'content'
            ? classes['screen-reader-only-content']
            : classes['screen-reader-only-main'],
          className,
        )}
        {...props}
      >
        <Link href={path} size="medium">
          {linkText}
        </Link>
      </div>
    );
  },
);

SkipToTarget.displayName = 'SkipToTarget';
