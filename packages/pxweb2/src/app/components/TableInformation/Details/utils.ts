import { PxTableMetadata, Value, VartypeEnum } from '@pxweb2/pxweb2-ui';

export type ContentDetails = {
  readonly subHeading: string;
  readonly text: string;
};

export const getContentValues = (tableMetadata: PxTableMetadata): Value[] => {
  return tableMetadata.variables
    .filter((variable) => variable.type === VartypeEnum.CONTENTS_VARIABLE)
    .flatMap((variable) => variable.values)
    .filter((value) => value.contentInfo !== undefined);
};

export const getUnitDetails = (contentValues: Value[]): ContentDetails[] => {
  return contentValues
    .filter((value) => value.contentInfo?.unit)
    .map((value) => ({
      subHeading: value.label,
      text: value.contentInfo?.unit!,
    }));
};

export const getReferencePeriodDetails = (
  contentValues: Value[],
): ContentDetails[] => {
  return contentValues
    .filter((value) => value.contentInfo?.referencePeriod)
    .map((value) => ({
      subHeading: value.label,
      text: value.contentInfo?.referencePeriod!,
    }));
};

export const getBasePeriodDetails = (
  contentValues: Value[],
): ContentDetails[] => {
  return contentValues
    .filter((value) => value.contentInfo?.basePeriod)
    .map((value) => ({
      subHeading: value.label,
      text: value.contentInfo?.basePeriod!,
    }));
};
