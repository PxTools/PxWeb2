import React from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import classes from './SkipToMain.module.scss';
import { Link } from '@pxweb2/pxweb2-ui';

export const SkipToMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { t } = useTranslation();
  const location = useLocation().pathname;
  const [searchParams] = useSearchParams();

  // build a single, URL-encoded query string from the search params
  const paramsString = searchParams.toString(); // URLSearchParams handles encoding
  const params = paramsString ? `?${paramsString}` : '';
  const path = `${location}${params}#px-main-content`;

  return (
    <div
      ref={ref}
      className={cl(classes['skip-to-main'], classes['screen-reader-only'])}
      {...props}
    >
      <Link href={path} size="medium">
        {t('common.skip_to_main')}
      </Link>
    </div>
  );
});

SkipToMain.displayName = 'SkipToMain';
