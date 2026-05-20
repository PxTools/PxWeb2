import { createElement } from 'react';
import type { ReactNode } from 'react';

/** Adds explicit line-break opportunities after forward slashes in labels. */
export function renderHeaderLabelWithSlashBreaks(label: string): ReactNode {
  if (!label.includes('/')) {
    return label;
  }

  let prefix = '';

  return label.split('/').flatMap((segment) => {
    prefix = prefix ? `${prefix}/${segment}` : segment;

    if (prefix.length === label.length) {
      return [segment];
    }

    return [segment, '/', createElement('wbr', { key: `wbr-${prefix}` })];
  });
}
