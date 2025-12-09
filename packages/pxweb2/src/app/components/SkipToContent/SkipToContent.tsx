import React from 'react';
import cl from 'clsx';
//import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';

import classes from './SkipToContent.module.scss';
import { Link } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../util/config/getConfig';

export type SkipToContentProps = React.HTMLAttributes<HTMLDivElement> & {
  // Jump to
  targetId?: string;

  // label for the link
  label?: string;
};

export const SkipToContent = React.forwardRef<
  HTMLDivElement,
  SkipToContentProps
>((props, ref) => {
  const { targetId, label, ...rest } = props;
  const basePath = getConfig().baseApplicationPath;
  const location = useLocation().pathname;
  const [searchParams] = useSearchParams();

  // build a single, URL-encoded query string from the search params
  const paramsString = searchParams.toString(); // URLSearchParams handles encoding
  const params = paramsString ? `?${paramsString}` : '';
  const path =
    basePath.slice(0, -1) +
    location +
    params +
    (targetId ? `#${targetId}` : '');
  return (
    <div
      ref={ref}
      className={cl(classes['skip-to-content'], classes['screen-reader-only'])}
      {...rest}
    >
      <Link href={path} size="medium">
        {label}
      </Link>
    </div>
  );
});

SkipToContent.displayName = 'SkipToContent';
