import { HTMLAttributes, Ref, useEffect } from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import classes from './SkipToMain.module.scss';
import { Link } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../util/config/getConfig';
import { getLanguagePath } from '../../util/language/getLanguagePath';

const STICKY_SKIP_OFFSET_CSS_VAR = '--px-skip-to-main-sticky-offset';

type SkipToMainProps = HTMLAttributes<HTMLDivElement> & {
  withStickyHeaderOffset?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export function SkipToMain({
  withStickyHeaderOffset = false,
  ref,
  ...rest
}: SkipToMainProps) {
  const { t, i18n } = useTranslation();
  const config = getConfig();
  const location = useLocation().pathname;
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!withStickyHeaderOffset) {
      return;
    }

    document.body.style.setProperty(STICKY_SKIP_OFFSET_CSS_VAR, '80px');

    return () => {
      document.body.style.removeProperty(STICKY_SKIP_OFFSET_CSS_VAR);
    };
  }, [withStickyHeaderOffset]);

  const basePath = getLanguagePath(
    location,
    i18n.language,
    config.language.supportedLanguages,
    config.language.defaultLanguage,
    config.language.showDefaultLanguageInPath,
    config.baseApplicationPath,
    config.language.positionInPath,
  );

  // build a single, URL-encoded query string from the search params
  const paramsString = searchParams.toString(); // URLSearchParams handles encoding
  const params = paramsString ? `?${paramsString}` : '';
  const path = `${basePath}${params}#px-main-content`;

  return (
    <div
      ref={ref}
      className={cl(classes['skip-to-main'], classes['screen-reader-only'])}
      {...rest}
    >
      <Link href={path} size="medium">
        {t('common.skip_to_main')}
      </Link>
    </div>
  );
}

SkipToMain.displayName = 'SkipToMain';
