import React from 'react';

import { SkipLink } from './SkipLink';

type SkipToToolsMenuProps = React.HTMLAttributes<HTMLDivElement> & {
  targetId?: string;
};

export const SkipToToolsMenu = React.forwardRef<
  HTMLDivElement,
  SkipToToolsMenuProps
>(({ targetId = 'px-table-viewer-outer-container', ...props }, ref) => {
  return (
    <SkipLink
      ref={ref}
      targetId={targetId}
      translationKey="common.skip_to_toolsmenu"
      {...props}
    />
  );
});

SkipToToolsMenu.displayName = 'SkipToToolsMenu';
