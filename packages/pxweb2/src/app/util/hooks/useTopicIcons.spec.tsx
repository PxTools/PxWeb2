// useTopicIcons.test.tsx
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { vi, expect, Mock } from 'vitest';

import { useTopicIcons } from './useTopicIcons';

global.fetch = vi.fn();

describe('useTopicIcons hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('fetches and returns topic icons', async () => {
    const mockData = {
      '1': 'icon1.svg',
      '2': 'icon2.svg',
    };

    (fetch as Mock).mockResolvedValueOnce({
      json: async () => mockData,
    });

    const { result } = renderHook(() => useTopicIcons());

    await waitFor(() => {
      expect(result.current.length).toBe(2);
    });

    expect(result.current[0]).toMatchObject({
      id: '1',
      fileName: 'icon1.svg',
    });

    expect(result.current[1]).toMatchObject({
      id: '2',
      fileName: 'icon2.svg',
    });

    const medium = result.current[0].medium;
    const small = result.current[0].small;

    if (React.isValidElement(medium) && React.isValidElement(small)) {
      const mediumElement = medium as React.ReactElement<
        React.ImgHTMLAttributes<HTMLImageElement>
      >;
      const smallElement = small as React.ReactElement<
        React.ImgHTMLAttributes<HTMLImageElement>
      >;

      expect(mediumElement.props.src).toBe('/icons/topic/icon1.svg');
      expect(smallElement.props.src).toBe('/icons/topic/small/icon1.svg');
    } else {
      throw new Error('medium or small is not a valid React element');
    }
  });

  it('handles fetch errors gracefully', async () => {
    (fetch as Mock).mockRejectedValueOnce(new Error('Network error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useTopicIcons());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      'Kunne ikke laste ikon-mapping:',
      expect.any(Error),
    );

    consoleSpy.mockRestore();
  });
});
