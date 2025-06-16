import { render } from '@testing-library/react';
import { ActionItemIcon } from './ActionItemIcon';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

describe('ActionItemIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ActionItemIcon largeIconName="Table" />);
    expect(baseElement).toBeTruthy();
  });
  it('should return null if icon does not exist', () => {
    const { container } = render(
      <ActionItemIcon largeIconName="NonExistentIcon" />,
    );
    expect(container.firstChild).toBeNull();
  });
  it('should set the aria-label attribute when provided', () => {
    const ariaLabel = 'Test Icon';
    const { getByLabelText } = render(
      <ActionItemIcon largeIconName="Table" ariaLabel={ariaLabel} />,
    );
    expect(getByLabelText(ariaLabel)).toBeInTheDocument();
  });
});
