import React from 'react';
import cl from 'clsx';
import { useLocation, useSearchParams } from 'react-router';

import classes from './SkipToContent.module.scss';
import { Link } from '@pxweb2/pxweb2-ui';

export type SkipToContentProps = React.HTMLAttributes<HTMLDivElement> & {
  // Jump to
  targetId?: string;

  // label for the link
  label?: string;

  containerRef?: React.Ref<HTMLDivElement>;
};

export function SkipToContent(props: SkipToContentProps) {
  const { targetId, label, containerRef, ...rest } = props;
  const location = useLocation().pathname;
  const [searchParams] = useSearchParams();

  // build a single, URL-encoded query string from the search params
  const paramsString = searchParams.toString(); // URLSearchParams handles encoding
  const params = paramsString ? `?${paramsString}` : '';
  const hash = targetId ? `#${targetId}` : '';
  const path = `${location}${params}${hash}`;
  return (
    <div
      ref={containerRef}
      className={cl(classes['skip-to-content'], classes['screen-reader-only'])}
      {...rest}
    >
      <Link href={path} size="medium">
        {label}
      </Link>
    </div>
  );
}

SkipToContent.displayName = 'SkipToContent';
