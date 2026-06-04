// This file defines the global runtime API contract for configuring the line-chart web component, mainly around API base URL updates.
// In short: this file is the global configuration bridge between host page settings and chart runtime behavior
import { OpenAPI } from '@pxweb2/pxweb2-api-client';

export const PXWEB_LINE_CHART_CONFIG_CHANGED_EVENT =
  'pxweb-line-chart-config-changed';

export interface PxwebLineChartGlobalConfig {
  readonly baseUrl?: string;
}

export interface PxwebLineChartGlobalApi {
  readonly define: () => void;
  readonly configure: (config: PxwebLineChartGlobalConfig) => void;
}

export function configurePxwebLineChart(config: PxwebLineChartGlobalConfig) {
  if (config.baseUrl) {
    OpenAPI.BASE = config.baseUrl;
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(PXWEB_LINE_CHART_CONFIG_CHANGED_EVENT, {
        detail: config,
      }),
    );
  }
}
