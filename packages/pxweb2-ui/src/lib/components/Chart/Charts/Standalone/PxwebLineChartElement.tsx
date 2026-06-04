// This file defines the actual custom HTML element <pxweb-line-chart> and renders a React chart inside it.
// In short: this file is the bridge between plain HTML custom-element usage and your React chart component, 
// including attribute parsing and lifecycle-safe mounting.
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
