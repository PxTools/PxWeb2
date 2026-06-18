export interface ChartDataPoint {
  readonly name: string;
  readonly [seriesKey: string]: number | string | null;
}

export interface ChartSeries {
  readonly key: string;
  readonly name: string;
}

export interface ChartConfig {
  readonly data: ChartDataPoint[];
  readonly series: ChartSeries[];
}

export interface EChartsDataset {
  readonly dimensions: string[];
  readonly source: Array<Record<string, string | number | null>>;
  readonly series: ChartSeries[];
}

export interface PopulationPyramidDataPoint {
  readonly name: string;
  readonly left: number | null;
  readonly right: number | null;
}

export interface PopulationPyramidConfig {
  readonly data: PopulationPyramidDataPoint[];
  readonly leftSeriesName: string;
  readonly rightSeriesName: string;
}

export interface PopulationPyramidValidationResult {
  readonly isValid: boolean;
  readonly reason?:
    | 'MISSING_TWO_VALUE_DIMENSION'
    | 'MULTIPLE_TWO_VALUE_DIMENSIONS'
    | 'MISSING_MULTI_VALUE_DIMENSION'
    | 'MULTIPLE_MULTI_VALUE_DIMENSIONS'
    | 'NON_SINGLE_VALUE_REMAINING_DIMENSIONS';
  readonly twoValueDimensionId?: string;
  readonly multiValueDimensionId?: string;
}

export interface PopulationPyramidMappingResult {
  readonly validation: PopulationPyramidValidationResult;
  readonly config?: PopulationPyramidConfig;
}
