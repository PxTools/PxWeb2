import React from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './SkipToMain.module.scss';
import { Link } from '@pxweb2/pxweb2-ui';

export const SkipToMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  const { t } = useTranslation();

  return (
    <div
      ref={ref}
      className={cl(classes['skip-to-main'], classes['screen-reader-only'])}
      {...props}
    >
      <Link href="#px-main-content" size="medium">
        {t('common.skip_to_main')}
      </Link>
    </div>
  );
});

SkipToMain.displayName = 'SkipToMain';
