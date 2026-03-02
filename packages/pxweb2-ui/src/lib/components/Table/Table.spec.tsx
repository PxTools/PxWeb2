import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, it, expect } from 'vitest';
import Table from './Table';
import { pxTable } from './testData';

describe('Table', () => {
  it('should render successfully desktop', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Table pxtable={pxTable} isMobile={false} />
      </MemoryRouter>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render successfully mobile', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Table pxtable={pxTable} isMobile={true} />
      </MemoryRouter>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should have a th header named 1968', () => {
    const { baseElement } = render(
      <MemoryRouter>
        <Table pxtable={pxTable} isMobile={false} />
      </MemoryRouter>,
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
      <MemoryRouter>
        <Table pxtable={pxTable} isMobile={false} />
      </MemoryRouter>,
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
});

describe('Table suppressNullRows', () => {
  // Use pxTable from testData as base and override cube for each test

  function getPxTableWithCube(cube: {
    R_1:
      | {
          '1': {
            '1': { '1': { '1968': { value: number; formattedValue: string } } };
          };
        }
      | {
          '1': {
            '1': { '1': { '1968': { value: number; formattedValue: string } } };
          };
        }
      | {
          '1': {
            '1': { '1': { '1968': { value: number; formattedValue: string } } };
          };
        };
  }) {
    return {
      ...pxTable,
      data: {
        ...pxTable.data,
        cube,
      },
    };
  }

  it('suppresses row with only zero values when suppressNullRows=true', () => {
    const table = getPxTableWithCube({
      R_1: {
        '1': { '1': { '1': { '1968': { value: 0, formattedValue: '0' } } } },
      },
    });
    const { container } = render(
      <MemoryRouter>
        <Table pxtable={table} isMobile={false} suppressNullRows={true} />
      </MemoryRouter>,
    );
    const td = container.querySelector('td');
    expect(td).not.toBeNull();
    expect(td?.textContent).toBe('');
  });

  it('renders row with only zero values when suppressNullRows=false', () => {
    const table = getPxTableWithCube({
      R_1: {
        '1': { '1': { '1': { '1968': { value: 0, formattedValue: '0' } } } },
      },
    });
    const { container } = render(
      <MemoryRouter>
        <Table pxtable={table} isMobile={false} suppressNullRows={false} />
      </MemoryRouter>,
    );
    expect(container.querySelector('td')?.textContent).toBe('');
  });
});
