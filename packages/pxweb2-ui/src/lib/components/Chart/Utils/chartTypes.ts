export interface ChartSeries {
  readonly key: string;
  readonly name: string;
}

type ChartSourceRow = Record<string, string | number | null>;
type ChartFormattedValues = Record<string, string | null>;

export interface EChartsDataset {
  readonly title: string;
  readonly origin: string;
  readonly unit: string;
  readonly dimensions: string[];
  readonly source: ChartSourceRow[];
  readonly formattedValues: ChartFormattedValues[];
  readonly series: ChartSeries[];
}

export interface PopulationPyramidDataPoint {
  readonly name: string;
  readonly left: number | null;
  readonly right: number | null;
}

export interface PopulationPyramidConfig {
  readonly title: string;
  readonly data: PopulationPyramidDataPoint[];
  readonly leftSeriesName: string;
  readonly rightSeriesName: string;
  readonly origin: string;
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
