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
  readonly reason?: string;
  readonly twoValueDimensionId?: string;
  readonly multiValueDimensionId?: string;
}
