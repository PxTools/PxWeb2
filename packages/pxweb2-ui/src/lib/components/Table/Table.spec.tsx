import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Table, { shouldUseDesktopVirtualization } from './Table';
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

  it('should render table headers on desktop', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    const ths = baseElement.querySelectorAll('th');
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

  it('should use virtualization only above threshold', () => {
    expect(shouldUseDesktopVirtualization(20, 20)).toBe(false);
    expect(shouldUseDesktopVirtualization(40, 25)).toBe(true);
  });

  it('should use virtualization for very large tables', () => {
    expect(shouldUseDesktopVirtualization(1000, 1000)).toBe(true);
  });
});
