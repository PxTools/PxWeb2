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



describe('Table column hover', () => {
  it('highlights all data cells in a column when hovering a leaf header cell', () => {
    const { baseElement } = render(<Table pxtable={pxTable} isMobile={false} />);
    // Find a leaf header cell (last header row th with data-col)
    const leafHeaders = baseElement.querySelectorAll('thead tr:last-child th[data-col]');
    expect(leafHeaders.length).toBeGreaterThan(0);
    const targetCol = leafHeaders[0].getAttribute('data-col');
    // Simulate mouseover on the header cell
    fireEvent.mouseOver(leafHeaders[0]);
    // All data cells in that column should have .colHover
    const highlightedCells = baseElement.querySelectorAll(`td[data-col="${targetCol}"].colHover`);
    expect(highlightedCells.length).toBeGreaterThan(0);
    // Header cell itself should NOT have .colHover
    expect(leafHeaders[0].classList.contains('colHover')).toBe(false);
  });

  it('removes highlight when mouse moves to stub cell', () => {
    const { baseElement } = render(<Table pxtable={pxTable} isMobile={false} />);
    const leafHeaders = baseElement.querySelectorAll('thead tr:last-child th[data-col]');
    const targetCol = leafHeaders[0].getAttribute('data-col');
    fireEvent.mouseOver(leafHeaders[0]);
    // Highlight should be present
    expect(baseElement.querySelectorAll(`td[data-col="${targetCol}"].colHover`).length).toBeGreaterThan(0);
    // Find a stub cell
    const stubCell = baseElement.querySelector('th.stub');
    expect(stubCell).toBeTruthy();
    fireEvent.mouseOver(stubCell!);
    // Highlight should be gone
    expect(baseElement.querySelectorAll('.colHover').length).toBe(0);
  });

  it('removes highlight when mouse moves to emptyTableData cell', () => {
    const { baseElement } = render(<Table pxtable={pxTable} isMobile={false} />);
    const leafHeaders = baseElement.querySelectorAll('thead tr:last-child th[data-col]');
    const targetCol = leafHeaders[0].getAttribute('data-col');
    fireEvent.mouseOver(leafHeaders[0]);
    // Highlight should be present
    expect(baseElement.querySelectorAll(`td[data-col="${targetCol}"].colHover`).length).toBeGreaterThan(0);
    // Find the emptyTableData cell
    const emptyCell = baseElement.querySelector('.emptyTableData');
    expect(emptyCell).toBeTruthy();
    fireEvent.mouseOver(emptyCell!);
    // Highlight should be gone
    expect(baseElement.querySelectorAll('.colHover').length).toBe(0);
  });

  it('does not highlight any cells when hovering stub or emptyTableData', () => {
    const { baseElement } = render(<Table pxtable={pxTable} isMobile={false} />);
    // Find a stub cell
    const stubCell = baseElement.querySelector('th.stub');
    expect(stubCell).toBeTruthy();
    fireEvent.mouseOver(stubCell!);
    expect(baseElement.querySelectorAll('.colHover').length).toBe(0);
    // Find the emptyTableData cell
    const emptyCell = baseElement.querySelector('.emptyTableData');
    expect(emptyCell).toBeTruthy();
    fireEvent.mouseOver(emptyCell!);
    expect(baseElement.querySelectorAll('.colHover').length).toBe(0);
  });
});

});
