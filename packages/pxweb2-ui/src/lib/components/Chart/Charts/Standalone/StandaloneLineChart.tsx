// This file is the UI wrapper for rendering a standalone line chart from a dataUrl.
import LineChart from '../LineChart';
import { PXWEB_LINE_CHART_CONFIG_CHANGED_EVENT } from './pxwebLineChartGlobal';
import { useStandalonePxTableData } from './useStandalonePxTableData';

export interface StandaloneLineChartProps {
  readonly dataUrl: string;
  readonly colors?: string[];
  readonly strictBaseMatch?: boolean;
  readonly loadingRenderer?: React.ReactNode;
  readonly errorRenderer?: (errorMessage: string) => React.ReactNode;
}

export function StandaloneLineChart({
  dataUrl,
  colors,
  strictBaseMatch = true,
  loadingRenderer,
  errorRenderer,
}: StandaloneLineChartProps) {
  const { pxTable, error, isLoading } = useStandalonePxTableData({
    dataUrl,
    strictBaseMatch,
    reloadEventName: PXWEB_LINE_CHART_CONFIG_CHANGED_EVENT,
  });

  if (isLoading) {
    return loadingRenderer ?? <div>Loading chart...</div>;
  }

  if (error) {
    return errorRenderer ? (
      <>{errorRenderer(error)}</>
    ) : (
      <div role="alert">Unable to load chart: {error}</div>
    );
  }

  if (!pxTable) {
    return null;
  }

  return <LineChart pxtable={pxTable} colors={colors}></LineChart>;
}

export default StandaloneLineChart;
