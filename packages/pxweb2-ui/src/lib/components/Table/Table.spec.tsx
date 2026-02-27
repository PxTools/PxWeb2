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
