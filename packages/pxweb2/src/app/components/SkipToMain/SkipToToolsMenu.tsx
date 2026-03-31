import React from 'react';

import { SkipLink } from './SkipLink';

export const SkipToToolsMenu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => {
  return (
    <SkipLink
      ref={ref}
      targetId="px-table-viewer-outer-container"
      translationKey="common.skip_to_toolsmenu"
      {...props}
    />
  );
});

SkipToToolsMenu.displayName = 'SkipToToolsMenu';
