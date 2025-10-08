// TopicIcons.spec.tsx
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, describe, it, beforeEach, afterEach, expect, Mock } from 'vitest';
import { TopicIcons } from './TopicIcons';

describe('TopicIcons', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ['LabourMarketAndEarnings.svg', 'Elections.svg'],
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders all icons returned by the manifest', async () => {
    render(<TopicIcons />);

    const imgs = await screen.findAllByRole('img');
    expect(imgs).toHaveLength(2);
    expect(screen.getByText('LabourMarketAndEarnings.svg')).toBeInTheDocument();
    expect(screen.getByText('Elections.svg')).toBeInTheDocument();
  });

  it('shows "No icons found" when the manifest is empty', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });
    render(<TopicIcons />);

    const msg = await screen.findByText(/No icons found/i);
    expect(msg).toBeInTheDocument();
  });

  it('shows "No icons found" if fetch fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());

    (fetch as Mock).mockRejectedValueOnce(new Error('boom'));
    render(<TopicIcons />);

    const msg = await screen.findByText(/No icons found/i);
    expect(msg).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Could not load icon list: boom',
    );

    consoleErrorSpy.mockRestore();
  });
});
