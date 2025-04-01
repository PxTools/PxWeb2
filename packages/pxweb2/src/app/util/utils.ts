import { ValueDisplayType } from '@pxweb2/pxweb2-ui';

/**
 * Returns the label text for a value based on the value display type.
 *
 * @param valueDisplayType - The value display type for the dimension.
 * @param code - The code of the value.
 * @param label - The label of the value.
 * @returns The label text for the value.
 */
export function getLabelText(
  valueDisplayType: ValueDisplayType,
  code: string,
  label: string,
): string {
  if (valueDisplayType === 'code') {
    return code;
  } else if (valueDisplayType === 'value') {
    return label;
  } else {
    return `${code} ${label}`;
  }
}
