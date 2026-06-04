/**
 * Entry module for the PxWeb line chart web component bundle.
 * Defines and registers the custom element, publishes the global
 * PxwebLineChart API on window, and applies any queued configuration
 * so host pages can configure the component before or after script load.
 */
import { definePxwebLineChartElement } from './lib/components/Chart/Charts/Standalone/PxwebLineChartElement';
import {
  configurePxwebLineChart,
  type PxwebLineChartGlobalConfig,
  type PxwebLineChartGlobalApi,
} from './lib/components/Chart/Charts/Standalone/pxwebLineChartGlobal';

interface PendingPxwebLineChartApi {
  readonly configure?: (config: PxwebLineChartGlobalConfig) => void;
  readonly __pendingConfig?: PxwebLineChartGlobalConfig;
}

declare global {
  interface Window {
    PxwebLineChart?: PxwebLineChartGlobalApi;
    PxwebLineChartConfig?: PxwebLineChartGlobalConfig;
  }
}

function applyPendingConfigIfAny(
  pendingApi: PendingPxwebLineChartApi | undefined,
): void {
  if (pendingApi?.__pendingConfig) {
    configurePxwebLineChart(pendingApi.__pendingConfig);
  }

  if (globalThis.window?.PxwebLineChartConfig) {
    configurePxwebLineChart(globalThis.window.PxwebLineChartConfig);
  }
}

const api: PxwebLineChartGlobalApi = {
  define: definePxwebLineChartElement,
  configure: configurePxwebLineChart,
};

if (globalThis.window) {
  const pendingApi = globalThis.window.PxwebLineChart as unknown as
    | PendingPxwebLineChartApi
    | undefined;

  globalThis.window.PxwebLineChart = api;
  applyPendingConfigIfAny(pendingApi);
}

definePxwebLineChartElement();

export { api as PxwebLineChart, configurePxwebLineChart };
