import { afterEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { SkipToTarget } from './SkipToTarget';

const STICKY_SKIP_OFFSET_CSS_VAR = '--px-skip-to-main-sticky-offset';

vi.mock('react-router', () => ({
  useLocation: () => ({ pathname: '/en/table/123' }),
  useSearchParams: () => [new URLSearchParams('foo=bar')],
}));

describe('SkipToTarget', () => {
  afterEach(() => {
    document.body.style.removeProperty(STICKY_SKIP_OFFSET_CSS_VAR);
  });

  it('sets sticky offset css var when withStickyHeaderOffset is true', () => {
    const { unmount } = render(
      <SkipToTarget withStickyHeaderOffset targetId={''} />,
    );

    expect(
      document.body.style.getPropertyValue(STICKY_SKIP_OFFSET_CSS_VAR),
    ).toBe('80px');

    unmount();

    expect(
      document.body.style.getPropertyValue(STICKY_SKIP_OFFSET_CSS_VAR),
    ).toBe('');
  });

  it('does not set sticky offset css var when withStickyHeaderOffset is false', () => {
    render(<SkipToTarget targetId={''} />);

    expect(
      document.body.style.getPropertyValue(STICKY_SKIP_OFFSET_CSS_VAR),
    ).toBe('');
  });
});
