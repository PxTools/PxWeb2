import React from 'react';
import { SkipLink } from './SkipLink';

export const SkipToMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  return (
    <SkipLink
      ref={ref}
      targetId="px-main-content"
      translationKey="common.skip_to_main"
      {...props}
    />
  );
});

SkipToMain.displayName = 'SkipToMain';
