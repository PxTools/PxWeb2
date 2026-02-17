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

  it('should use virtualization only above threshold when viewport exists', () => {
    expect(shouldUseDesktopVirtualization(20, 20, true)).toBe(false);
    expect(shouldUseDesktopVirtualization(40, 25, true)).toBe(true);
  });

  it('should not use virtualization without viewport', () => {
    expect(shouldUseDesktopVirtualization(1000, 1000, false)).toBe(false);
  });
});
