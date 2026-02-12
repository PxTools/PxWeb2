/**
 * Metadata about a content.
 */
export type ContentInfo = {
  /**
   * Content unit.
   */
  unit: string;
  /**
   * Number of decimals to be used when displaying content data
   */
  decimals: number;
  /**
   * The content's reference period.
   */
  referencePeriod: string;
  /**
   * The content's base period.
   */
  basePeriod: string;
  /**
   * Alternative text for the content.
   */
  alternativeText: string;
};
