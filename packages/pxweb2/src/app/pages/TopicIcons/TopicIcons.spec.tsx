// TopicIcons.test.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, expect } from 'vitest';
import { TopicIcons } from './TopicIcons';

// Mock hook
vi.mock('../../util/hooks/useTopicIcons', () => ({
  useTopicIcons: () => [
    {
      id: 'al',
      fileName: 'LabourMarketAndEarnings.svg',
      medium: <svg data-testid="icon-svg-1" />,
    },
    {
      id: 'va',
      fileName: 'Elections.svg',
      medium: <svg data-testid="icon-svg-2" />,
    },
  ],
}));

describe('TopicIcons', () => {
  it('renders all icons from the hook', () => {
    render(<TopicIcons />);
    const icons = screen.getAllByTestId(/icon-svg-/);
    expect(icons).toHaveLength(2);
  });

  it('renders file names correctly', () => {
    render(<TopicIcons />);
    expect(screen.getByText('LabourMarketAndEarnings.svg')).toBeInTheDocument();
    expect(screen.getByText('Elections.svg')).toBeInTheDocument();
  });
});
