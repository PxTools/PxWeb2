// This file implements the web component <pxweb-line-chart> that renders a line chart from a given data URL, using React under the hood.
// Some of the functions in this file are web component specific and should exist for web components.
import { createRoot, type Root } from 'react-dom/client';

import { StandaloneLineChart } from './StandaloneLineChart';

const ELEMENT_NAME = 'pxweb-line-chart';

function parseBooleanAttribute(
  value: string | null,
  defaultValue: boolean,
): boolean {
  if (value === null) {
    return defaultValue;
  }

  if (value === '' || value.toLowerCase() === 'true') {
    return true;
  }

  if (value.toLowerCase() === 'false') {
    return false;
  }

  return defaultValue;
}

function parseColorsAttribute(value: string | null): string[] | undefined {
  if (!value) {
    return undefined;
  }

  const colors = value
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return colors.length > 0 ? colors : undefined;
}

class PxwebLineChartElement extends HTMLElement {
  static get observedAttributes() {
    return ['data-url', 'colors', 'strict-base-match'];
  }

  private root: Root | null = null;

  connectedCallback() {
    if (!this.root) {
      this.root = createRoot(this);
    }

    this.renderComponent();
  }

  attributeChangedCallback() {
    this.renderComponent();
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = null;
  }

  private renderComponent() {
    if (!this.root) {
      return;
    }

    const dataUrl = this.getAttribute('data-url');
    if (!dataUrl) {
      this.root.render(<div>Missing required attribute: data-url</div>);
      return;
    }

    this.root.render(
      <StandaloneLineChart
        dataUrl={dataUrl}
        colors={parseColorsAttribute(this.getAttribute('colors'))}
        strictBaseMatch={parseBooleanAttribute(
          this.getAttribute('strict-base-match'),
          true,
        )}
      />,
    );
  }
}

// Registers the custom element safely
export function definePxwebLineChartElement() {
  if (!customElements.get(ELEMENT_NAME)) {
    customElements.define(ELEMENT_NAME, PxwebLineChartElement);
  }
}
