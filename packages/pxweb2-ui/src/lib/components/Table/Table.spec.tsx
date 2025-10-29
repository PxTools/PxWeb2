import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Table from './Table';
import { pxTable } from './testData';

describe('Table', () => {
  it('should render successfully desktop', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render successfully mobile', () => {
    const { baseElement } = render(<Table pxtable={pxTable} isMobile={true} />);
    expect(baseElement).toBeTruthy();
  });

  it('should have a th header named 1968', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    const ths = baseElement.querySelectorAll('th');
    let found = false;
    ths.forEach((th) => {
      if (th.innerHTML === '1968') {
        found = true;
      }
    });
    expect(found).toBe(true);
    expect(ths.length).toBeGreaterThan(0);
  });

  it('should NOT have a th header named 1967', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    const ths = baseElement.querySelectorAll('th');
    let found = false;
    ths.forEach((th) => {
      if (th.innerHTML === '1967') {
        found = true;
      }
    });
    expect(found).toBe(false);
  });


it('highlights column on header hover', () => {
  const { container } = render(<Table pxtable={pxTable} isMobile={false} />);
  console.log(container.innerHTML); // Debug: check for data-col and stub classes

  // Find a leaf header cell
  const leafHeader = container.querySelector('thead tr:last-child th[data-col]');
  expect(leafHeader).toBeTruthy();

  // Simulate mouseover
  fireEvent.mouseOver(leafHeader!);

  // Find highlighted data cells
  const col = leafHeader!.getAttribute('data-col');
  const highlightedCells = container.querySelectorAll(`td[data-col="${col}"][class*="colHover"]`);
  expect(highlightedCells.length).toBeGreaterThan(0);
});
});
