import { createElement } from 'react';
import type { ReactNode } from 'react';

const DESKTOP_ROW_ESTIMATE_SIZE = 44;
const MOBILE_ROW_ESTIMATE_SIZE = 44;
const DESKTOP_ROW_OVERSCAN = 15;
const MOBILE_ROW_OVERSCAN = 15;
// Bootstrap rows are a temporary first window used before the virtualizer has
// measured/returned concrete items. This avoids rendering an empty tbody frame.
const DESKTOP_BOOTSTRAP_ROW_COUNT = 24;
const MOBILE_BOOTSTRAP_ROW_COUNT = 12;
const HEADER_LINE_CHAR_THRESHOLD = 12; // Approximate character count per header line used to determine when to wrap header text.
const HEADER_LINE_CHAR_THRESHOLD_LONG_TEXT = 16; // Approximate character per line when long texts.

/** Returns row virtualization sizing and overscan tuned for desktop/mobile. */
export function getBodyRowVirtualizationSettings(isMobile: boolean) {
  return {
    estimateSize: isMobile
      ? MOBILE_ROW_ESTIMATE_SIZE
      : DESKTOP_ROW_ESTIMATE_SIZE,
    overscan: isMobile ? MOBILE_ROW_OVERSCAN : DESKTOP_ROW_OVERSCAN,
    bootstrapRowCount: isMobile
      ? MOBILE_BOOTSTRAP_ROW_COUNT
      : DESKTOP_BOOTSTRAP_ROW_COUNT,
  };
}

/**
 * Estimates how many wrapped lines a heading level needs.
 *
 * The estimate is based on:
 * - longestValueTextLength: longest label text at this heading level
 * - columnSpan/valueCount: effective width available per value
 * - text density thresholds tuned for normal vs long labels
 *
 * For very small tables (<= 2 columns), the threshold is relaxed because
 * each header cell typically has more horizontal space.
 */
export function calculateHeadingLevelLines(
  longestValueTextLength: number,
  columnSpan: number,
  valueCount: number,
  totalColumns: number,
): number {
  const charsPerLine =
    longestValueTextLength > 50
      ? HEADER_LINE_CHAR_THRESHOLD_LONG_TEXT
      : HEADER_LINE_CHAR_THRESHOLD;
  const columnsPerValue = columnSpan / valueCount;
  let effectiveCharThreshold = charsPerLine * columnsPerValue;

  if (totalColumns <= 2) {
    effectiveCharThreshold *= 2;
  }

  const returnValue = Math.ceil(
    longestValueTextLength / effectiveCharThreshold,
  );

  return returnValue;
}

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
